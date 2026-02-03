import { getFileFromS3, uploadJsonFileToS3 } from '../s3-service.js'
import { config } from '../../config.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { getIneligibleItems } from '../mdm-service.js'

const logger = createLogger()

// In-memory cache for ineligible items
let ineligibleItemsCache = null

/**
 * Initialize the ineligible items cache by fetching data from S3 with retry logic
 * @returns {Promise<void>}
 * @throws {Error} If unable to fetch data after all retry attempts
 */
export async function initializeIneligibleItemsCache() {
  const { readEnabled, s3FileName, s3Schema, maxRetries, retryDelayMs } =
    config.get('ineligibleItemsCache')

  if (!readEnabled) {
    logger.info(
      'Ineligible items S3 read is disabled, skipping cache initialization'
    )
    return
  }

  const location = {
    filename: s3FileName,
    schema: s3Schema
  }

  let lastError = null
  let attempt = 0

  while (attempt <= maxRetries) {
    try {
      const fileContent = await getFileFromS3(location)
      const parsedData = JSON.parse(fileContent)

      // Check if S3 returned empty data - trigger MDM fallback immediately without retries
      if (
        !parsedData ||
        (Array.isArray(parsedData) && parsedData.length === 0) ||
        (parsedData.ineligibleItems && parsedData.ineligibleItems.length === 0)
      ) {
        logger.warn('S3 returned empty data, will attempt MDM fallback')
        const emptyError = new Error('S3 data is empty')
        lastError = emptyError
        break // Exit retry loop immediately for empty data
      }

      ineligibleItemsCache = parsedData
      const itemCount =
        parsedData?.ineligibleItems?.length ||
        (Array.isArray(parsedData) ? parsedData.length : 0)
      logger.info({ itemCount }, 'Ineligible items cache loaded')
      return
    } catch (error) {
      lastError = error

      // For NoSuchKey, don't retry - trigger MDM fallback immediately
      const isNoSuchKey =
        error?.name === 'NoSuchKey' || error?.Code === 'NoSuchKey'
      if (isNoSuchKey) {
        logger.warn(
          'S3 file does not exist (NoSuchKey), will attempt MDM fallback'
        )
        break // Exit retry loop immediately for missing file
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
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
      }
    }
  }

  // Try MDM as fallback for NoSuchKey or empty data
  const isNoSuchKey =
    lastError?.name === 'NoSuchKey' || lastError?.Code === 'NoSuchKey'
  const isEmptyData = lastError?.message === 'S3 data is empty'

  if (isNoSuchKey || isEmptyData) {
    logger.info('Attempting to populate cache from MDM')
    try {
      const mdmData = await getIneligibleItems()

      if (mdmData) {
        await uploadJsonFileToS3(location, JSON.stringify(mdmData))

        ineligibleItemsCache = mdmData
        const itemCount =
          mdmData?.ineligibleItems?.length ||
          (Array.isArray(mdmData) ? mdmData.length : 0)
        logger.info({ itemCount }, 'Cache populated from MDM')
        return
      }
    } catch (mdmError) {
      logger.error({ error: mdmError.message }, 'Failed to populate from MDM')
      throw new Error(
        `Unable to load ineligible items from S3 or MDM: S3 error: ${lastError?.message}, MDM error: ${mdmError.message}`
      )
    }
  }

  // All retries exhausted and MDM not applicable or unavailable
  logger.error(
    {
      error: lastError?.message,
      attempts: attempt,
      s3FileName,
      s3Schema
    },
    'Unable to load ineligible items data'
  )

  throw new Error(
    `Unable to load ineligible items data after ${attempt} attempts: ${lastError?.message}`
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
