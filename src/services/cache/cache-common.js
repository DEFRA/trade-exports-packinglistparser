import { getFileFromS3, uploadJsonFileToS3 } from '../s3-service.js'
import { config } from '../../config.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger()

/**
 * Check if error is a NoSuchKey error
 */
export function isNoSuchKeyError(error) {
  return error?.name === 'NoSuchKey' || error?.Code === 'NoSuchKey'
}

/**
 * Fetch from S3 with retry logic and handle results
 * @param {Object} location - S3 location (filename and schema)
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} retryDelayMs - Delay between retries in milliseconds
 * @param {Function} isDataEmpty - Function to check if data is empty
 * @param {Function} cacheS3Data - Function to cache the fetched data
 * @param {string} cacheType - Type of cache for logging (e.g., 'ISO codes', 'ineligible items')
 * @returns {Promise<Object>} Result object with success status
 */
export async function fetchFromS3WithRetry(
  location,
  maxRetries,
  retryDelayMs,
  isDataEmpty,
  cacheS3Data,
  cacheType
) {
  let lastError = null
  let attempt = 0

  while (attempt <= maxRetries) {
    try {
      const fileContent = await getFileFromS3(location)
      const parsedData = JSON.parse(fileContent)

      if (isDataEmpty(parsedData)) {
        logger.warn(
          `S3 returned empty ${cacheType} data, will attempt MDM fallback`
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
          `S3 ${cacheType} file does not exist (NoSuchKey), will attempt MDM fallback`
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
        `Failed to fetch ${cacheType} from S3`
      )

      if (attempt <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
      }
    }
  }

  return { success: false, error: lastError, attempt }
}

/**
 * Attempt to populate cache from MDM and upload to S3
 * @param {Object} location - S3 location (filename and schema)
 * @param {Error} s3Error - The S3 error that triggered MDM fallback
 * @param {Function} getMdmData - Function to fetch data from MDM
 * @param {Function} cacheS3Data - Function to cache the fetched data
 * @param {string} cacheType - Type of cache for logging (e.g., 'ISO codes', 'ineligible items')
 * @returns {Promise<void>}
 * @throws {Error} If unable to populate from MDM
 */
export async function populateFromMDM(
  location,
  s3Error,
  getMdmData,
  cacheS3Data,
  cacheType
) {
  logger.info(`Attempting to populate ${cacheType} cache from MDM`)
  try {
    const mdmData = await getMdmData()

    if (mdmData) {
      await uploadJsonFileToS3(location, JSON.stringify(mdmData))
      cacheS3Data(mdmData)
    }
  } catch (mdmError) {
    logger.error(
      { error: mdmError.message },
      `Failed to populate ${cacheType} from MDM`
    )
    throw new Error(
      `Unable to load ${cacheType} from S3 or MDM: S3 error: ${s3Error?.message}, MDM error: ${mdmError.message}`
    )
  }
}

/**
 * Generic cache initialization function
 * @param {string} configKey - Configuration key for cache settings
 * @param {Function} isDataEmpty - Function to check if data is empty
 * @param {Function} cacheS3Data - Function to cache the fetched data
 * @param {Function} getMdmData - Function to fetch data from MDM
 * @param {string} cacheType - Type of cache for logging (e.g., 'ISO codes', 'ineligible items')
 * @returns {Promise<void>}
 * @throws {Error} If unable to fetch data after all retry attempts
 */
export async function initializeCache(
  configKey,
  isDataEmpty,
  cacheS3Data,
  getMdmData,
  cacheType
) {
  const { enabled: mdmEnabled } = config.get('mdmIntegration')

  if (!mdmEnabled) {
    logger.info(
      `MDM integration is disabled, skipping ${cacheType} cache initialization`
    )
    return
  }

  const { s3FileName, s3Schema, maxRetries, retryDelayMs } =
    config.get(configKey)

  const location = {
    filename: s3FileName,
    schema: s3Schema
  }

  const result = await fetchFromS3WithRetry(
    location,
    maxRetries,
    retryDelayMs,
    isDataEmpty,
    cacheS3Data,
    cacheType
  )

  if (result.success) {
    return
  }

  const isNoSuchKey = isNoSuchKeyError(result.error)
  const isEmptyData = result.error?.message === 'S3 data is empty'

  if (isNoSuchKey || isEmptyData) {
    await populateFromMDM(
      location,
      result.error,
      getMdmData,
      cacheS3Data,
      cacheType
    )
    return
  }

  logger.error(
    {
      error: result.error?.message,
      attempts: result.attempt,
      s3FileName,
      s3Schema
    },
    `Unable to load ${cacheType} data`
  )

  throw new Error(
    `Unable to load ${cacheType} data after ${result.attempt} attempts: ${result.error?.message}`
  )
}
