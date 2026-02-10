import { BlobServiceClient } from '@azure/storage-blob'
import { getAzureCredentials } from '../utilities/get-azure-credentials.js'
import { getClientProxyOptions } from '../utilities/proxy-helper.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { isExcel, convertExcelToJson } from '../../utilities/excel-helper.js'
import { isCsv, convertCsvToJson } from '../../utilities/csv-helper.js'
import { streamToBuffer } from '../../common/helpers/stream-helpers.js'

const logger = createLogger()

/**
 * @typedef {Object} BlobStorageConfig
 * @property {string} tenantId - Azure AD Tenant ID
 * @property {string} clientId - Azure AD Client ID
 * @property {string} blobStorageAccount - Azure Blob Storage Account name
 * @property {string} containerName - Azure Blob Storage Container name
 */

/**
 * Creates a BlobServiceClient with Azure credentials and proxy configuration
 * @param {BlobStorageConfig} storageConfig - Configuration for the blob storage account
 * @returns {BlobServiceClient} Configured blob service client
 */
function createBlobServiceClient(storageConfig) {
  const { tenantId, clientId, blobStorageAccount } = storageConfig
  const credential = getAzureCredentials(tenantId, clientId)
  const blobServiceUrl = `https://${blobStorageAccount}.blob.core.windows.net`
  const clientOptions = getClientProxyOptions()

  return new BlobServiceClient(blobServiceUrl, credential, clientOptions)
}

/**
 * Creates a container client for the configured container
 * @param {BlobStorageConfig} storageConfig - Configuration for the blob storage account
 * @returns {ContainerClient} Container client
 */
function createContainerClient(storageConfig) {
  const blobServiceClient = createBlobServiceClient(storageConfig)
  return blobServiceClient.getContainerClient(storageConfig.containerName)
}

/**
 * Extracts the blob name from a full blob URL
 * @param {string} url - The full blob URL or blob name
 * @param {BlobStorageConfig} storageConfig - Configuration for the blob storage account
 * @returns {string} The blob name
 * @throws {Error} If the URL is invalid
 */
function getBlobNameFromUrl(url, storageConfig) {
  const { blobStorageAccount, containerName } = storageConfig
  const prefix = `https://${blobStorageAccount}.blob.core.windows.net/${containerName}/`
  if (url.startsWith(prefix)) {
    return url.slice(prefix.length)
  }
  // If it doesn't start with the prefix, treat it as a simple blob name
  // unless it looks like a URL for a different account/container
  if (url.startsWith('https://')) {
    throw new Error('Invalid blob URL')
  }
  return url
}

/**
 * Downloads a file from Azure Blob Storage
 * @param {string} blobUrl - The blob (file) name to download
 * @param {BlobStorageConfig} storageConfig - Configuration for the blob storage account
 * @returns {Promise<Buffer>} The downloaded file as a buffer
 */
async function downloadBlob(blobUrl, storageConfig) {
  try {
    logger.info(`Downloading blob from container: ${blobUrl}`)
    const containerClient = createContainerClient(storageConfig)
    const blobName = getBlobNameFromUrl(blobUrl, storageConfig)
    const blobClient = containerClient.getBlobClient(blobName)

    const downloadResponse = await blobClient.download()
    const downloadedContent = await streamToBuffer(
      downloadResponse.readableStreamBody
    )

    logger.info(`Blob downloaded from container: ${blobUrl}`)

    return downloadedContent
  } catch (error) {
    throw new Error(`Failed to download blob: ${error.message}`)
  }
}

/**
 * Downloads a blob and converts it to JSON if it's Excel or CSV
 * @param {string} blobUri - The blob URI or name to download
 * @param {BlobStorageConfig} storageConfig - Configuration for the blob storage account
 * @returns {Promise<Object|Buffer>} The downloaded and converted JSON object, or raw buffer if not convertible
 */
async function downloadBlobAsJson(blobUri, storageConfig) {
  try {
    const buffer = await downloadBlob(blobUri, storageConfig)
    let result
    if (isExcel(blobUri)) {
      result = convertExcelToJson({ source: buffer })
    } else if (isCsv(blobUri)) {
      result = await convertCsvToJson(buffer)
    } else {
      result = buffer
    }
    return result
  } catch (error) {
    throw new Error(`Failed to download and convert blob: ${error.message}`)
  }
}

/**
 * Checks if the configured container exists in Azure Blob Storage
 * @param {BlobStorageConfig} storageConfig - Configuration for the blob storage account
 * @returns {Promise<boolean>} True if container exists, false otherwise
 * @throws {Error} If the check fails
 */
async function checkContainerExists(storageConfig) {
  try {
    const containerClient = createContainerClient(storageConfig)
    return await containerClient.exists()
  } catch (error) {
    throw new Error(`Failed to check container existence: ${error.message}`)
  }
}

/**
 * Uploads data to Azure Blob Storage
 * @param {string} blobName - The name of the blob to create/update
 * @param {Buffer|string} data - The data to upload
 * @param {BlobStorageConfig} storageConfig - Configuration for the blob storage account
 * @param {Object} options - Upload options (contentType, etc.)
 * @returns {Promise<Object>} Upload response with ETag and other metadata
 * @throws {Error} If the upload fails
 */
async function uploadBlob(blobName, data, storageConfig, options = {}) {
  try {
    logger.info(`Uploading blob to container: ${blobName}`)
    const containerClient = createContainerClient(storageConfig)
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    const uploadOptions = {
      blobHTTPHeaders: {
        blobContentType: options.contentType || 'application/octet-stream'
      }
    }

    const uploadResponse = await blockBlobClient.upload(
      data,
      Buffer.byteLength(data),
      uploadOptions
    )

    logger.info(`Blob uploaded successfully: ${blobName}`)

    return {
      ETag: uploadResponse.etag,
      lastModified: uploadResponse.lastModified,
      requestId: uploadResponse.requestId
    }
  } catch (error) {
    throw new Error(`Failed to upload blob: ${error.message}`)
  }
}

/**
 * Creates a blob storage service instance configured for a specific storage account
 * @param {BlobStorageConfig} storageConfig - Configuration for the blob storage account
 * @returns {Object} Object containing blob storage operations
 */
export function createBlobStorageService(storageConfig) {
  return {
    downloadBlob: (blobUrl) => downloadBlob(blobUrl, storageConfig),
    downloadBlobAsJson: (blobUri) => downloadBlobAsJson(blobUri, storageConfig),
    checkContainerExists: () => checkContainerExists(storageConfig),
    getBlobNameFromUrl: (url) => getBlobNameFromUrl(url, storageConfig),
    uploadBlob: (blobName, data, options) =>
      uploadBlob(blobName, data, storageConfig, options)
  }
}
