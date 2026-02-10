import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  initializeIsoCodesCache,
  getIsoCodesCache,
  setIsoCodesCache,
  clearIsoCodesCache
} from './iso-codes-cache.js'

// Mock dependencies
vi.mock('../s3-service.js', () => ({
  getFileFromS3: vi.fn(),
  uploadJsonFileToS3: vi.fn()
}))

vi.mock('../mdm-service.js', () => ({
  getIsoCodes: vi.fn()
}))

vi.mock('../../config.js', () => ({
  config: {
    get: vi.fn()
  }
}))

vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }))
}))

// Import mocked functions after vi.mock
const { getFileFromS3, uploadJsonFileToS3 } = await import('../s3-service.js')
const { getIsoCodes } = await import('../mdm-service.js')
const { config } = await import('../../config.js')

describe('iso-codes-cache', () => {
  const mockConfig = {
    s3FileName: 'iso-codes',
    s3Schema: 'cache',
    maxRetries: 3,
    retryDelayMs: 100
  }

  const mockMdmIntegration = {
    enabled: true
  }

  const mockIsoCodes = ['AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'GB', 'US']

  beforeEach(() => {
    vi.clearAllMocks()
    clearIsoCodesCache()
    config.get.mockImplementation((key) => {
      if (key === 'mdmIntegration') return mockMdmIntegration
      if (key === 'isoCodesCache') return mockConfig
      return {}
    })
  })

  afterEach(() => {
    clearIsoCodesCache()
  })

  describe('initializeIsoCodesCache', () => {
    it('should successfully fetch and cache ISO codes from S3', async () => {
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIsoCodes))

      await initializeIsoCodesCache()

      expect(getFileFromS3).toHaveBeenCalledWith({
        filename: 'iso-codes',
        schema: 'cache'
      })
      expect(getIsoCodesCache()).toEqual(mockIsoCodes)
    })

    it('should handle S3 location without schema', async () => {
      config.get.mockImplementation((key) => {
        if (key === 'mdmIntegration') return mockMdmIntegration
        if (key === 'isoCodesCache') return { ...mockConfig, s3Schema: null }
        return {}
      })
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIsoCodes))

      await initializeIsoCodesCache()

      expect(getFileFromS3).toHaveBeenCalledWith({
        filename: 'iso-codes',
        schema: null
      })
      expect(getIsoCodesCache()).toEqual(mockIsoCodes)
    })

    it('should retry on failure and succeed on second attempt', async () => {
      getFileFromS3
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(JSON.stringify(mockIsoCodes))

      await initializeIsoCodesCache()

      expect(getFileFromS3).toHaveBeenCalledTimes(2)
      expect(getIsoCodesCache()).toEqual(mockIsoCodes)
    })

    it('should retry configured number of times before failing', async () => {
      const error = new Error('S3 connection failed')
      getFileFromS3.mockRejectedValue(error)

      await expect(initializeIsoCodesCache()).rejects.toThrow(
        /Unable to load ISO codes data after 4 attempts/
      )

      // maxRetries = 3, so total attempts = 4 (initial + 3 retries)
      expect(getFileFromS3).toHaveBeenCalledTimes(4)
      expect(getIsoCodesCache()).toBeNull()
    })

    it('should wait between retry attempts', async () => {
      const error = new Error('Temporary failure')
      getFileFromS3.mockRejectedValue(error)

      const startTime = Date.now()

      try {
        await initializeIsoCodesCache()
      } catch (e) {
        // Expected to fail
      }

      const elapsed = Date.now() - startTime

      // Should have waited at least for the retry delays
      // With 3 retries and 100ms delay, minimum time is ~300ms
      expect(elapsed).toBeGreaterThanOrEqual(
        mockConfig.retryDelayMs * mockConfig.maxRetries - 50
      ) // Allow 50ms tolerance
      expect(getFileFromS3).toHaveBeenCalledTimes(mockConfig.maxRetries + 1)
    })

    it('should handle JSON parsing errors', async () => {
      getFileFromS3.mockResolvedValue('invalid json {')

      await expect(initializeIsoCodesCache()).rejects.toThrow()
      expect(getIsoCodesCache()).toBeNull()
    })

    it('should skip initialization when MDM integration is disabled', async () => {
      config.get.mockImplementation((key) => {
        if (key === 'mdmIntegration') return { enabled: false }
        if (key === 'isoCodesCache') return mockConfig
        return {}
      })

      await initializeIsoCodesCache()

      expect(getFileFromS3).not.toHaveBeenCalled()
      expect(getIsoCodesCache()).toBeNull()
    })

    it('should handle empty array from S3 by attempting MDM fallback', async () => {
      getFileFromS3.mockResolvedValue(JSON.stringify([]))
      getIsoCodes.mockResolvedValue(mockIsoCodes)
      uploadJsonFileToS3.mockResolvedValue({ ETag: 'test-etag' })

      await initializeIsoCodesCache()

      expect(getIsoCodes).toHaveBeenCalled()
      expect(uploadJsonFileToS3).toHaveBeenCalled()
      expect(getIsoCodesCache()).toEqual(mockIsoCodes)
    })

    it('should handle NoSuchKey error by fetching from MDM', async () => {
      const noSuchKeyError = new Error('NoSuchKey')
      noSuchKeyError.name = 'NoSuchKey'
      getFileFromS3.mockRejectedValue(noSuchKeyError)
      getIsoCodes.mockResolvedValue(mockIsoCodes)
      uploadJsonFileToS3.mockResolvedValue({ ETag: 'test-etag' })

      await initializeIsoCodesCache()

      expect(getIsoCodes).toHaveBeenCalled()
      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: 'iso-codes', schema: 'cache' },
        JSON.stringify(mockIsoCodes)
      )
      expect(getIsoCodesCache()).toEqual(mockIsoCodes)
    })

    it('should throw error if both S3 and MDM fail', async () => {
      const s3Error = new Error('S3 error')
      const mdmError = new Error('MDM error')
      getFileFromS3.mockRejectedValue(s3Error)
      getIsoCodes.mockRejectedValue(mdmError)

      await expect(initializeIsoCodesCache()).rejects.toThrow(
        /Unable to load ISO codes data after/
      )
    })
  })

  describe('getIsoCodesCache', () => {
    it('should return null initially', () => {
      expect(getIsoCodesCache()).toBeNull()
    })

    it('should return cached data after initialization', async () => {
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIsoCodes))

      await initializeIsoCodesCache()

      expect(getIsoCodesCache()).toEqual(mockIsoCodes)
    })
  })

  describe('setIsoCodesCache', () => {
    it('should set cache data', () => {
      const testData = ['GB', 'US', 'FR']
      setIsoCodesCache(testData)

      expect(getIsoCodesCache()).toEqual(testData)
    })

    it('should overwrite existing cache data', async () => {
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIsoCodes))
      await initializeIsoCodesCache()

      const newData = ['DE', 'IT', 'ES']
      setIsoCodesCache(newData)

      expect(getIsoCodesCache()).toEqual(newData)
    })
  })

  describe('clearIsoCodesCache', () => {
    it('should clear the cache', async () => {
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIsoCodes))
      await initializeIsoCodesCache()

      expect(getIsoCodesCache()).not.toBeNull()

      clearIsoCodesCache()

      expect(getIsoCodesCache()).toBeNull()
    })

    it('should not throw error when cache is already null', () => {
      expect(() => clearIsoCodesCache()).not.toThrow()
    })
  })
})
