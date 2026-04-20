import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../s3-service.js', () => ({
  putObjectToS3: vi.fn(),
  getObjectFromS3ByKey: vi.fn(),
  deleteObjectFromS3: vi.fn()
}))

vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }))
}))

vi.mock('../../config.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'tdsSync') {
        return {
          lock: {
            key: 'locks/tds-sync/lease.lock',
            ttlMs: 300000,
            failOpen: true
          }
        }
      }

      return {}
    })
  }
}))

const { putObjectToS3, getObjectFromS3ByKey, deleteObjectFromS3 } =
  await import('../s3-service.js')
const { config } = await import('../../config.js')
const { executeWithTdsSyncLock } = await import('./tds-sync-lock.js')

const LOCK_KEY = 'locks/tds-sync/lease.lock'
const LOCK_DEFAULT_TTL_MS = 300000
const LOCK_HELD_FOR_MS = 60000
const STALE_OWNER = 'stale-owner'
const S3_UNAVAILABLE_ERROR_MESSAGE = 'S3 unavailable'

function mockDefaultLockConfig() {
  config.get.mockImplementation((key) => {
    if (key === 'tdsSync') {
      return {
        lock: {
          key: LOCK_KEY,
          ttlMs: 300000,
          failOpen: true
        }
      }
    }

    return {}
  })
}

function setFailOpenValue(failOpen) {
  config.get.mockImplementation((key) => {
    if (key === 'tdsSync') {
      return {
        lock: {
          key: LOCK_KEY,
          ttlMs: 300000,
          failOpen
        }
      }
    }

    return {}
  })
}

function buildPreconditionFailedError() {
  const error = new Error('Precondition failed')
  error.name = 'PreconditionFailed'
  error.$metadata = { httpStatusCode: 412 }
  return error
}

function buildS3NoSuchKeyError() {
  const error = new Error('No such key')
  error.name = 'NoSuchKey'
  return error
}

function buildS3MetadataNotFoundError() {
  return {
    $metadata: { httpStatusCode: 404 }
  }
}

