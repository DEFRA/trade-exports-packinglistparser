/**
 * JSON sanitization utility
 *
 * Removes trailing spaces and empty cells from JSON-serialized Excel/CSV data.
 */

import { createLogger } from '../common/helpers/logging/logger.js'
const logger = createLogger()

/**
 * Sanitise JSON string by removing trailing spaces and null values.
 *
 * Process:
 * - Remove trailing spaces from string values
 * - Convert empty strings to null
 * - Remove null values from arrays and objects
 *
 * @param {string} jsonString - JSON string to sanitize
 * @returns {string} Sanitized JSON string
 */
function sanitise(jsonString) {
  try {
    const obj = JSON.parse(jsonString)
    const sanitized = sanitizeObject(obj)
    return JSON.stringify(sanitized)
  } catch (err) {
    // If parsing fails, return null
    logger.warn(
      { error: err.message },
      `Failed to parse JSON string: ${jsonString}`
    )
    return null
  }
}

/**
 * Recursively sanitize an object or array.
 *
 * @param {*} obj - Object, array, or primitive to sanitize
 * @returns {*} Sanitized value
 */
function sanitizeObject(obj) {
  if (obj === null || obj === undefined) {
    return null
  }

  if (typeof obj === 'string') {
    // Remove trailing spaces
    const trimmed = obj.trim()
    // Convert empty strings to null
    return trimmed === '' ? null : trimmed
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }

  if (typeof obj === 'object') {
    const sanitized = {}
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        const value = sanitizeObject(obj[key])
        // Keep the key even if value is null (for cell tracking)
        sanitized[key] = value
      }
    }
    return sanitized
  }

  return obj
}

export { sanitise }
