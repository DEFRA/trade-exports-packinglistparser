import { BlobServiceClient } from '@azure/storage-blob'
import { getAzureCredentials } from '../utilities/get-azure-credentials.js'
import { getClientProxyOptions } from '../utilities/proxy-helper.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { isExcel, convertExcelToJson } from '../../utilities/excel-helper.js'
import { isCsv, convertCsvToJson } from '../../utilities/csv-helper.js'

const logger = createLogger()

/**
 * @typedef {Object} BlobStorageConfig
 * @property {string} tenantId - Azure AD Tenant ID
 * @property {string} clientId - Azure AD Client ID
 * @property {string} blobStorageAccount - Azure Blob Storage Account name
 * @property {string} containerName - Azure Blob Storage Container name
 */

/**
 * Creates a blob storage service instance configured for a specific storage account
 * @param {BlobStorageConfig} storageConfig - Configuration for the blob storage account
 * @returns {Object} Object containing blob storage operations
 */
export function createBlobStorageService(storageConfig) {
  const { tenantId, clientId, blobStorageAccount, containerName } =
    storageConfig

  /**
   * Creates a BlobServiceClient with Azure credentials and proxy configuration
   * @returns {BlobServiceClient} Configured blob service client
   */
  function createBlobServiceClient() {
    const credential = getAzureCredentials(tenantId, clientId)
    const blobServiceUrl = `https://${blobStorageAccount}.blob.core.windows.net`
    const clientOptions = getClientProxyOptions()

    return new BlobServiceClient(blobServiceUrl, credential, clientOptions)
  }

  /**
   * Creates a container client for the configured container
   * @returns {ContainerClient} Container client
   */
  function createContainerClient() {
    const blobServiceClient = createBlobServiceClient()
    return blobServiceClient.getContainerClient(containerName)
  }

  /**
   * Extracts the blob name from a full blob URL
   * @param {string} url - The full blob URL or blob name
   * @returns {string} The blob name
   * @throws {Error} If the URL is invalid
   */
  function getBlobNameFromUrl(url) {
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
   * @returns {Promise<Buffer>} The downloaded file as a buffer
   */
  async function downloadBlob(blobUrl) {
    try {
      logger.info(`Downloading blob from container: ${blobUrl}`)
      const containerClient = createContainerClient()
      const blobName = getBlobNameFromUrl(blobUrl)
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
   * @returns {Promise<Object|Buffer>} The downloaded and converted JSON object, or raw buffer if not convertible
   */
  async function downloadBlobAsJson(blobUri) {
    try {
      const buffer = await downloadBlob(blobUri)
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
   * @returns {Promise<boolean>} True if container exists, false otherwise
   * @throws {Error} If the check fails
   */
  async function checkContainerExists() {
    try {
      const containerClient = createContainerClient()
      return await containerClient.exists()
    } catch (error) {
      throw new Error(`Failed to check container existence: ${error.message}`)
    }
  }

  return {
    downloadBlob,
    downloadBlobAsJson,
    checkContainerExists,
    getBlobNameFromUrl
  }
}

/**
 * Helper function to convert a stream to a buffer
 * @param {NodeJS.ReadableStream} readableStream
 * @returns {Promise<Buffer>}
 */
async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data))
    })
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    readableStream.on('error', reject)
  })
}
