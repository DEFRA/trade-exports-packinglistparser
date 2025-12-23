/**
 * Parser factory module
 *
 * Provides utilities to find the appropriate parser for a given packing
 * list file and to generate a parsed packing list result including
 * validation and cleanup.
 */

import * as fileExtension from '../../utilities/file-extension.js'
import { getCsvParser, getExcelParser, getPdfNonAiParser } from './parsers.js'
import * as packingListValidator from '../validators/packing-list-column-validator.js'
import {
  removeEmptyItems,
  removeBadData
} from '../validators/packing-list-validator-utilities.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const logger = createLogger()

const currentFilename = fileURLToPath(import.meta.url)
const filenameForLogging = path.join('src', currentFilename.split('src')[1])

/**
 * Find a parser suitable for the supplied packing list and filename.
 *
 * Process:
 * - File Type Detection
 * - REMOS Validation (handled by parser selectors)
 * - Retailer Matcher Selection
 *
 * @param {Object} sanitizedPackingList - Sanitised packing list content
 * @param {string} fileName - Original filename supplied by the caller
 * @returns {Promise<Object>} Matching parser module or a no-match parser
 */
async function findParser(sanitizedPackingList, fileName) {
  let parser

  // File Type Detection
  if (fileExtension.isExcel(fileName)) {
    parser = getExcelParser(sanitizedPackingList, fileName)
  } else if (fileExtension.isCsv(fileName)) {
    parser = getCsvParser(sanitizedPackingList, fileName)
  } else if (fileExtension.isPdf(fileName)) {
    // Try non-AI PDF parsers first
    parser = await getPdfNonAiParser(sanitizedPackingList, fileName)
  } else {
    parser = null
  }

  // If no parser found, return UNRECOGNISED
  if (parser === null || Object.keys(parser).length === 0) {
    logger.info(
      { filename: filenameForLogging, function: 'findParser', fileName },
      'Failed to parse packing list, no match'
    )
    // TODO: Import noMatchParsers when model-parsers is created
    parser = { parserModel: 'UNRECOGNISED', parse: () => ({ items: [] }) }
  }

  return parser
}

/**
 * Generate a parsed packing list using the provided parser and then run
 * business validations and cleanup utilities.
 *
 * Data Extraction:
 * - Execute parser.parse() to extract data
 *
 * Data Validation & Cleanup:
 * - Remove empty items
 * - Run validators
 * - Set business_checks flags
 * - Populate failure_reasons
 * - Remove bad data
 *
 * @param {Object} parser - Parser module implementing `parse`
 * @param {Object} sanitisedPackingList - Sanitised packing list content
 * @param {string} dispatchLocation - Dispatch location number
 * @param {Object|null} sanitizedFullPackingList - Optional full packing list
 * @returns {Promise<Object>} Parsed and validated packing list result
 */
async function generateParsedPackingList(
  parser,
  sanitisedPackingList,
  dispatchLocation,
  sanitizedFullPackingList = null
) {
  // Data Extraction
  const parsedPackingList = await parser.parse(
    sanitisedPackingList,
    sanitizedFullPackingList
  )

  // Data Validation & Cleanup

  // Remove items with all null/undefined values
  parsedPackingList.items = removeEmptyItems(parsedPackingList.items)

  // Run validation
  const validationResults =
    packingListValidator.validatePackingList(parsedPackingList)

  // Set validation flags
  parsedPackingList.business_checks.all_required_fields_present =
    validationResults.hasAllFields

  parsedPackingList.business_checks.failure_reasons =
    validationResults.failureReasons ? validationResults.failureReasons : null

  // Remove items with invalid or missing critical data
  parsedPackingList.items = removeBadData(parsedPackingList.items)

  // Add dispatch location
  parsedPackingList.dispatchLocationNumber = dispatchLocation

  return parsedPackingList
}

export { findParser, generateParsedPackingList }