function buildMetadataPreconditionFailedError() {
  return {
    $metadata: { httpStatusCode: 412 }
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
  mockDefaultLockConfig()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('tds-sync-lock acquire and release paths', () => {
  it('acquires and releases lock around sync execution', async () => {
    let ownerId

    putObjectToS3.mockImplementation(async ({ metadata }) => {
      if (metadata?.ownerid) {
        ownerId = metadata.ownerid
      }
      return { ETag: 'etag' }
    })

    getObjectFromS3ByKey.mockResolvedValue({
      Metadata: {
        ownerid: 'placeholder'
      }
    })

    const syncFunction = vi.fn().mockResolvedValue({ success: true })
    const runPromise = executeWithTdsSyncLock(syncFunction)

    await vi.waitFor(() => {
      expect(ownerId).toBeDefined()
    })

    getObjectFromS3ByKey.mockResolvedValue({
      Metadata: {
        ownerid: ownerId
      }
    })

    const result = await runPromise

    expect(result).toEqual({ success: true })
    expect(syncFunction).toHaveBeenCalledTimes(1)
    expect(deleteObjectFromS3).toHaveBeenCalledWith(LOCK_KEY)
  })
})

describe('tds-sync-lock lock-held behavior', () => {
  it('skips sync when lock is currently held by another instance', async () => {
    putObjectToS3.mockRejectedValueOnce(buildPreconditionFailedError())

    getObjectFromS3ByKey.mockResolvedValue({
      Metadata: {
        ownerid: 'other-instance',
        expiresat: String(Date.now() + LOCK_HELD_FOR_MS)
      }
    })

    const syncFunction = vi.fn().mockResolvedValue({ success: true })
    const result = await executeWithTdsSyncLock(syncFunction)

    expect(result.skipped).toBe(true)
    expect(syncFunction).not.toHaveBeenCalled()
    expect(deleteObjectFromS3).not.toHaveBeenCalled()
  })
})

describe('tds-sync-lock stale takeover success paths', () => {
  it('takes over stale lock and executes sync', async () => {
    let ownerId

    putObjectToS3
      .mockRejectedValueOnce(buildPreconditionFailedError())
      .mockImplementation(async ({ metadata }) => {
        if (metadata?.ownerid) {
          ownerId = metadata.ownerid
        }
        return { ETag: 'etag' }
      })

    getObjectFromS3ByKey
      .mockResolvedValueOnce({
        Metadata: {
          ownerid: STALE_OWNER,
          expiresat: String(Date.now() - 1000)
        }
      })
      .mockImplementation(async () => ({
        Metadata: {
          ownerid: ownerId
        }
      }))

    const syncFunction = vi.fn().mockResolvedValue({ success: true })
    const result = await executeWithTdsSyncLock(syncFunction)

    expect(result).toEqual({ success: true })
    expect(syncFunction).toHaveBeenCalledTimes(1)
    expect(deleteObjectFromS3).toHaveBeenCalledWith(LOCK_KEY)
  })

  it('re-acquires lock when existing lock disappears after precondition failure', async () => {
    let ownerId

    putObjectToS3
      .mockRejectedValueOnce(buildPreconditionFailedError())
      .mockImplementation(async ({ metadata }) => {
        ownerId = metadata?.ownerid
        return { ETag: 'etag' }
      })

    getObjectFromS3ByKey
      .mockRejectedValueOnce(buildS3NoSuchKeyError())
      .mockResolvedValueOnce({
        Metadata: {
          ownerid: ownerId
        }
      })

    const syncFunction = vi.fn().mockResolvedValue({ success: true })
    const result = await executeWithTdsSyncLock(syncFunction)

    expect(result).toEqual({ success: true })
    expect(syncFunction).toHaveBeenCalledTimes(1)
  })
})

describe('tds-sync-lock stale takeover fallback paths', () => {
  it('returns skipped result when stale takeover re-acquire hits precondition failure', async () => {
    putObjectToS3
      .mockRejectedValueOnce(buildPreconditionFailedError())
      .mockRejectedValueOnce(buildPreconditionFailedError())

    getObjectFromS3ByKey.mockResolvedValue({
      Metadata: {
        ownerid: STALE_OWNER,
        expiresat: String(Date.now() - 1000)
      }
    })

    const syncFunction = vi.fn().mockResolvedValue({ success: true })
    const result = await executeWithTdsSyncLock(syncFunction)

    expect(result.skipped).toBe(true)
    expect(syncFunction).not.toHaveBeenCalled()
  })

  it('fails open when stale takeover re-acquire throws non-precondition error', async () => {
    putObjectToS3
      .mockRejectedValueOnce(buildPreconditionFailedError())
      .mockRejectedValueOnce(new Error(S3_UNAVAILABLE_ERROR_MESSAGE))

    getObjectFromS3ByKey.mockResolvedValue({
      Metadata: {
        ownerid: STALE_OWNER,
        expiresat: String(Date.now() - 1000)
      }
    })

    const syncFunction = vi.fn().mockResolvedValue({ success: true })
    const result = await executeWithTdsSyncLock(syncFunction)

    expect(result).toEqual({ success: true })
    expect(syncFunction).toHaveBeenCalledTimes(1)
  })
})

describe('tds-sync-lock branch edge cases', () => {
  it('treats metadata-only 404 as missing lock and re-acquires', async () => {
    let ownerId

    putObjectToS3
      .mockRejectedValueOnce(buildPreconditionFailedError())
      .mockImplementation(async ({ metadata }) => {
        ownerId = metadata?.ownerid
        return { ETag: 'etag' }
      })

    getObjectFromS3ByKey
      .mockRejectedValueOnce(buildS3MetadataNotFoundError())
      .mockResolvedValueOnce({
        Metadata: {
          ownerid: ownerId
        }
      })

    const syncFunction = vi.fn().mockResolvedValue({ success: true })
    const result = await executeWithTdsSyncLock(syncFunction)

    expect(result).toEqual({ success: true })
    expect(syncFunction).toHaveBeenCalledTimes(1)
  })

  it('handles stale lock with missing owner and expiry metadata', async () => {
    let ownerId

    putObjectToS3
      .mockRejectedValueOnce(buildPreconditionFailedError())
      .mockImplementation(async ({ metadata }) => {
        ownerId = metadata?.ownerid
        return { ETag: 'etag' }
      })

    getObjectFromS3ByKey
      .mockResolvedValueOnce({
        Metadata: {}
      })
      .mockResolvedValueOnce({
        Metadata: {
          ownerid: ownerId
        }
      })

    const syncFunction = vi.fn().mockResolvedValue({ success: true })
    const result = await executeWithTdsSyncLock(syncFunction)

    expect(result).toEqual({ success: true })
    expect(syncFunction).toHaveBeenCalledTimes(1)
  })
})

describe('tds-sync-lock config and metadata fallback branches', () => {
  it('uses default lock config values when lock object is missing', async () => {
    config.get.mockImplementation((key) => {
      if (key === 'tdsSync') {
        return {}
      }

      if (key === 'tdsSync.lock.ttlMs') {
        return LOCK_DEFAULT_TTL_MS
      }

      return {}
    })

    let ownerId
    putObjectToS3.mockImplementation(async ({ metadata }) => {
      ownerId = metadata?.ownerid
      return { ETag: 'etag' }
    })

    getObjectFromS3ByKey.mockResolvedValue({
      Metadata: {
        ownerid: ownerId
      }
    })

    const syncFunction = vi.fn().mockResolvedValue({ success: true })
    const result = await executeWithTdsSyncLock(syncFunction)

    expect(result).toEqual({ success: true })
    expect(syncFunction).toHaveBeenCalledTimes(1)
  })

  it('treats metadata-only 412 as precondition failure when acquiring lock', async () => {
    putObjectToS3.mockRejectedValueOnce(buildMetadataPreconditionFailedError())

    getObjectFromS3ByKey.mockResolvedValue({
      Metadata: {
        ownerid: 'other-instance',
        expiresat: String(Date.now() + LOCK_HELD_FOR_MS)
      }
    })

    const syncFunction = vi.fn().mockResolvedValue({ success: true })
    const result = await executeWithTdsSyncLock(syncFunction)

    expect(result.skipped).toBe(true)
    expect(syncFunction).not.toHaveBeenCalled()
  })

  it('returns sync result when release lookup has no metadata object', async () => {
    putObjectToS3.mockResolvedValueOnce({ ETag: 'etag' })
    getObjectFromS3ByKey.mockResolvedValueOnce({})

    const syncFunction = vi.fn().mockResolvedValue({ success: true })
    const result = await executeWithTdsSyncLock(syncFunction)

    expect(result).toEqual({ success: true })
    expect(syncFunction).toHaveBeenCalledTimes(1)
  })
})

describe('tds-sync-lock error handling', () => {
  describe('acquisition failure behavior', () => {
    it('fails open when lock acquisition errors', async () => {
      putObjectToS3.mockRejectedValueOnce(
        new Error(S3_UNAVAILABLE_ERROR_MESSAGE)
      )

      const syncFunction = vi.fn().mockResolvedValue({ success: true })
      const result = await executeWithTdsSyncLock(syncFunction)

      expect(result).toEqual({ success: true })
      expect(syncFunction).toHaveBeenCalledTimes(1)
    })

    it('throws when failOpen is false and lock acquisition errors', async () => {
      setFailOpenValue(false)

      putObjectToS3.mockRejectedValueOnce(
        new Error(S3_UNAVAILABLE_ERROR_MESSAGE)
      )

      const syncFunction = vi.fn().mockResolvedValue({ success: true })

      await expect(executeWithTdsSyncLock(syncFunction)).rejects.toThrow(
        S3_UNAVAILABLE_ERROR_MESSAGE
      )
      expect(syncFunction).not.toHaveBeenCalled()
    })
  })

  describe('release failure behavior', () => {
    it('returns sync result when release fails after successful processing', async () => {
      putObjectToS3.mockResolvedValueOnce({ ETag: 'etag' })
      getObjectFromS3ByKey.mockRejectedValueOnce(
        new Error('release read failed')
      )

      const syncFunction = vi.fn().mockResolvedValue({ success: true })
      const result = await executeWithTdsSyncLock(syncFunction)

      expect(result).toEqual({ success: true })
      expect(syncFunction).toHaveBeenCalledTimes(1)
    })
  })
})
