/**
 * File extension helpers
 *
 * Small utilities used by parsers to determine a file's likely type by
 * inspecting its filename extension.
 */

/**
 * Check whether filename ends with requested extension.
 *
 * @param {string} filename - Filename to check
 * @param {string} extension - Extension to match
 * @returns {string} 'CORRECT' or 'WRONG_EXTENSION'
 */
function matches(filename, extension) {
  const fileExtension = filename.split('.').pop()
  if (fileExtension.toLowerCase() === extension.toLowerCase()) {
    return 'CORRECT'
  } else {
    return 'WRONG_EXTENSION'
  }
}

/**
 * Check if filename is Excel format (.xls or .xlsx).
 *
 * @param {string} filename - Filename to check
 * @returns {boolean} True if Excel file
 */
function isExcel(filename) {
  // Check for both 'xls' and 'xlsx' extensions
  return (
    matches(filename, 'xls') === 'CORRECT' ||
    matches(filename, 'xlsx') === 'CORRECT'
  )
}

/**
 * Check if filename is PDF format.
 *
 * @param {string} filename - Filename to check
 * @returns {boolean} True if PDF file
 */
function isPdf(filename) {
  return matches(filename, 'pdf') === 'CORRECT'
}

/**
 * Check if filename is CSV format.
 *
 * @param {string} filename - Filename to check
 * @returns {boolean} True if CSV file
 */
function isCsv(filename) {
  return matches(filename, 'csv') === 'CORRECT'
}

export { matches, isExcel, isPdf, isCsv }
