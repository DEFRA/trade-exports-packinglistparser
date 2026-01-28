import { getFileFromS3 } from '../s3-service.js'
import { config } from '../../config.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

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
      logger.info(
        {
          attempt: attempt + 1,
          maxRetries: maxRetries + 1,
          s3FileName,
          s3Schema
        },
        'Attempting to fetch ineligible items from S3'
      )

      const fileContent = await getFileFromS3(location)
      const parsedData = JSON.parse(fileContent)

      ineligibleItemsCache = parsedData
      const itemCount =
        parsedData?.ineligibleItems?.length ||
        (Array.isArray(parsedData) ? parsedData.length : 0)
      logger.info(
        { itemCount },
        'Successfully loaded ineligible items data into cache'
      )
      return
    } catch (error) {
      lastError = error
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

  // All retries exhausted
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
