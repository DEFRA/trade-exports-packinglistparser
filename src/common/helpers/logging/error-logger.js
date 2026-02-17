/**
 * Helper function to format errors for ECS-compliant logging.
 *
 * CDP enforces a streamlined ECS schema that only includes specific fields.
 * Additional context fields outside this schema won't be searchable in OpenSearch.
 *
 * Supported error fields in CDP's ECS schema:
 * - error/message
 * - error/stack_trace
 * - error/type
 * - error/code
 * - error/id
 *
 * @param {Error} error - The error object to format
 * @returns {Object} ECS-compliant error object
 */
function formatError(error) {
  if (!error) {
    return {}
  }

  return {
    error: {
      message: error.message,
      stack_trace: error.stack,
      type: error.name
    }
  }
}

/**
 * Log an error with ECS-compliant formatting.
 *
 * @param {Object} logger - Pino logger instance
 * @param {Error} error - The error object
 * @param {string} message - Human-readable log message
 */
function logError(logger, error, message) {
  logger.error(formatError(error), message)
}

export { formatError, logError }
