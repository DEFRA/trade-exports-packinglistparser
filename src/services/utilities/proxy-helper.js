import { config } from '../../config.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
const logger = createLogger()

// Configure proxy if HTTP_PROXY is set
const proxyUrl = config.get('httpProxy')
const HTTP_PORT = 80
const HTTPS_PORT = 443

/**
 * Gets proxy configuration options for Azure SDK clients
 * @returns {Object} Proxy options object with host and port, or empty object if no proxy
 */
export function getClientProxyOptions() {
  return proxyUrl
    ? {
        proxyOptions: {
          host: new URL(proxyUrl).href,
          port:
            new URL(proxyUrl).protocol.toLowerCase() === 'https:'
              ? HTTPS_PORT
              : HTTP_PORT
        }
      }
    : {}
}

/**
 * Gets AMQP connection options for Service Bus with optional proxy support
 * @returns {Object} Connection options with optional proxy agent
 */
export function getServiceBusConnectionOptions() {
  const connectionOptions = {}

  // Configure proxy if httpProxy is set in config
  if (proxyUrl) {
    connectionOptions.proxyOptions = {
      host: new URL(proxyUrl).hostname,
      port:
        new URL(proxyUrl).port ||
        (new URL(proxyUrl).protocol.toLowerCase() === 'https:'
          ? HTTPS_PORT
          : HTTP_PORT)
    }
    logger.info('Using proxy for Service Bus connection via AMQP transport')
  }
  return connectionOptions
}
