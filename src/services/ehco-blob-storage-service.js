import { BlobServiceClient } from '@azure/storage-blob'
import { getAzureCredentials } from './utilities/get-azure-credentials.js'
import { getClientProxyOptions } from './utilities/proxy-helper.js'
import { config } from '../config.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { isExcel, convertExcelToJson } from '../utilities/excel-helper.js'
import { isCsv, convertCsvToJson } from '../utilities/csv-helper.js'

const logger = createLogger()

/**
 * Downloads a file from Azure Blob Storage
 * @param {string} blobUrl - The blob (file) name to download
 * @returns {Promise<Buffer>} The downloaded file as a buffer
 */
export async function downloadBlobFromApplicationForms(blobUrl) {
  try {
    logger.info(`Downloading blob from application forms container: ${blobUrl}`)
    const containerClient = createApplicationFormsBlobClient()
    const blobName = getBlobNameFromUrl(blobUrl)
    const blobClient = containerClient.getBlobClient(blobName)

    const downloadResponse = await blobClient.download()
    const downloadedContent = await streamToBuffer(
      downloadResponse.readableStreamBody
    )

    logger.info(`Blob downloaded from application forms container: ${blobUrl}`)

    return downloadedContent
  } catch (error) {
    throw new Error(`Failed to download blob: ${error.message}`)
  }
}

/** Downloads a blob from EHCO application forms container and converts it to JSON if it's Excel or CSV
 * @param {string} blobUri - The blob URI or name to download
 * @returns {Promise<Object|Buffer>} The downloaded and converted JSON object, or raw buffer if not convertible
 */
export async function downloadBlobFromApplicationFormsContainerAsJson(blobUri) {
  try {
    const buffer = await downloadBlobFromApplicationForms(blobUri)
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
 * Checks if the EHCO application forms container exists in Azure Blob Storage
 * @returns {Promise<boolean>} True if container exists, false otherwise
 * @throws {Error} If the check fails
 */
export async function checkApplicationFormsContainerExists() {
  try {
    const containerClient = createApplicationFormsBlobClient()

    return await containerClient.exists()
  } catch (error) {
    throw new Error(`Failed to download blob: ${error.message}`)
  }
}

/**
 * Creates a BlobServiceClient with Azure credentials and proxy configuration
 * @returns {BlobServiceClient} Configured blob service client
 */
function createBlobServiceClient() {
  const { defraTenantId } = config.get('azure') || {}
  const { clientId, blobStorageAccount } = config.get('ehcoBlob')
  const credential = getAzureCredentials(defraTenantId, clientId)
  const blobServiceUrl = `https://${blobStorageAccount}.blob.core.windows.net`
  const clientOptions = getClientProxyOptions()

  return new BlobServiceClient(blobServiceUrl, credential, clientOptions)
}

/** Extracts the blob name from a full blob URL
 * @param {string} url - The full blob URL or blob name
 * @returns {string} The blob name
 * @throws {Error} If the URL is invalid
 */
function getBlobNameFromUrl(url) {
  const { formsContainerName, blobStorageAccount } = config.get('ehcoBlob')
  const prefix = `https://${blobStorageAccount}.blob.core.windows.net/${formsContainerName}/`
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
 * Creates a container client for the EHCO application forms container
 * @returns {ContainerClient} Container client for application forms
 */
function createApplicationFormsBlobClient() {
  const blobServiceClient = createBlobServiceClient()
  const { formsContainerName } = config.get('ehcoBlob')

  return blobServiceClient.getContainerClient(formsContainerName)
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
