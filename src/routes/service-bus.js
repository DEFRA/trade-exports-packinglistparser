import { config } from '../config.js'
import { sendMessageToQueue } from '../services/service-bus-service.js'

import { STATUS_CODES } from './statuscodes.js'

export const sendtoqueue = {
  method: 'GET',
  path: '/tpsb',
  handler: handler
}

async function handler(_request, h) {
  try {
    const azureConfig = config.get('azure')
    const tradeServiceBusConfig = config.get('tradeServiceBus')
    await sendMessageToQueue(
      azureConfig.tenantId,
      tradeServiceBusConfig.clientId, // clientId
      tradeServiceBusConfig.serviceBusNamespace, // fullyQualifiedNamespace
      tradeServiceBusConfig.queueName, // queueName
      { text: 'Hello, Service Bus!' } // message
    )

    return h.response('Success').code(STATUS_CODES.OK)
  } catch (error) {
    console.error('Error listing credentials:', error)
    return h
      .response({ error: 'Failed to list credentials' })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
}
