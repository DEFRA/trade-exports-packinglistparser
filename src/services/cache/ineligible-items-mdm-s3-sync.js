import { getIneligibleItems } from '../mdm-service.js'
import { uploadJsonFileToS3 } from '../s3-service.js'
import { config } from '../../config.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { formatError } from '../../common/helpers/logging/error-logger.js'
import {
  setIneligibleItemsCache,
  deduplicateIneligibleItems
} from './ineligible-items-cache.js'
import {
  buildSyncSuccessResult,
  buildSyncErrorResult
} from '../../common/helpers/sync-result-builders.js'
import { createEnabledCheck } from '../../common/helpers/sync-helpers.js'

const logger = createLogger()
const checkMdmEnabled = createEnabledCheck(
  'mdmIntegration',
  'MDM integration',
  logger
)

/**
 * Transforms MDM data to match local file format by removing MDM-specific fields
 * @param {Array|Object} mdmData - Raw data from MDM (array or object with ineligibleItems)
 * @returns {Array|Object} Transformed data with only required fields (country_of_origin, commodity_code, type_of_treatment)
 */
function transformMdmData(mdmData) {
  const transformItem = (item) => {
    // eslint-disable-next-line camelcase
    const { id, last_modified, ...cleanItem } = item
    return cleanItem
  }

  // Handle object format: {ineligibleItems: [...], ...otherProps}
  if (mdmData?.ineligibleItems && Array.isArray(mdmData.ineligibleItems)) {
    return {
      ...mdmData,
      ineligibleItems: mdmData.ineligibleItems.map(transformItem)
    }
  }

  // Handle array format: [...]
  if (Array.isArray(mdmData)) {
    return mdmData.map(transformItem)
  }

  return mdmData
}

/**
 * Retrieve and validate MDM data
 * @returns {Promise<Object>} MDM data
 */
async function retrieveMdmData() {
  logger.info('Retrieving ineligible items from MDM')
  const mdmData = await getIneligibleItems()

  if (!mdmData) {
    throw new Error('No data received from MDM')
  }

  return mdmData
}

/**
 * Write MDM data to S3 and update cache
 * Performs COMPLETE REPLACEMENT (not merge) to ensure removed items don't persist
 * Deduplicates data before storing to ensure no duplicates in S3 or cache
 * @param {Object} mdmData - Data to write (fresh from MDM)
 * @returns {Promise<Object>} S3 response
 */
async function writeMdmDataToS3(mdmData) {
  const { s3FileName, s3Schema } = config.get('ineligibleItemsCache')
  const location = {
    filename: s3FileName,
    schema: s3Schema
  }

  // Transform MDM data to match local file format (remove id and last_modified)
  const transformedData = transformMdmData(mdmData)

  // Deduplicate before storing to S3
  // IMPORTANT: This completely replaces S3 content with latest MDM data
  // If MDM removed an item, it will be removed from S3 too
  let deduplicatedData
  if (transformedData?.ineligibleItems) {
    deduplicatedData = {
      ...transformedData,
      ineligibleItems: deduplicateIneligibleItems(
        transformedData.ineligibleItems
      )
    }
  } else if (Array.isArray(transformedData)) {
    deduplicatedData = deduplicateIneligibleItems(transformedData)
  } else {
    deduplicatedData = transformedData
  }

  const originalCount =
    mdmData?.ineligibleItems?.length ||
    (Array.isArray(mdmData) ? mdmData.length : 0)
  const deduplicatedCount =
    deduplicatedData?.ineligibleItems?.length ||
    (Array.isArray(deduplicatedData) ? deduplicatedData.length : 0)

  logger.info(
    {
      location,
      dataSize: JSON.stringify(deduplicatedData).length,
      originalCount,
      deduplicatedCount,
      duplicatesRemoved: originalCount - deduplicatedCount
    },
    'Writing ineligible items to S3 (complete replacement, not merge)'
  )

  const s3Response = await uploadJsonFileToS3(
    location,
    JSON.stringify(deduplicatedData)
  )

  logger.info('Updating in-memory cache with fresh data (complete replacement)')
  setIneligibleItemsCache(deduplicatedData)

  return { s3Response, location }
}

/**
 * Synchronize ineligible items from MDM to S3
 * This function retrieves the latest data from MDM, writes it to S3,
 * and updates the in-memory cache with the fresh data
 * @returns {Promise<Object>} Sync result with status and metadata
 */
export async function syncMdmToS3() {
  const startTime = Date.now()

  const disabledResult = checkMdmEnabled(startTime, config)
  if (disabledResult) {
    return disabledResult
  }

  logger.info('Starting MDM to S3 synchronization')

  try {
    const mdmData = await retrieveMdmData()
    const { s3Response, location } = await writeMdmDataToS3(mdmData)
    const result = buildSyncSuccessResult(startTime, {
      itemCount:
        mdmData?.ineligibleItems?.length ||
        (Array.isArray(mdmData) ? mdmData.length : 0),
      s3Location: location,
      etag: s3Response.ETag
    })

    logger.info(result, 'Successfully completed MDM to S3 synchronization')
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(
      formatError(error),
      `Failed to synchronize MDM to S3 - existing S3 data remains unchanged (duration: ${duration}ms, timestamp: ${new Date().toISOString()})`
    )

    return buildSyncErrorResult(startTime, error)
  }
}
