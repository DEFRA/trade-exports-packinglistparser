import {
  downloadBlobFromApplicationForms,
  checkApplicationFormsContainerExists
} from '../services/blob-storage/ehco-blob-storage-service.js'
import { formatError } from '../common/helpers/logging/error-logger.js'
import { STATUS_CODES } from './statuscodes.js'

export const getFileFromBlob = {
  method: 'GET',
  path: '/ehco-blob-forms',
  handler: getHandler
}

/**
 * Handler for downloading a blob from EHCO application forms container
 * @param {Object} request - Hapi request object with query.blobname parameter
 * @param {Object} h - Hapi response toolkit
 * @returns {Promise<Object>} Response indicating success or error
 */
async function getHandler(request, h) {
  const blobName = request.query.blobname
  try {
    await downloadBlobFromApplicationForms(blobName)

    return h.response('Success').code(STATUS_CODES.OK)
  } catch (error) {
    request.logger.error(
      {
        ...formatError(error),
        blobName
      },
      'Error downloading blob from application forms'
    )
    return h
      .response({ error: 'Failed to download blob' })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
}

export const formsContainerExists = {
  method: 'GET',
  path: '/ehco-blob-forms-container',
  handler: existsHandler
}

/**
 * Handler for checking if EHCO application forms container exists
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Promise<Object>} Response indicating container existence status
 */
async function existsHandler(request, h) {
  try {
    const exists = await checkApplicationFormsContainerExists()

    return h.response(`Success: ${exists}`).code(STATUS_CODES.OK)
  } catch (error) {
    request.logger.error(
      formatError(error),
      'Error checking if application forms container exists'
    )
    return h
      .response({ error: 'Failed to download blob' })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
}
