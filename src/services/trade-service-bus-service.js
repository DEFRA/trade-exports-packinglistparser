import { ServiceBusClient } from '@azure/service-bus'
import { getAzureCredentials } from './utilities/get-azure-credentials.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { formatError } from '../common/helpers/logging/error-logger.js'
import { config } from '../config.js'
import { getServiceBusConnectionOptions } from './utilities/proxy-helper.js'

const logger = createLogger()

/**
 * Create a Service Bus client using Azure AD credentials obtained via Cognito
 * @param {string} tenantId
 * @param {string} clientId
 * @param {string} fullyQualifiedNamespace - e.g. "your-namespace.servicebus.windows.net"
 * @returns {ServiceBusClient}
 */
function createServiceBusClient(tenantId, clientId, fullyQualifiedNamespace) {
  const credential = getAzureCredentials(tenantId, clientId)
  const connectionOptions = getServiceBusConnectionOptions()

  return new ServiceBusClient(
    fullyQualifiedNamespace,
    credential,
    connectionOptions
  )
}

/**
 * Convenience helper to create a ServiceBusClient from `config.get('azure')`.
 * Expects `azure` config to include `tenantId`, `clientId` and `serviceBusNamespace`.
 * Proxy is automatically configured from `config.get('httpProxy')` if set.
 */
function createServiceBusClientFromConfig() {
  const { defraCloudTenantId } = config.get('azure') || {}
  const { clientId, serviceBusNamespace } = config.get('tradeServiceBus')
  if (!defraCloudTenantId || !clientId || !serviceBusNamespace) {
    throw new Error(
      'Missing Azure Service Bus configuration (tenantId, clientId, serviceBusNamespace)'
    )
  }
  logger.info(
    `Using tenantId: ${defraCloudTenantId}, clientId: ${clientId}, namespace: ${serviceBusNamespace}`
  )

  return createServiceBusClient(
    defraCloudTenantId,
    clientId,
    serviceBusNamespace
  )
}

/**
 * Send a single message to a queue
 * @param {any} message
 */
export async function sendMessageToQueue(message) {
  const client = createServiceBusClientFromConfig()
  const { queueName } = config.get('tradeServiceBus')
  const sender = client.createSender(queueName)
  try {
    await sender.sendMessages(message)
    logger.info(
      `Message sent to Service Bus queue: ${queueName} for applicationId: ${message.body?.applicationId}`
    )
  } catch (err) {
    logger.error(
      formatError(err),
      `Failed to send message to Service Bus queue: ${queueName} for applicationId: ${message.body?.applicationId}`
    )
    throw err
  } finally {
    try {
      await sender.close()
    } catch (e) {
      logger.warn(`Failed to close Service Bus sender (error: ${e.message})`)
    }
    await client.close()
  }
}

/**
 * Receive messages from a queue (pull)
 * @param {number} [maxMessages=10]
 * @param {number} [maxWaitTimeInMs=5000]
 * @returns {Promise<any[]>} Array of message bodies
 */
export async function receiveMessagesFromQueue(
  maxMessages = 10,
  maxWaitTimeInMs = 5000
) {
  const client = createServiceBusClientFromConfig()
  const { queueName } = config.get('tradeServiceBus')
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
          `Failed to complete message (messageId: ${m.messageId}, error: ${e.message})`
        )
      }
    }

    logger.info(
      `Received messages from Service Bus queue (queueName: ${queueName}, count: ${bodies.length})`
    )
    return bodies
  } catch (err) {
    logger.error(
      formatError(err),
      `Failed to receive messages from Service Bus queue (queueName: ${queueName})`
    )
    throw err
  } finally {
    try {
      await receiver.close()
    } catch (e) {
      logger.warn(`Failed to close Service Bus receiver (error: ${e.message})`)
    }
    await client.close()
  }
}

/**
 * Check if we can connect to Trade Service Bus by attempting to peek at messages.
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
export async function checkTradeServiceBusConnection() {
  const client = createServiceBusClientFromConfig()
  const { queueName } = config.get('tradeServiceBus')
  const receiver = client.createReceiver(queueName)
  try {
    await receiver.peekMessages(1)
    logger.info(`Successfully connected to Service Bus: ${queueName}`)
    return true
  } catch (err) {
    logger.error(
      formatError(err),
      `Failed to connect to Service Bus: ${queueName}`
    )
    return false
  } finally {
    try {
      await receiver.close()
    } catch (e) {
      logger.warn(`Failed to close Service Bus receiver (error: ${e.message})`)
    }
    await client.close()
  }
}
