import { sendMessageToQueue } from '../services/trade-service-bus-service.js'

import { STATUS_CODES } from './statuscodes.js'

export const sendtoqueue = {
  method: 'GET',
  path: '/trade-service-bus',
  handler
}

async function handler(_request, h) {
  try {
    await sendMessageToQueue(
      { text: 'Hello, Service Bus!' } // message
    )

    return h.response('Success').code(STATUS_CODES.OK)
  } catch (error) {
    console.error('Error sending message:', error)
    return h
      .response({ error: 'Failed to send message to queue' })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
}
