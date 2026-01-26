import { config } from '../../config.js'

import { createServer } from '../../server.js'
import { initializeIneligibleItemsCache } from '../../services/cache/ineligible-items-cache.js'
import { createLogger } from './logging/logger.js'

const logger = createLogger()

async function startServer() {
  const server = await createServer()

  // Initialize ineligible items cache before starting the server
  try {
    logger.info('Initializing ineligible items cache from S3')
    await initializeIneligibleItemsCache()
  } catch (error) {
    logger.error(
      { error: error.message },
      'Failed to initialize ineligible items cache - server will start but cache will be empty'
    )
    // Continue with server startup even if cache initialization fails
    // This allows the service to remain operational
  }

  await server.start()

  server.logger.info('Server started successfully')
  server.logger.info(
    `Access your backend on http://localhost:${config.get('port')}`
  )

  return server
}

export { startServer }
