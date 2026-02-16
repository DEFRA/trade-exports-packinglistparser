import { getFileFromS3, uploadJsonFileToS3 } from '../s3-service.js'
import { config } from '../../config.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { formatError } from '../../common/helpers/logging/error-logger.js'

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

    if (!mdmData) {
      throw new Error(`No data returned from MDM for ${cacheType}`)
    }

    // Cache the data in memory first
    cacheS3Data(mdmData)
    logger.info(`Successfully cached ${cacheType} data in memory from MDM`)

    // Try to upload to S3, but don't fail if S3 is unavailable
    try {
      await uploadJsonFileToS3(location, JSON.stringify(mdmData))
      logger.info(`Successfully uploaded ${cacheType} data to S3`)
    } catch (s3UploadError) {
      logger.warn(
        { error: s3UploadError.message },
        `Failed to upload ${cacheType} to S3, but data is cached in memory`
      )
    }
  } catch (mdmError) {
    logger.error(
      formatError(mdmError),
      `Failed to populate ${cacheType} from MDM (S3 error: ${s3Error?.message})`
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

  // Fall back to MDM on any S3 error
  // This includes NoSuchKey (file doesn't exist), empty data, and connection errors
  logger.info(
    { s3Error: result.error?.message },
    `S3 fetch failed, falling back to MDM for ${cacheType}`
  )

  try {
    await populateFromMDM(
      location,
      result.error,
      getMdmData,
      cacheS3Data,
      cacheType
    )
  } catch (mdmError) {
    logger.error(
      formatError(mdmError),
      `Unable to load ${cacheType} data from both S3 and MDM (attempts: ${result.attempt}, S3 error: ${result.error?.message}, file: ${s3FileName}, schema: ${s3Schema})`
    )

    throw new Error(
      `Unable to load ${cacheType} data after ${result.attempt} S3 attempts and MDM fallback: S3 error: ${result.error?.message}, MDM error: ${mdmError.message}`
    )
  }
}
