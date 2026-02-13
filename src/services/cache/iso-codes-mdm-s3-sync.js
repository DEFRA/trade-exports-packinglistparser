import { getIsoCodes } from '../mdm-service.js'
import { uploadJsonFileToS3 } from '../s3-service.js'
import { config } from '../../config.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { setIsoCodesCache } from './iso-codes-cache.js'
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
 * @param {Array} mdmData - ISO codes data to write
 * @returns {Promise<Object>} S3 response
 */
async function writeMdmDataToS3(mdmData) {
  const { s3FileName, s3Schema } = config.get('isoCodesCache')
  const location = {
    filename: s3FileName,
    schema: s3Schema
  }

  logger.info(
    {
      location,
      dataSize: JSON.stringify(mdmData).length
    },
    'Writing ISO codes to S3'
  )

  const s3Response = await uploadJsonFileToS3(location, JSON.stringify(mdmData))

  logger.info('Updating in-memory ISO codes cache with fresh data from MDM')
  setIsoCodesCache(mdmData)

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
    logger.error(
      {
        error: {
          message: error.message,
          name: error.name,
          stack_trace: error.stack
        },
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        s3DataPreserved: true,
        cacheUnchanged: true
      },
      'Failed to synchronize ISO codes MDM to S3 - existing S3 data remains unchanged'
    )

    return buildSyncErrorResult(startTime, error)
  }
}
