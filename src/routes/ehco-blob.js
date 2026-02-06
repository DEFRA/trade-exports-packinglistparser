import {
  downloadBlobFromApplicationForms,
  checkApplicationFormsContainerExists
} from '../services/blob-storage/ehco-blob-storage-service.js'

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
  try {
    const blobName = request.query.blobname

    await downloadBlobFromApplicationForms(blobName)

    return h.response('Success').code(STATUS_CODES.OK)
  } catch (error) {
    console.error('Error downloading blob:', error)
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
 * @param {Object} _request - Hapi request object (unused)
 * @param {Object} h - Hapi response toolkit
 * @returns {Promise<Object>} Response indicating container existence status
 */
async function existsHandler(_request, h) {
  try {
    const exists = await checkApplicationFormsContainerExists()

    return h.response(`Success: ${exists}`).code(STATUS_CODES.OK)
  } catch (error) {
    console.error('Error downloading blob:', error)
    return h
      .response({ error: 'Failed to download blob' })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
}
