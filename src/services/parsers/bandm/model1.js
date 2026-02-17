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
 * Checks if a row is completely empty or has no identifying information.
 * Filters rows that have no description, commodity code, nature, or origin.
 *
 * Note: Excludes blanket values (nirms, type_of_treatment, total_net_weight_unit)
 * that are applied from document headers, not from the actual row cells.
 *
 * @param {Object} item - The item to check.
 * @returns {boolean} True if the row should be filtered.
 */
function isEmptyRow(item) {
  const isEmpty = (value) => {
    if (value === null || value === undefined) {
      return true
    }
    if (typeof value === 'string' && value.trim() === '') {
      return true
    }
    return false
  }

  // Check if any identifying field has data
  const hasDescription = !isEmpty(item.description)
  const hasCommodityCode = !isEmpty(item.commodity_code)
  const hasNature = !isEmpty(item.nature_of_products)
  const hasOrigin = !isEmpty(item.country_of_origin)

  // Filter rows with no identifying information
  return !hasDescription && !hasCommodityCode && !hasNature && !hasOrigin
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
 * Checks if a row is a totals/summary row based on keywords.
 * @param {Object} item - The item to check.
 * @returns {boolean} True if the row is a totals row.
 */
function isTotalsRow(item) {
  if (!item.description) {
    return false
  }

  const hasKeyword = headers.BANDM1.totalsRowKeywords.some((keyword) =>
    item.description.toLowerCase().includes(keyword)
  )
  return hasKeyword
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
  return items.map((item) => {
    const cleaned = { ...item }

    // Clean string fields (convert whitespace-only to null)
    const stringFields = [
      'description',
      'commodity_code',
      'nature_of_products',
      'country_of_origin'
    ]
    stringFields.forEach((field) => {
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
