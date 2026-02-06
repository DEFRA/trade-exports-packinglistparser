import { createBlobStorageService } from './blob-storage-service.js'
import { config } from '../../config.js'

/**
 * EHCO Blob Storage Service
 * Provides blob storage operations for the EHCO application forms container
 */

/**
 * Gets the EHCO blob storage service instance
 * @returns {Object} Blob storage service configured for EHCO
 */
function getEhcoBlobStorageService() {
  const { defraTenantId } = config.get('azure') || {}
  const { clientId, blobStorageAccount, containerName } = config.get('ehcoBlob')
  return createBlobStorageService({
    tenantId: defraTenantId,
    clientId,
    blobStorageAccount,
    containerName
  })
}

/**
 * Downloads a file from EHCO Azure Blob Storage
 * @param {string} blobUrl - The blob (file) name to download
 * @returns {Promise<Buffer>} The downloaded file as a buffer
 */
export async function downloadBlobFromApplicationForms(blobUrl) {
  const service = getEhcoBlobStorageService()
  return service.downloadBlob(blobUrl)
}

/**
 * Downloads a blob from EHCO application forms container and converts it to JSON if it's Excel or CSV
 * @param {string} blobUri - The blob URI or name to download
 * @returns {Promise<Object|Buffer>} The downloaded and converted JSON object, or raw buffer if not convertible
 */
export async function downloadBlobFromApplicationFormsContainerAsJson(blobUri) {
  const service = getEhcoBlobStorageService()
  return service.downloadBlobAsJson(blobUri)
}

/**
 * Checks if the EHCO application forms container exists in Azure Blob Storage
 * @returns {Promise<boolean>} True if container exists, false otherwise
 * @throws {Error} If the check fails
 */
export async function checkApplicationFormsContainerExists() {
  const service = getEhcoBlobStorageService()
  return service.checkContainerExists()
}
