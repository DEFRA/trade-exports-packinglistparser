import { hostname } from 'node:os'
import { config } from '../../config.js'
import {
  putObjectToS3,
  getObjectFromS3ByKey,
  deleteObjectFromS3
} from '../s3-service.js'
import { STATUS_CODES } from '../../routes/statuscodes.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { formatError } from '../../common/helpers/logging/error-logger.js'

const logger = createLogger()

const INSTANCE_ID = `${hostname()}-${process.pid}-${Date.now()}`

const LOCK_HELD_RESULT = {
  success: true,
  skipped: true,
  reason: 'TDS synchronization lock is held by another instance'
}

/**
 * Build lock payload and metadata from current runtime values
 * @param {Object} options - Lock options
 * @param {number} options.now - Current epoch milliseconds
 * @param {number} options.ttlMs - Lease duration in milliseconds
 * @param {string} options.ownerId - Lock owner identifier
 * @returns {Object} Payload and metadata for S3 lock object
 */
function buildLockState({ now, ttlMs, ownerId }) {
  const expiresAt = now + ttlMs

  return {
    body: JSON.stringify({
      ownerId,
      acquiredAt: now,
      expiresAt
    }),
    metadata: {
      ownerid: ownerId,
      acquiredat: String(now),
      expiresat: String(expiresAt)
    },
    expiresAt
  }
}

/**
 * Read TDS lock config with safe defaults
 * @returns {{key: string, ttlMs: number, failOpen: boolean}}
 */
function getTdsLockConfig() {
  const tdsSyncConfig = config.get('tdsSync')
  const lockConfig = tdsSyncConfig.lock ?? {}

  return {
    key: lockConfig.key ?? 'locks/tds-sync/lease.lock',
    ttlMs: lockConfig.ttlMs ?? config.get('tdsSync.lock.ttlMs'),
    failOpen: lockConfig.failOpen !== false
  }
}

/**
 * Check if S3 error represents lock precondition failure
 * @param {Error} error - Error to classify
 * @returns {boolean} True when lock already exists
 */
function isPreconditionFailed(error) {
  return (
    error?.name === 'PreconditionFailed' ||
    error?.$metadata?.httpStatusCode === STATUS_CODES.PRECONDITION_FAILED
  )
}

/**
 * Check if S3 error represents missing object
 * @param {Error} error - Error to classify
 * @returns {boolean} True when object does not exist
 */
function isNotFound(error) {
  return (
    error?.name === 'NoSuchKey' ||
    error?.name === 'NotFound' ||
    error?.$metadata?.httpStatusCode === STATUS_CODES.NOT_FOUND
  )
}

/**
 * Create lock object if missing using conditional write
 * @param {Object} options - Acquisition options
 * @param {string} options.key - Lock object key
 * @param {string} options.ownerId - Owner identifier
 * @param {number} options.ttlMs - Lease duration in milliseconds
 * @returns {Promise<boolean>} True when lock acquired
 */
async function tryAcquireLock({ key, ownerId, ttlMs }) {
  const lockState = buildLockState({
    now: Date.now(),
    ttlMs,
    ownerId
  })

  await putObjectToS3({
    key,
    body: lockState.body,
    contentType: 'application/json',
    metadata: lockState.metadata,
    ifNoneMatch: '*'
  })

  return true
}

/**
 * Read current lock metadata
 * @param {string} key - Lock object key
 * @returns {Promise<Object|null>} Current lock metadata or null when missing
 */
async function getCurrentLock(key) {
  try {
    const lockObject = await getObjectFromS3ByKey(key)
    return lockObject.Metadata ?? {}
  } catch (error) {
    if (isNotFound(error)) {
      return null
    }

    throw error
  }
}

/**
 * Release lock if currently owned by this process
 * @param {Object} options - Release options
 * @param {string} options.key - Lock object key
 * @param {string} options.ownerId - Owner identifier
 * @returns {Promise<boolean>} True when lock was released
 */
async function releaseLock({ key, ownerId }) {
  const currentLock = await getCurrentLock(key)

  if (currentLock?.ownerid !== ownerId) {
    return false
  }

  await deleteObjectFromS3(key)
  logger.info(`Released TDS synchronization lock (lockKey: ${key})`)
  return true
}

/**
 * Attempt to acquire lock including stale lock takeover handling
 * @param {Object} options - Acquisition options
 * @param {string} options.key - Lock object key
 * @param {string} options.ownerId - Owner identifier
 * @param {number} options.ttlMs - Lease duration in milliseconds
 * @returns {Promise<boolean>} True when lock acquired
 */
async function acquireLockWithStaleTakeover({ key, ownerId, ttlMs }) {
  try {
    await tryAcquireLock({ key, ownerId, ttlMs })
    logger.info(`Acquired TDS synchronization lock (lockKey: ${key})`)
    return true
  } catch (error) {
    if (!isPreconditionFailed(error)) {
      throw error
    }
  }

  const currentLock = await getCurrentLock(key)

  if (!currentLock) {
    await tryAcquireLock({ key, ownerId, ttlMs })
    logger.info(`Acquired TDS synchronization lock (lockKey: ${key})`)
    return true
  }

  const expiresAt = Number(currentLock.expiresat ?? 0)

  if (!Number.isFinite(expiresAt) || expiresAt > Date.now()) {
    return false
  }

  logger.warn(
    `Detected stale TDS synchronization lock, attempting takeover (lockKey: ${key}, previousOwner: ${currentLock.ownerid ?? 'unknown'})`
  )

  await deleteObjectFromS3(key)

  try {
    await tryAcquireLock({ key, ownerId, ttlMs })
    logger.info(
      `Acquired TDS synchronization lock via stale takeover (lockKey: ${key})`
    )
    return true
  } catch (error) {
    if (isPreconditionFailed(error)) {
      return false
    }

    throw error
  }
}

/**
 * Execute TDS sync function while coordinated by an S3 lease lock
 * @param {Function} syncFunction - TDS sync function to execute
 * @returns {Promise<Object>} Sync function result or lock-skipped result
 */
export async function executeWithTdsSyncLock(syncFunction) {
  const lockConfig = getTdsLockConfig()

  let lockAcquired = false

  try {
    lockAcquired = await acquireLockWithStaleTakeover({
      key: lockConfig.key,
      ownerId: INSTANCE_ID,
      ttlMs: lockConfig.ttlMs
    })
  } catch (error) {
    if (!lockConfig.failOpen) {
      throw error
    }

    logger.warn(
      formatError(error),
      `TDS synchronization lock acquisition failed - continuing without lock (lockKey: ${lockConfig.key})`
    )
    return syncFunction()
  }

  if (lockAcquired) {
    logger.info(`TDS synchronization lock is held (lockKey: ${lockConfig.key})`)
  } else {
    logger.info(
      `Skipping scheduled TDS synchronization because lock is currently held (lockKey: ${lockConfig.key})`
    )
    return LOCK_HELD_RESULT
  }

  try {
    return await syncFunction()
  } finally {
    try {
      await releaseLock({ key: lockConfig.key, ownerId: INSTANCE_ID })
    } catch (error) {
      logger.warn(
        formatError(error),
        `Failed to release TDS synchronization lock (lockKey: ${lockConfig.key})`
      )
    }
  }
}
