import process from 'node:process'

import { createLogger } from './common/helpers/logging/logger.js'
import { startServer } from './common/helpers/start-server.js'

await startServer()

const handleProcessError = (errorType) => (error) => {
  const logger = createLogger()
  logger.info(errorType)
  logger.error(error)
  process.exitCode = 1
}

process.on('unhandledRejection', handleProcessError('Unhandled rejection'))
process.on('uncaughtException', handleProcessError('Uncaught Exception'))
