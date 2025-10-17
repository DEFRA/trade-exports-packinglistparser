const pino = require('pino')
const loggerOptions = require('./logger-options').loggerOptions
const logger = pino(loggerOptions)

function createLogger() {
  return logger
}

module.exports = {
  createLogger
}
