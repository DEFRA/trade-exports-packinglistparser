import { getIneligibleItems } from '../services/mdm-service.js'

import { STATUS_CODES } from './statuscodes.js'

export const ineligibleItems = {
  method: 'GET',
  path: '/mdm/ineligible-items',
  handler: getHandler
}

/**
 * Handler for downloading a blob from EHCO application forms container
 * @param {Object} request - Hapi request object with query.blobname parameter
 * @param {Object} h - Hapi response toolkit
 * @returns {Promise<Object>} Response indicating success or error
 */
async function getHandler(_request, h) {
  try {
    const ineligibleItems = await getIneligibleItems()

    return h
      .response(`Success: ${JSON.stringify(ineligibleItems)} `)
      .code(STATUS_CODES.OK)
  } catch (error) {
    console.error('Error downloading blob:', error)
    return h
      .response({ error: 'Failed to download blob' })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
}
