import { BlobServiceClient } from '@azure/storage-blob'
import { getAzureCredentials } from './utilities/get-azure-credentials.js'
import { getClientProxyOptions } from './utilities/proxy-helper.js'
import { config } from '../config.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

/**
 * Downloads a file from Azure Blob Storage
 * @param {string} blobName - The blob (file) name to download
 * @returns {Promise<Buffer>} The downloaded file as a buffer
 */
export async function downloadBlobFromApplicationForms(blobName) {
  try {
    logger.info(
      `Downloading blob from application forms container: ${blobName}`
    )
    const containerClient = createApplicationFormsBlobClient()
    const blobClient = containerClient.getBlobClient(blobName)

    const downloadResponse = await blobClient.download()
    const downloadedContent = await streamToBuffer(
      downloadResponse.readableStreamBody
    )

    logger.info(`Blob downloaded from application forms container: ${blobName}`)
    return downloadedContent
  } catch (error) {
    throw new Error(`Failed to download blob: ${error.message}`)
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
