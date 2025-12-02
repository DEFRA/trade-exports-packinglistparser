import { BlobServiceClient } from '@azure/storage-blob'
import { getAzureCredentials } from './utilities/get-azure-credentials.js'
import { config } from '../config.js'

/**
 * Downloads a file from Azure Blob Storage
 * @param {string} tenantId - Azure tenant ID
 * @param {string} clientId - Azure client ID
 * @param {string} storageAccountName - The Azure storage account name
 * @param {string} containerName - The container name
 * @param {string} blobName - The blob (file) name to download
 * @returns {Promise<Buffer>} The downloaded file as a buffer
 */
export async function downloadBlob(
  tenantId,
  clientId,
  storageAccountName,
  containerName,
  blobName
) {
  try {
    const credential = getAzureCredentials(tenantId, clientId)
    const blobServiceUrl = `https://${storageAccountName}.blob.core.windows.net`

    // Configure proxy if HTTP_PROXY is set
    const proxyUrl = config.get('httpProxy')
    const clientOptions = proxyUrl
      ? {
          proxyOptions: {
            host: proxyUrl.href,
            port: proxyUrl.protocol.toLowerCase() === 'https:' ? 443 : 80
          }
        }
      : {}

    const blobServiceClient = new BlobServiceClient(
      blobServiceUrl,
      credential,
      clientOptions
    )

    const containerClient = blobServiceClient.getContainerClient(containerName)
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
