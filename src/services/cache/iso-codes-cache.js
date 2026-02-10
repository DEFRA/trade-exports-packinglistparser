import { getFileFromS3, uploadJsonFileToS3 } from '../s3-service.js'
import { config } from '../../config.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { getIsoCodes } from '../mdm-service.js'

const logger = createLogger()

// In-memory cache for ISO codes
let isoCodesCache = null

/**
 * Check if data is empty (null, empty array)
 */
function isDataEmpty(data) {
  return !data || (Array.isArray(data) && data.length === 0)
}

/**
 * Extract item count from data
 */
function getItemCount(data) {
  return Array.isArray(data) ? data.length : 0
}

/**
 * Check if error is a NoSuchKey error
 */
function isNoSuchKeyError(error) {
  return error?.name === 'NoSuchKey' || error?.Code === 'NoSuchKey'
}

/**
 * Process successful S3 fetch
 */
function cacheS3Data(data) {
  isoCodesCache = data
  const itemCount = getItemCount(data)
  logger.info({ itemCount }, 'ISO codes cache loaded')
}

/**
 * Attempt to populate cache from MDM and upload to S3
 */
async function populateFromMDM(location, s3Error) {
  logger.info('Attempting to populate ISO codes cache from MDM')
  try {
    const mdmData = await getIsoCodes()

    if (mdmData) {
      await uploadJsonFileToS3(location, JSON.stringify(mdmData))
      cacheS3Data(mdmData)
    }
  } catch (mdmError) {
    logger.error(
      { error: mdmError.message },
      'Failed to populate ISO codes from MDM'
    )
    throw new Error(
      `Unable to load ISO codes from S3 or MDM: S3 error: ${s3Error?.message}, MDM error: ${mdmError.message}`
    )
  }
}

/**
 * Fetch from S3 with retry logic and handle results
 */
async function fetchFromS3WithRetry(location, maxRetries, retryDelayMs) {
  let lastError = null
  let attempt = 0

  while (attempt <= maxRetries) {
    try {
      const fileContent = await getFileFromS3(location)
      const parsedData = JSON.parse(fileContent)

      if (isDataEmpty(parsedData)) {
        logger.warn(
          'S3 returned empty ISO codes data, will attempt MDM fallback'
        )
        return {
          success: false,
          error: new Error('S3 data is empty'),
          attempt: attempt + 1
        }
      }

      cacheS3Data(parsedData)
      return { success: true }
    } catch (error) {
      lastError = error

      if (isNoSuchKeyError(error)) {
        logger.warn(
          'S3 ISO codes file does not exist (NoSuchKey), will attempt MDM fallback'
        )
        return { success: false, error, attempt: attempt + 1 }
      }

      attempt++

      logger.warn(
        {
          attempt,
          maxRetries: maxRetries + 1,
          error: error.message,
          willRetry: attempt <= maxRetries
        },
        'Failed to fetch ISO codes from S3'
      )

      if (attempt <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
      }
    }
  }

  return { success: false, error: lastError, attempt }
}

/**
 * Initialize the ISO codes cache by fetching data from S3 with retry logic
 * @returns {Promise<void>}
 * @throws {Error} If unable to fetch data after all retry attempts
 */
export async function initializeIsoCodesCache() {
  const { enabled: mdmEnabled } = config.get('mdmIntegration')

  if (!mdmEnabled) {
    logger.info(
      'MDM integration is disabled, skipping ISO codes cache initialization'
    )
    return
  }

  const { s3FileName, s3Schema, maxRetries, retryDelayMs } =
    config.get('isoCodesCache')

  const location = {
    filename: s3FileName,
    schema: s3Schema
  }

  const result = await fetchFromS3WithRetry(location, maxRetries, retryDelayMs)

  if (result.success) {
    return
  }

  const isNoSuchKey = isNoSuchKeyError(result.error)
  const isEmptyData = result.error?.message === 'S3 data is empty'

  if (isNoSuchKey || isEmptyData) {
    await populateFromMDM(location, result.error)
    return
  }

  logger.error(
    {
      error: result.error?.message,
      attempts: result.attempt,
      s3FileName,
      s3Schema
    },
    'Unable to load ISO codes data'
  )

  throw new Error(
    `Unable to load ISO codes data after ${result.attempt} attempts: ${result.error?.message}`
  )
}

/**
 * Get the cached ISO codes data
 * @returns {Array|null} The cached ISO codes array or null if not initialized
 */
export function getIsoCodesCache() {
  return isoCodesCache
}

/**
 * Set the ISO codes cache (useful for testing)
 * @param {Array} data - The ISO codes data to cache
 */
export function setIsoCodesCache(data) {
  isoCodesCache = data
}

/**
 * Clear the ISO codes cache
 */
export function clearIsoCodesCache() {
  isoCodesCache = null
}
