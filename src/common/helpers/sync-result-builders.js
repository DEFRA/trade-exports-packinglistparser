/**
 * Build a success result object for synchronization operations
 * @param {number} startTime - Start time of the operation
 * @param {Object} data - Additional data to include in the result
 * @returns {Object} Success result with timestamp and duration
 */
export function buildSyncSuccessResult(startTime, data = {}) {
  const endTime = Date.now()
  return {
    success: true,
    timestamp: new Date(endTime).toISOString(),
    duration: endTime - startTime,
    ...data
  }
}

/**
 * Build an error result object for synchronization operations
 * @param {number} startTime - Start time of the operation
 * @param {Error} error - Error object
 * @returns {Object} Error result with timestamp and duration
 */
export function buildSyncErrorResult(startTime, error) {
  const endTime = Date.now()
  return {
    success: false,
    timestamp: new Date(endTime).toISOString(),
    duration: endTime - startTime,
    error: error.message,
    errorName: error.name
  }
}

/**
 * Build a disabled/skipped result object for synchronization operations
 * @param {number} startTime - Start time of the operation
 * @param {string} reason - Reason why the sync was skipped
 * @returns {Object} Skipped result with timestamp and duration
 */
export function buildSyncSkippedResult(startTime, reason) {
  const endTime = Date.now()
  return {
    success: false,
    timestamp: new Date(endTime).toISOString(),
    duration: endTime - startTime,
    skipped: true,
    reason
  }
}
