import { config } from '../../config.js'

import { createServer } from '../../server.js'
import { initializeIneligibleItemsCache } from '../../services/cache/ineligible-items-cache.js'
import { startSyncScheduler } from '../../services/cache/sync-scheduler.js'
import { startTdsSyncScheduler } from '../../services/tds-sync/sync-scheduler.js'
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

  // Start MDM to S3 synchronization scheduler
  try {
    logger.info('Starting MDM to S3 synchronization scheduler')
    startSyncScheduler()
  } catch (error) {
    logger.error(
      { error: error.message },
      'Failed to start MDM to S3 sync scheduler - manual sync will still be available'
    )
  }

  // Start TDS synchronization scheduler
  try {
    logger.info('Starting TDS synchronization scheduler')
    startTdsSyncScheduler()
  } catch (error) {
    logger.error(
      { error: error.message },
      'Failed to start TDS sync scheduler - manual sync will still be available'
    )
  }

  await server.start()

  server.logger.info('Server started successfully')
  server.logger.info(
    `Access your backend on http://localhost:${config.get('port')}`
  )

  return server
}

export { startServer }
