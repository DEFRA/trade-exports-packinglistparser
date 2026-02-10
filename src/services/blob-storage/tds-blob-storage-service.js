import { createBlobStorageService } from './blob-storage-service.js'
import { config } from '../../config.js'

/**
 * TDS Blob Storage Service
 * Provides blob storage operations for the TDS container
 */

/**
 * Gets the TDS blob storage service instance
 * @returns {Object} Blob storage service configured for TDS
 */
function getTdsBlobStorageService() {
  const { defraCloudTenantId } = config.get('azure') || {}
  const { clientId, blobStorageAccount, containerName } = config.get('tdsBlob')
  return createBlobStorageService({
    tenantId: defraCloudTenantId,
    clientId,
    blobStorageAccount,
    containerName
  })
}

/**
 * Checks if the TDS container exists in Azure Blob Storage
 * @returns {Promise<boolean>} True if container exists, false otherwise
 * @throws {Error} If the check fails
 */
export async function checkTdsContainerExists() {
  const service = getTdsBlobStorageService()
  return service.checkContainerExists()
}

/**
 * Uploads JSON data to TDS Azure Blob Storage
 * @param {string} blobName - The name of the blob to create/update
 * @param {Object|Array} jsonData - The JSON data to upload
 * @returns {Promise<Object>} Upload response with ETag and other metadata
 * @throws {Error} If the upload fails
 */
export async function uploadJsonToTdsBlob(blobName, jsonData) {
  const service = getTdsBlobStorageService()
  const jsonString = JSON.stringify(jsonData, null, 2)
  return service.uploadBlob(blobName, jsonString, {
    contentType: 'application/json'
  })
}

/**
 * Uploads raw data/buffer to TDS Azure Blob Storage
 * @param {string} blobName - The name of the blob to create/update
 * @param {string|Buffer} data - The data to upload
 * @param {Object} options - Upload options (contentType, etc.)
 * @returns {Promise<Object>} Upload response with ETag and other metadata
 * @throws {Error} If the upload fails
 */
export async function uploadToTdsBlob(blobName, data, options = {}) {
  const service = getTdsBlobStorageService()
  return service.uploadBlob(blobName, data, options)
}
