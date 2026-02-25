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
  removeBadData,
  getItemFailureMessage
} from '../validators/packing-list-validator-utilities.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { noMatchParsers } from '../model-parsers.js'
import {
  nowNs,
  durationNs,
  durationMs,
  measureSync,
  measureAsync,
  toEventReason,
  logEcsEvent
} from '../../common/helpers/logging/performance.js'

const logger = createLogger()

function logExtractionCompleted(parseDurationNs) {
  logEcsEvent(logger, {
    message: 'Parser extraction completed',
    type: 'info',
    action: 'generate_parsed_packing_list_parse',
    duration: parseDurationNs,
    reason: toEventReason({
      durationMs: durationMs(parseDurationNs)
    })
  })
}

function addFailureMessages(
  parsedPackingList,
  validateCountryOfOrigin,
  unitInHeader
) {
  return parsedPackingList.items.map((item) => ({
    ...item,
    failure: getItemFailureMessage(item, validateCountryOfOrigin, unitInHeader)
  }))
}

function logGenerateParsedPackingListCompleted({
  totalDurationNs,
  parsedPackingList,
  validateCountryOfOrigin,
  unitInHeader,
  parseDurationNs,
  removeEmptyDurationNs,
  mapFailuresDurationNs,
  validateDurationNs,
  removeBadDataDurationNs
}) {
  logEcsEvent(logger, {
    message: 'generateParsedPackingList completed',
    type: 'end',
    action: 'generate_parsed_packing_list',
    outcome: 'success',
    duration: totalDurationNs,
    reason: toEventReason({
      itemCount: parsedPackingList.items.length,
      validateCountryOfOrigin,
      unitInHeader,
      durationMs: durationMs(totalDurationNs),
      stages: {
        parseDurationMs: durationMs(parseDurationNs),
        removeEmptyItemsDurationMs: durationMs(removeEmptyDurationNs),
        mapFailureMessagesDurationMs: durationMs(mapFailuresDurationNs),
        validateDurationMs: durationMs(validateDurationNs),
        removeBadDataDurationMs: durationMs(removeBadDataDurationNs)
      }
    })
  })
}

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
    logger.info(`Detected Excel file for ${fileName}`)
    parser = getExcelParser(sanitizedPackingList, fileName)
  } else if (fileExtension.isCsv(fileName)) {
    logger.info(`Detected CSV file for ${fileName}`)
    parser = getCsvParser(sanitizedPackingList, fileName)
  } else if (fileExtension.isPdf(fileName)) {
    logger.info(`Detected PDF file for ${fileName}`)
    parser = await getPdfNonAiParser(sanitizedPackingList, fileName)
  } else {
    parser = null
  }

  // If no parser found, return UNRECOGNISED
  if (parser === null || Object.keys(parser).length === 0) {
    logger.info(`Failed to parse packing list for file ${fileName}, no match`)
    parser = noMatchParsers.UNRECOGNISED
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
  const totalStartNs = nowNs()

  // Data Extraction
  const { result: parsedPackingList, durationNs: parseDurationNs } =
    await measureAsync(() =>
      parser.parse(sanitisedPackingList, sanitizedFullPackingList)
    )

  logExtractionCompleted(parseDurationNs)

  // Data Validation & Cleanup

  // Remove items with all null/undefined values
  const { result: nonEmptyItems, durationNs: removeEmptyDurationNs } =
    measureSync(() => removeEmptyItems(parsedPackingList.items))
  parsedPackingList.items = nonEmptyItems

  // Generate item failure messages before removeBadData so validation can
  // distinguish between invalid and missing net weight/packages
  const validateCountryOfOrigin =
    parsedPackingList.validateCountryOfOrigin ?? false
  const unitInHeader = parsedPackingList.unitInHeader ?? false

  const {
    result: itemsWithFailureMessages,
    durationNs: mapFailuresDurationNs
  } = measureSync(() =>
    addFailureMessages(parsedPackingList, validateCountryOfOrigin, unitInHeader)
  )
  parsedPackingList.items = itemsWithFailureMessages

  // Run validation
  const { result: validationResults, durationNs: validateDurationNs } =
    measureSync(() =>
      packingListValidator.validatePackingList(parsedPackingList)
    )

  // Set validation flags
  parsedPackingList.business_checks.all_required_fields_present =
    validationResults.hasAllFields

  parsedPackingList.business_checks.failure_reasons =
    validationResults.failureReasons ? validationResults.failureReasons : null

  // Remove items with invalid or missing critical data
  const { result: cleanedItems, durationNs: removeBadDataDurationNs } =
    measureSync(() => removeBadData(parsedPackingList.items))
  parsedPackingList.items = cleanedItems

  // Add dispatch location
  parsedPackingList.dispatchLocationNumber = dispatchLocation

  const totalDurationNs = durationNs(totalStartNs)
  logGenerateParsedPackingListCompleted({
    totalDurationNs,
    parsedPackingList,
    validateCountryOfOrigin,
    unitInHeader,
    parseDurationNs,
    removeEmptyDurationNs,
    mapFailuresDurationNs,
    validateDurationNs,
    removeBadDataDurationNs
  })

  return parsedPackingList
}

export { findParser, generateParsedPackingList }
