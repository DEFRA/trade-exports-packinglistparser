import { getFileFromS3, uploadJsonFileToS3 } from '../s3-service.js'
import { config } from '../../config.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { getIneligibleItems } from '../mdm-service.js'

const logger = createLogger()

// In-memory cache for ineligible items
let ineligibleItemsCache = null

/**
 * Check if data is empty (null, empty array, or empty ineligibleItems)
 */
function isDataEmpty(data) {
  return (
    !data ||
    (Array.isArray(data) && data.length === 0) ||
    data.ineligibleItems?.length === 0
  )
}

/**
 * Extract item count from data
 */
function getItemCount(data) {
  return (
    data?.ineligibleItems?.length || (Array.isArray(data) ? data.length : 0)
  )
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
  ineligibleItemsCache = data
  const itemCount = getItemCount(data)
  logger.info({ itemCount }, 'Ineligible items cache loaded')
}

/**
 * Attempt to populate cache from MDM and upload to S3
 */
async function populateFromMDM(location, s3Error) {
  logger.info('Attempting to populate cache from MDM')
  try {
    const mdmData = await getIneligibleItems()

    if (mdmData) {
      await uploadJsonFileToS3(location, JSON.stringify(mdmData))
      cacheS3Data(mdmData)
    }
  } catch (mdmError) {
    logger.error({ error: mdmError.message }, 'Failed to populate from MDM')
    throw new Error(
      `Unable to load ineligible items from S3 or MDM: S3 error: ${s3Error?.message}, MDM error: ${mdmError.message}`
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
        logger.warn('S3 returned empty data, will attempt MDM fallback')
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
          'S3 file does not exist (NoSuchKey), will attempt MDM fallback'
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
        'Failed to fetch ineligible items from S3'
      )

      if (attempt <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
      }
    }
  }

  return { success: false, error: lastError, attempt }
}

/**
 * Initialize the ineligible items cache by fetching data from S3 with retry logic
 * @returns {Promise<void>}
 * @throws {Error} If unable to fetch data after all retry attempts
 */
export async function initializeIneligibleItemsCache() {
  const { enabled: mdmEnabled } = config.get('mdmIntegration')

  if (!mdmEnabled) {
    logger.info(
      'MDM integration is disabled, skipping ineligible items cache initialization'
    )
    return
  }

  const { s3FileName, s3Schema, maxRetries, retryDelayMs } = config.get(
    'ineligibleItemsCache'
  )

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
    'Unable to load ineligible items data'
  )

  throw new Error(
    `Unable to load ineligible items data after ${result.attempt} attempts: ${result.error?.message}`
  )
}

/**
 * Get the cached ineligible items data
 * @returns {Array|null} The cached ineligible items array or null if not initialized
 */
export function getIneligibleItemsCache() {
  return ineligibleItemsCache
}

/**
 * Set the ineligible items cache (useful for testing)
 * @param {Array} data - The ineligible items data to cache
 */
export function setIneligibleItemsCache(data) {
  ineligibleItemsCache = data
}

/**
 * Clear the ineligible items cache
 */
export function clearIneligibleItemsCache() {
  ineligibleItemsCache = null
}
