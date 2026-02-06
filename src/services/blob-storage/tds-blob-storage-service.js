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
