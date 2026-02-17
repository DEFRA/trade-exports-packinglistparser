/**
 * B&M Excel parser - Model 1
 * @module parsers/bandm/model1
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import * as regex from '../../../utilities/regex.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'

const logger = createLogger()

/**
 * Creates a callback function to find header rows by testing against header patterns.
 * @returns {Function} A callback function for rowFinder.
 */
function createHeaderRowFinder() {
  const headerTitles = Object.values(headers.BANDM1.regex)
  return function (x) {
    return regex.testAllPatterns(headerTitles, x)
  }
}

/**
 * Checks if a row is completely empty (no meaningful data in any field).
 * Only rows that are COMPLETELY empty should be filtered out.
 * Rows with any meaningful data should be included for validation.
 * 
 * Note: Excludes blanket values (nirms, type_of_treatment, total_net_weight_unit) 
 * that are applied from document headers, not from the actual row cells.
 * 
 * @param {Object} item - The item to check.
 * @returns {boolean} True if the row is completely empty.
 */
function isEmptyRow(item) {
  /**
   * Helper to check if a value is effectively empty (null, undefined, empty string, whitespace, or zero)
   * Zero is considered empty because 0 packages or 0 weight is not meaningful data.
   */
  const isEmpty = (value) => {
    if (value === null || value === undefined) return true
    if (typeof value === 'string' && value.trim() === '') return true
    if (typeof value === 'number' && value === 0) return true
    return false
  }
  
  // Check ONLY the fields that come directly from Excel cells (not blanket values)
  // A row is empty only if it has no identifying info AND no meaningful quantities AND no origin
  const coreFields = [
    item.description,
    item.commodity_code,
    item.nature_of_products,
    item.number_of_packages,
    item.total_net_weight_kg,
    item.country_of_origin
  ]
  
  // Row is empty only if ALL core fields are empty/zero
  return coreFields.every(isEmpty)
}

/**
 * Checks if a row is a repeated header row.
 * @param {Object} item - The item to check.
 * @returns {boolean} True if the row is a repeated header.
 */
function isRepeatedHeaderRow(item) {
  if (!headers.BANDM1.skipRepeatedHeaders || !item.description) {
    return false
  }

  const descLower = item.description.toLowerCase().trim()
  return (
    descLower.includes('item description') ||
    descLower.includes('product code') ||
    descLower.includes('commodity code') ||
    descLower === 'prism'
  )
}

/**
 * Checks if a row is a totals row based on keywords or pattern.
 * @param {Object} item - The item to check.
 * @returns {boolean} True if the row is a totals row.
 */
function isTotalsRow(item) {
  // Check for keyword-based totals rows (primary detection method)
  if (item.description) {
    const hasKeyword = headers.BANDM1.totalsRowKeywords.some((keyword) =>
      item.description.toLowerCase().includes(keyword)
    )
    if (hasKeyword) {
      return true
    }
  }
  
  // Check for numeric-only totals rows (secondary heuristic)
  // Only filter if it has suspiciously large aggregate numbers
  const hasNoDescription = !item.description || (typeof item.description === 'string' && item.description.trim() === '')
  const hasNoCommodityCode = !item.commodity_code || (typeof item.commodity_code === 'string' && item.commodity_code.trim() === '')
  const hasNoCountryOfOrigin = !item.country_of_origin || (typeof item.country_of_origin === 'string' && item.country_of_origin.trim() === '')
  
  // Pattern: empty ALL identifiers + has very large quantities = likely a grand total row
  if (hasNoDescription && hasNoCommodityCode && hasNoCountryOfOrigin) {
    const packages = item.number_of_packages || 0
    const weight = item.total_net_weight_kg || 0
    
    // Only consider it a totals row if quantities are very large (likely aggregated)
    // Using threshold: >20 packages OR >50kg suggests aggregated data
    if (packages > 20 || weight > 50) {
      return true
    }
  }
  
  return false
}

/**
 * Determines if an item should be kept in the filtered results.
 * @param {Object} item - The item to check.
 * @returns {boolean} True if the item should be kept.
 */
function shouldKeepItem(item) {
  if (isEmptyRow(item)) {
    return false
  }

  if (isRepeatedHeaderRow(item)) {
    return false
  }

  if (isTotalsRow(item)) {
    return false
  }

  return true
}

/**
 * Filters out empty rows, totals rows, and repeated header rows from parsed data.
 * @param {Array} items - Array of parsed items to filter.
 * @returns {Array} Filtered array of items.
 */
function filterDataRows(items) {
  if (!headers.BANDM1.skipTotalsRows) {
    return items
  }

  return items.filter(shouldKeepItem)
}

/**
 * Cleans up parsed items by converting whitespace-only strings to null.
 * B&M-specific: handles Excel cells containing only spaces.
 * 
 * Important: This must run AFTER filtering for totals/headers, because those
 * checks need the original string values to detect keywords.
 * 
 * @param {Array} items - Array of parsed items
 * @returns {Array} Items with whitespace-only strings converted to null
 */
function cleanupWhitespace(items) {
  return items.map(item => {
    const cleaned = { ...item }
    
    // Clean string fields (convert whitespace-only to null)
    const stringFields = ['description', 'commodity_code', 'nature_of_products', 'country_of_origin']
    stringFields.forEach(field => {
      if (typeof cleaned[field] === 'string' && cleaned[field].trim() === '') {
        cleaned[field] = null
      }
    })
    
    return cleaned
  })
}

/**
 * Processes a single sheet to extract and filter packing list data.
 * @param {Object} sheetData - The sheet data to process.
 * @param {string} sheetName - The name of the sheet.
 * @param {Function} headerCallback - Callback function to find header rows.
 * @returns {Array} Array of filtered packing list items.
 */
function processSheet(sheetData, sheetName, headerCallback) {
  const headerRow = rowFinder(sheetData, headerCallback)
  const dataRow = headerRow + 1

  const parsedItems = mapParser(
    sheetData,
    headerRow,
    dataRow,
    headers.BANDM1,
    sheetName
  )

  // Filter FIRST (while we still have original string values for totals detection)
  const filteredItems = filterDataRows(parsedItems)
  
  // THEN clean whitespace (after filtering based on keywords)
  return cleanupWhitespace(filteredItems)
}

/**
 * Parse the provided packing list JSON for B&M model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    const packingListContents = []
    let establishmentNumbers = []

    const establishmentNumber = regex.findMatch(
      headers.BANDM1.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    const headerCallback = createHeaderRowFinder()

    for (const sheet of sheets) {
      establishmentNumbers = regex.findAllMatches(
        regex.remosRegex,
        packingListJson[sheet],
        establishmentNumbers
      )

      const sheetItems = processSheet(
        packingListJson[sheet],
        sheet,
        headerCallback
      )
      packingListContents.push(...sheetItems)
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.BANDM1,
      establishmentNumbers,
      headers.BANDM1
    )
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in B&M Model 1 parser'
    )
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
