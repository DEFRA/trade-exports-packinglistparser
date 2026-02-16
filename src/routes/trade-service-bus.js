import { sendMessageToQueue } from '../services/trade-service-bus-service.js'
import { formatError } from '../common/helpers/logging/error-logger.js'
import { STATUS_CODES } from './statuscodes.js'

export const sendtoqueue = {
  method: 'GET',
  path: '/trade-service-bus',
  handler
}

/**
 * Handler for sending a test message to Service Bus queue
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Promise<Object>} Response indicating success or error
 */
async function handler(request, h) {
  try {
    await sendMessageToQueue(
      { text: 'Hello, Service Bus!' } // message
    )

    return h.response('Success').code(STATUS_CODES.OK)
  } catch (error) {
    request.logger.error(
      formatError(error),
      'Error sending message to Service Bus queue'
    )
    return h
      .response({ error: 'Failed to send message to queue' })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
}
