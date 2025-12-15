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
 * Uses Azure SDK's native proxy support via proxyOptions
 * The proxy itself is accessed on the port specified in the HTTP_PROXY URL (typically 3128 for CDP)
 * The Service Bus will be accessed on port 5671 through the proxy
 * @returns {Object} Connection options with optional proxy configuration
 */
export function getServiceBusConnectionOptions() {
  const connectionOptions = {}

  // Configure proxy if httpProxy is set in config
  if (proxyUrl) {
    // Azure Service Bus SDK native proxy support
    const proxyUrlObj = new URL(proxyUrl)
    // Use the port from the proxy URL (e.g., 3128), or default based on protocol
    const proxyPort =
      proxyUrlObj.port ||
      (proxyUrlObj.protocol.toLowerCase() === 'https:' ? HTTPS_PORT : HTTP_PORT)

    connectionOptions.proxyOptions = {
      host: proxyUrlObj.href,
      port: proxyPort
    }
    logger.info('Using proxy for Service Bus connection via AMQP')
  }
  return connectionOptions
}
