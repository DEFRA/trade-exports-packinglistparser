import { getIsoCodes } from '../mdm-service.js'
import { uploadJsonFileToS3 } from '../s3-service.js'
import { config } from '../../config.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { formatError } from '../../common/helpers/logging/error-logger.js'
import {
  setIsoCodesCache,
  transformToSimpleIsoCodes
} from './iso-codes-cache.js'
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
 * Retrieve and validate MDM ISO codes data
 * @returns {Promise<Array>} ISO codes data
 */
async function retrieveMdmData() {
  logger.info('Retrieving ISO codes from MDM')
  const mdmData = await getIsoCodes()

  if (!mdmData) {
    throw new Error('No ISO codes data received from MDM')
  }

  return mdmData
}

/**
 * Write ISO codes MDM data to S3 and update cache
 * Performs COMPLETE REPLACEMENT (not merge) to ensure removed codes don't persist
 * Transforms MDM object format to simple string array before storage
 * This ensures S3 stores data in same format as data-iso-codes.json
 * @param {Array} mdmData - ISO codes data from MDM (object array)
 * @returns {Promise<Object>} S3 response
 */
async function writeMdmDataToS3(mdmData) {
  const { s3FileName, s3Schema } = config.get('isoCodesCache')
  const location = {
    filename: s3FileName,
    schema: s3Schema
  }

  // Transform MDM object array to simple string array
  // Format: ["AD", "AE", "AF", ...] - matches data-iso-codes.json
  // IMPORTANT: This completely replaces S3 content with latest MDM data
  // If MDM removed a country, it will be removed from S3 too
  const simplifiedData = transformToSimpleIsoCodes(mdmData)

  logger.info(
    `Writing ISO codes to S3 (filename: ${location.filename}, schema: ${location.schema}, dataSize: ${JSON.stringify(mdmData).length})`
  )

  const s3Response = await uploadJsonFileToS3(
    location,
    JSON.stringify(simplifiedData)
  )

  logger.info('Updating in-memory cache with fresh data (complete replacement)')
  setIsoCodesCache(simplifiedData)

  return { s3Response, location }
}

/**
 * Synchronize ISO codes from MDM to S3
 * This function retrieves the latest ISO codes data from MDM, writes it to S3,
 * and updates the in-memory cache with the fresh data
 * @returns {Promise<Object>} Sync result with status and metadata
 */
export async function syncIsoCodesMdmToS3() {
  const startTime = Date.now()

  const disabledResult = checkMdmEnabled(startTime, config)
  if (disabledResult) {
    return disabledResult
  }

  logger.info('Starting ISO codes MDM to S3 synchronization')

  try {
    const mdmData = await retrieveMdmData()
    const { s3Response, location } = await writeMdmDataToS3(mdmData)
    const result = buildSyncSuccessResult(startTime, {
      itemCount: Array.isArray(mdmData) ? mdmData.length : 0,
      s3Location: location,
      etag: s3Response.ETag
    })

    logger.info(
      result,
      'Successfully completed ISO codes MDM to S3 synchronization'
    )
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(
      formatError(error),
      `Failed to synchronize ISO codes MDM to S3 - existing S3 data remains unchanged (duration: ${duration}ms, timestamp: ${new Date().toISOString()})`
    )

    return buildSyncErrorResult(startTime, error)
  }
}
