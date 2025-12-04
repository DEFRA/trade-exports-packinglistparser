import { BlobServiceClient } from '@azure/storage-blob'
import { getAzureCredentials } from './utilities/get-azure-credentials.js'
import { getClientProxyOptions } from './utilities/proxy-helper.js'
import { config } from '../config.js'

/**
 * Downloads a file from Azure Blob Storage
 * @param {string} blobName - The blob (file) name to download
 * @returns {Promise<Buffer>} The downloaded file as a buffer
 */
export async function downloadBlobFromApplicationForms(blobName) {
  try {
    const containerClient = createApplicationFormsBlobClient()
    const blobClient = containerClient.getBlobClient(blobName)

    const downloadResponse = await blobClient.download()
    const downloadedContent = await streamToBuffer(
      downloadResponse.readableStreamBody
    )

    return downloadedContent
  } catch (error) {
    throw new Error(`Failed to download blob: ${error.message}`)
  }
}

export async function checkApplicationFormsContainerExists() {
  try {
    const containerClient = createApplicationFormsBlobClient()

    return await containerClient.exists()
  } catch (error) {
    throw new Error(`Failed to download blob: ${error.message}`)
  }
}

function createBlobServiceClient() {
  const { defraTenantId } = config.get('azure') || {}
  const { clientId, blobStorageAccount } = config.get('ehcoBlob')
  const credential = getAzureCredentials(defraTenantId, clientId)
  const blobServiceUrl = `https://${blobStorageAccount}.blob.core.windows.net`
  const clientOptions = getClientProxyOptions()

  return new BlobServiceClient(blobServiceUrl, credential, clientOptions)
}

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
