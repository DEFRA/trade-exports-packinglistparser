import { buildSyncSkippedResult } from './sync-result-builders.js'

/**
 * Creates a feature-enabled check function with consistent behavior
 * @param {string} configKey - The configuration key to check
 * @param {string} featureName - Human-readable feature name for logging
 * @param {Object} logger - Logger instance
 * @returns {Function} Function that checks if feature is enabled and returns result
 */
export function createEnabledCheck(configKey, featureName, logger) {
  return function checkEnabled(startTime, config) {
    const { enabled } = config.get(configKey)

    if (!enabled) {
      const result = buildSyncSkippedResult(
        startTime,
        `${featureName} is disabled`
      )

      logger.info(
        result,
        `${featureName} synchronization skipped - ${featureName} is disabled`
      )

      return result
    }

    return null
  }
}
