import { ServiceBusClient } from '@azure/service-bus'
import { getAzureCredentials } from './utilities/get-azure-credentials.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { config } from '../config.js'

const logger = createLogger()

/**
 * Create a Service Bus client using Azure AD credentials obtained via Cognito
 * @param {string} tenantId
 * @param {string} clientId
 * @param {string} fullyQualifiedNamespace - e.g. "your-namespace.servicebus.windows.net"
 * @returns {ServiceBusClient}
 */
export function createServiceBusClient(
  tenantId,
  clientId,
  fullyQualifiedNamespace
) {
  const credential = getAzureCredentials(tenantId, clientId)
  credential
    .getToken('https://servicebus.azure.net//.default')
    .then((t) => logger.info(`credential: ${t.token}`))
  return new ServiceBusClient(fullyQualifiedNamespace, credential)
}

/**
 * Convenience helper to create a ServiceBusClient from `config.get('azure')`.
 * Expects `azure` config to include `tenantId`, `clientId` and `serviceBusNamespace`.
 */
export function createServiceBusClientFromConfig() {
  const azureConfig = config.get('azure') || {}
  const { tenantId, clientId, serviceBusNamespace } = azureConfig
  if (!tenantId || !clientId || !serviceBusNamespace) {
    throw new Error(
      'Missing Azure Service Bus configuration (tenantId, clientId, serviceBusNamespace)'
    )
  }
  return createServiceBusClient(tenantId, clientId, serviceBusNamespace)
}

/**
 * Send a single message to a queue
 * @param {string} tenantId
 * @param {string} clientId
 * @param {string} fullyQualifiedNamespace
 * @param {string} queueName
 * @param {any} message
 */
export async function sendMessageToQueue(
  tenantId,
  clientId,
  fullyQualifiedNamespace,
  queueName,
  message
) {
  const client = createServiceBusClient(
    tenantId,
    clientId,
    fullyQualifiedNamespace
  )
  const sender = client.createSender(queueName)
  try {
    await sender.sendMessages({ body: message })
    logger.info({ queueName }, 'Message sent to Service Bus queue')
  } catch (err) {
    logger.error(
      { err, queueName },
      'Failed to send message to Service Bus queue'
    )
    throw err
  } finally {
    try {
      await sender.close()
    } catch (e) {
      logger.warn({ err: e }, 'Failed to close Service Bus sender')
    }
    await client.close()
  }
}

/**
 * Receive messages from a queue (pull)
 * @param {string} tenantId
 * @param {string} clientId
 * @param {string} fullyQualifiedNamespace
 * @param {string} queueName
 * @param {number} [maxMessages=10]
 * @param {number} [maxWaitTimeInMs=5000]
 * @returns {Promise<any[]>} Array of message bodies
 */
export async function receiveMessagesFromQueue(
  tenantId,
  clientId,
  fullyQualifiedNamespace,
  queueName,
  maxMessages = 10,
  maxWaitTimeInMs = 5000
) {
  const client = createServiceBusClient(
    tenantId,
    clientId,
    fullyQualifiedNamespace
  )
  const receiver = client.createReceiver(queueName)
  try {
    const messages = await receiver.receiveMessages(maxMessages, {
      maxWaitTimeInMs
    })
    const bodies = messages.map((m) => m.body)

    // attempt to complete messages we received
    for (const m of messages) {
      try {
        await receiver.completeMessage(m)
      } catch (e) {
        logger.warn(
          { err: e, messageId: m.messageId },
          'Failed to complete message'
        )
      }
    }

    logger.info(
      { queueName, count: bodies.length },
      'Received messages from Service Bus queue'
    )
    return bodies
  } catch (err) {
    logger.error(
      { err, queueName },
      'Failed to receive messages from Service Bus queue'
    )
    throw err
  } finally {
    try {
      await receiver.close()
    } catch (e) {
      logger.warn({ err: e }, 'Failed to close Service Bus receiver')
    }
    await client.close()
  }
}
