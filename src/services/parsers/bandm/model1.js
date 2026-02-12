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
 * Checks if a row is empty (both description and commodity code are empty).
 * @param {Object} item - The item to check.
 * @returns {boolean} True if the row is empty.
 */
function isEmptyRow(item) {
  const descEmpty = !item.description || item.description.trim() === ''
  const commodityEmpty =
    !item.commodity_code || String(item.commodity_code).trim() === ''
  return descEmpty && commodityEmpty
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
 * Checks if a row is a totals row based on keywords.
 * @param {Object} item - The item to check.
 * @returns {boolean} True if the row is a totals row.
 */
function isTotalsRow(item) {
  if (!item.description) {
    return false
  }

  return headers.BANDM1.totalsRowKeywords.some((keyword) =>
    item.description.toLowerCase().includes(keyword)
  )
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

  return filterDataRows(parsedItems)
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
