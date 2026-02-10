import { uploadToTdsBlob } from '../blob-storage/tds-blob-storage-service.js'
import {
  listS3Objects,
  getStreamFromS3,
  deleteFileFromS3
} from '../s3-service.js'
import { config } from '../../config.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import {
  buildSyncSuccessResult,
  buildSyncErrorResult
} from '../../common/helpers/sync-result-builders.js'
import { createEnabledCheck } from '../../common/helpers/sync-helpers.js'
import { streamToBuffer } from '../../common/helpers/stream-helpers.js'

const logger = createLogger()
const checkTdsSyncEnabled = createEnabledCheck(
  'tdsSync',
  'TDS synchronization',
  logger
)

/**
 * List documents from S3 in the configured schema folder
 * @param {string} schema - S3 schema/folder to search
 * @returns {Promise<Array>} Array of S3 object keys
 */
async function listDocumentsFromS3(schema) {
  logger.info({ schema }, 'Listing documents from S3 schema folder')

  const response = await listS3Objects(schema)

  if (!response.Contents || response.Contents.length === 0) {
    logger.info({ schema }, 'No documents found in S3 schema folder')
    return []
  }

  const keys = response.Contents.map((obj) => obj.Key)
  logger.info(
    { schema, count: keys.length },
    'Found documents in S3 schema folder'
  )

  return keys
}

/**
 * Transfer a single file from S3 to TDS Blob Storage
 * @param {string} s3Key - S3 object key
 * @returns {Promise<Object>} Transfer result
 */
async function transferFileToTds(s3Key) {
  logger.info({ s3Key }, 'Transferring file from S3 to TDS')

  try {
    // Download from S3
    const s3Response = await getStreamFromS3({
      filename: s3Key.split('/').pop().replace('.json', ''),
      schema: s3Key.split('/')[0]
    })

    // Convert stream to buffer
    const buffer = await streamToBuffer(s3Response.Body)

    // Determine content type and blob name
    const blobName = s3Key.split('/').pop()
    const contentType = s3Key.endsWith('.json')
      ? 'application/json'
      : 'application/octet-stream'

    // Upload to TDS
    const tdsResponse = await uploadToTdsBlob(blobName, buffer, {
      contentType
    })

    logger.info({ s3Key, blobName }, 'File uploaded to TDS successfully')

    // Delete from S3
    await deleteFileFromS3(s3Key)

    logger.info({ s3Key }, 'File deleted from S3 successfully')

    return {
      success: true,
      s3Key,
      blobName,
      etag: tdsResponse.ETag,
      size: buffer.length
    }
  } catch (error) {
    logger.error(
      {
        s3Key,
        error: {
          message: error.message,
          name: error.name
        }
      },
      'Failed to transfer file from S3 to TDS'
    )

    return {
      success: false,
      s3Key,
      error: error.message
    }
  }
}

/**
 * Synchronize documents from S3 to TDS Blob Storage
 * This function searches for documents in the configured S3 schema folder,
 * transfers them to TDS Blob Storage, and removes them from S3
 * @returns {Promise<Object>} Sync result with status and metadata
 */
export async function syncToTds() {
  const startTime = Date.now()

  const disabledResult = checkTdsSyncEnabled(startTime, config)
  if (disabledResult) {
    return disabledResult
  }

  logger.info('Starting TDS synchronization from S3')

  try {
    const { schemaVersion } = config.get('packingList')

    // List documents from S3
    const s3Keys = await listDocumentsFromS3(schemaVersion)

    if (s3Keys.length === 0) {
      const noFilesResult = buildSyncSuccessResult(startTime, {
        totalFiles: 0,
        successfulTransfers: 0,
        failedTransfers: 0,
        message: 'No files found to transfer'
      })
      logger.info(
        noFilesResult,
        'TDS synchronization completed - no files to transfer'
      )
      return noFilesResult
    }

    // Transfer each file
    const transfers = await Promise.all(
      s3Keys.map((key) => transferFileToTds(key))
    )

    const successful = transfers.filter((t) => t.success)
    const failed = transfers.filter((t) => !t.success)

    const result = buildSyncSuccessResult(startTime, {
      success: failed.length === 0,
      totalFiles: transfers.length,
      successfulTransfers: successful.length,
      failedTransfers: failed.length,
      transfers: {
        successful: successful.map((t) => ({
          s3Key: t.s3Key,
          blobName: t.blobName,
          etag: t.etag,
          size: t.size
        })),
        failed: failed.map((t) => ({
          s3Key: t.s3Key,
          error: t.error
        }))
      }
    })

    logger.info(result, 'Successfully completed TDS synchronization')
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
        duration: Date.now() - startTime
      },
      'Failed to synchronize S3 documents to TDS'
    )

    return buildSyncErrorResult(startTime, error)
  }
}
