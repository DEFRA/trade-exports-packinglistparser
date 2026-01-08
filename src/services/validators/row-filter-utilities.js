/**
 * Row filtering utilities for excluding totals rows and repeated headers
 * from packing list validation
 */

/**
 * Check if a row is a totals/summary row
 * @param {Object} row - The data row
 * @param {Object} headerCols - Column mappings
 * @param {Object} config - Model configuration with totals detection settings
 * @returns {boolean} - True if row is a totals row
 */
function isTotalsRow(row, headerCols, config) {
  if (!config.skipTotalsRows) {
    return false
  }
  // Check for totals keywords in description field
  if (hasTotalsKeyword(row, headerCols, config)) {
    return true
  }

  // Check for totals row pattern
  if (config.totalsRowPattern) {
    return matchesTotalsPattern(row, headerCols, config.totalsRowPattern)
  }

  return false
}

/**
 * Check if row has totals keyword in description
 * @param {Object} row - The data row
 * @param {Object} headerCols - Column mappings
 * @param {Object} config - Model configuration
 * @returns {boolean} - True if totals keyword found
 */
function hasTotalsKeyword(row, headerCols, config) {
  if (!config.totalsRowKeywords || !headerCols.description) {
    return false
  }

  const description = row[headerCols.description]
  if (!description || typeof description !== 'string') {
    return false
  }

  const keywordsPattern = new RegExp(
    String.raw`\b(${config.totalsRowKeywords.join('|')})\b`,
    'i'
  )
  return keywordsPattern.test(description)
}

/**
 * Check if row matches totals pattern
 * @param {Object} row - The data row
 * @param {Object} headerCols - Column mappings
 * @param {Object} pattern - Totals row pattern configuration
 * @returns {boolean} - True if matches pattern
 */
function matchesTotalsPattern(row, headerCols, pattern) {
  // Check if description is empty when required
  if (
    pattern.descriptionEmpty &&
    hasNonEmptyField(row, headerCols.description)
  ) {
    return false
  }

  // Check if commodity code is empty when required
  if (
    pattern.commodityCodeEmpty &&
    hasNonEmptyField(row, headerCols.commodity_code)
  ) {
    return false
  }

  // Check if country of origin is also empty (totals rows shouldn't have CoO)
  if (
    pattern.descriptionEmpty &&
    pattern.commodityCodeEmpty &&
    hasNonEmptyField(row, headerCols.country_of_origin)
  ) {
    return false
  }

  // Check if only numeric fields are populated
  if (pattern.hasNumericOnly) {
    return hasNumericData(row, headerCols)
  }

  return false
}

/**
 * Check if a field has non-empty value
 * @param {Object} row - The data row
 * @param {string} colKey - Column key
 * @returns {boolean} - True if field has content
 */
function hasNonEmptyField(row, colKey) {
  if (!colKey) {
    return false
  }
  const value = row[colKey]
  return value && typeof value === 'string' && value.trim().length > 0
}

/**
 * Check if row has numeric data in weight/package fields
 * @param {Object} row - The data row
 * @param {Object} headerCols - Column mappings
 * @returns {boolean} - True if has numeric data
 */
function hasNumericData(row, headerCols) {
  return !!(
    (headerCols.number_of_packages && row[headerCols.number_of_packages]) ||
    (headerCols.total_net_weight_kg && row[headerCols.total_net_weight_kg]) ||
    (headerCols.gross_weight_kg && row[headerCols.gross_weight_kg])
  )
}

/**
 * Check if a row is a repeated header row
 * @param {Object} row - The data row
 * @param {Object} originalHeaderRow - The original header row from sheet
 * @param {Object} headerCols - Column mappings
 * @param {Object} config - Model configuration (must include regex object for mandatory fields)
 * @returns {boolean} - True if row is a repeated header
 */
function isRepeatedHeaderRow(row, originalHeaderRow, headerCols, config) {
  if (!config.skipRepeatedHeaders) {
    return false
  }

  // Get mandatory field names from config.regex object
  const mandatoryFieldNames = config.regex ? Object.keys(config.regex) : []
  if (mandatoryFieldNames.length === 0) {
    return false
  }

  // Filter to only check mandatory fields that are mapped
  const mandatoryMappedFields = mandatoryFieldNames
    .map((fieldName) => headerCols[fieldName])
    .filter(Boolean)

  if (mandatoryMappedFields.length === 0) {
    return false
  }

  const headerMatches = mandatoryMappedFields.filter((colKey) =>
    isHeaderMatch(row, originalHeaderRow, colKey)
  ).length

  // Require all mandatory fields to match (100%)
  return headerMatches === mandatoryMappedFields.length
}

/**
 * Check if a single column matches header value
 * @param {Object} row - The data row
 * @param {Object} originalHeaderRow - The original header row
 * @param {string} colKey - Column key to check
 * @returns {boolean} - True if values match
 */
function isHeaderMatch(row, originalHeaderRow, colKey) {
  if (!row[colKey] || !originalHeaderRow[colKey]) {
    return false
  }

  const currentValue = String(row[colKey]).toLowerCase().trim()
  const headerValue = String(originalHeaderRow[colKey]).toLowerCase().trim()

  // Exact match only
  return currentValue === headerValue
}

/**
 * Check if a row is empty (all mapped columns are empty)
 * @param {Object} row - The data row
 * @param {Object} headerCols - Column mappings
 * @returns {boolean} - True if row is empty
 */
function isEmptyRow(row, headerCols) {
  return Object.values(headerCols).every(
    (colKey) => !colKey || !row[colKey] || String(row[colKey]).trim() === ''
  )
}

/**
 * Filter rows to exclude totals, headers, and empty rows from validation
 * @param {Array} packingListJson - Raw sheet data
 * @param {number} headerRowIndex - Index of header row
 * @param {number} dataStartRow - Index where data starts
 * @param {Object} headerCols - Column mappings
 * @param {Object} config - Model configuration
 * @param {string} sheetName - Sheet name for error reporting
 * @returns {Array} - Filtered rows with metadata
 */
function filterValidatableRows(
  packingListJson,
  headerRowIndex,
  dataStartRow,
  headerCols,
  config,
  sheetName
) {
  const originalHeaderRow = packingListJson[headerRowIndex]

  return packingListJson
    .slice(dataStartRow)
    .map((row, index) => ({
      row,
      originalIndex: dataStartRow + index,
      actualRowNumber: dataStartRow + index + 1,
      sheetName
    }))
    .filter(({ row }) => {
      // Skip empty rows
      if (isEmptyRow(row, headerCols)) {
        return false
      }

      // Skip totals rows
      if (isTotalsRow(row, headerCols, config)) {
        return false
      }

      // Skip repeated header rows
      if (isRepeatedHeaderRow(row, originalHeaderRow, headerCols, config)) {
        return false
      }
      return true
    })
}

export { isTotalsRow, isRepeatedHeaderRow, isEmptyRow, filterValidatableRows }
