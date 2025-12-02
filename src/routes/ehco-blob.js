import { config } from '../config.js'
import { downloadBlob } from '../services/blob-storage-service.js'

import { STATUS_CODES } from './statuscodes.js'

import { createLogger } from '../common/helpers/logging/logger.js'
const logger = createLogger()

export const getFileFromBlob = {
  method: 'GET',
  path: '/ehco-blob',
  handler
}

async function handler(request, h) {
  try {
    const azureConfig = config.get('azure')
    const ehcoBlobConfig = config.get('ehcoBlob')
    const containerName = request.query.containername
    const blobName = request.query.blobname

    logger.info(
      `Downloading blob from container: ${containerName}, blob: ${blobName}`
    )
    logger.info(
      `Using tenantId: ${azureConfig.defraTenantId}, clientId: ${ehcoBlobConfig.clientId}`
    )

    await downloadBlob(
      azureConfig.defraTenantId,
      ehcoBlobConfig.clientId,
      ehcoBlobConfig.blobStorageAccount,
      containerName,
      blobName
    )

    return h.response('Success').code(STATUS_CODES.OK)
  } catch (error) {
    console.error('Error listing credentials:', error)
    return h
      .response({ error: 'Failed to list credentials' })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
}
