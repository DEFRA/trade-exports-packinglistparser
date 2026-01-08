/**
 * File extension helpers
 *
 * Small utilities used by matchers to determine a file's likely type by
 * inspecting its filename extension. These helpers return boolean checks
 * for common types and a `matches()` function that maps to the
 * `matcher-result` module's constants.
 */

import matcherResult from '../services/matcher-result.js'

/**
 * Check whether filename ends with requested extension.
 * @param {string} filename - Filename to check
 * @param {string} extension - Extension to match
 * @returns {number} MatcherResult constant (CORRECT or WRONG_EXTENSION)
 */
function matches(filename, extension) {
  const fileExtension = filename.split('.').pop()
  if (fileExtension.toLowerCase() === extension.toLowerCase()) {
    return matcherResult.CORRECT
  } else {
    return matcherResult.WRONG_EXTENSION
  }
}

/**
 * Check if filename is Excel format (.xls or .xlsx).
 * @param {string} filename - Filename to check
 * @returns {boolean} True if Excel file
 */
function isExcel(filename) {
  // Check for both 'xls' and 'xlsx' extensions
  return (
    matches(filename, 'xls') === matcherResult.CORRECT ||
    matches(filename, 'xlsx') === matcherResult.CORRECT
  )
}

/**
 * Check if filename is PDF format.
 * @param {string} filename - Filename to check
 * @returns {boolean} True if PDF file
 */
function isPdf(filename) {
  return matches(filename, 'pdf') === matcherResult.CORRECT
}

/**
 * Check if filename is CSV format.
 * @param {string} filename - Filename to check
 * @returns {boolean} True if CSV file
 */
function isCsv(filename) {
  return matches(filename, 'csv') === matcherResult.CORRECT
}

export { matches, isExcel, isPdf, isCsv }
