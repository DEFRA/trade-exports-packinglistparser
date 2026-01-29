import { getIneligibleItems } from '../mdm-service.js'
import { uploadJsonFileToS3 } from '../s3-service.js'
import { config } from '../../config.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { setIneligibleItemsCache } from './ineligible-items-cache.js'

const logger = createLogger()

/**
 * Synchronize ineligible items from MDM to S3
 * This function retrieves the latest data from MDM, writes it to S3,
 * and updates the in-memory cache with the fresh data
 * @returns {Promise<Object>} Sync result with status and metadata
 */
export async function syncMdmToS3() {
  const startTime = new Date()

  // Check if MDM integration is enabled
  const { enabled: mdmEnabled } = config.get('mdmIntegration')

  if (!mdmEnabled) {
    const endTime = new Date()
    const result = {
      success: false,
      timestamp: endTime.toISOString(),
      duration: endTime - startTime,
      skipped: true,
      reason: 'MDM integration is disabled'
    }

    logger.info(
      result,
      'MDM synchronization skipped - MDM integration is disabled'
    )

    return result
  }

  logger.info('Starting MDM to S3 synchronization')

  try {
    // Step 1: Retrieve latest data from MDM
    logger.info('Retrieving ineligible items from MDM')
    const mdmData = await getIneligibleItems()

    if (!mdmData) {
      throw new Error('No data received from MDM')
    }

    // Step 2: Write data to S3
    const { s3FileName, s3Schema } = config.get('ineligibleItemsCache')
    const location = {
      filename: s3FileName,
      schema: s3Schema
    }

    logger.info(
      {
        location,
        dataSize: JSON.stringify(mdmData).length
      },
      'Writing ineligible items to S3'
    )

    const s3Response = await uploadJsonFileToS3(
      location,
      JSON.stringify(mdmData)
    )

    // Step 3: Update in-memory cache with fresh data
    logger.info('Updating in-memory cache with fresh data from MDM')
    setIneligibleItemsCache(mdmData)

    const endTime = new Date()
    const duration = endTime - startTime

    const result = {
      success: true,
      timestamp: endTime.toISOString(),
      duration,
      itemCount:
        mdmData?.ineligibleItems?.length ||
        (Array.isArray(mdmData) ? mdmData.length : 0),
      s3Location: location,
      etag: s3Response.ETag
    }

    logger.info(result, 'Successfully completed MDM to S3 synchronization')

    return result
  } catch (error) {
    const endTime = new Date()
    const duration = endTime - startTime

    logger.error(
      {
        error: {
          message: error.message,
          name: error.name,
          stack_trace: error.stack
        },
        timestamp: endTime.toISOString(),
        duration,
        s3DataPreserved: true,
        cacheUnchanged: true
      },
      'Failed to synchronize MDM to S3 - existing S3 data remains unchanged'
    )

    return {
      success: false,
      timestamp: endTime.toISOString(),
      duration,
      error: error.message,
      errorName: error.name
    }
  }
}
