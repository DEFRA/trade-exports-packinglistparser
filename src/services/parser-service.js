/**
 * Parser service orchestration
 *
 * Main entry point for packing list parsing. Coordinates sanitization, parser selection,
 * and result generation for Excel, CSV, and PDF documents.
 */
import * as jsonFile from '../utilities/json-file.js'
import * as fileExtension from '../utilities/file-extension.js'
import * as parserFactory from './parsers/parser-factory.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { formatError } from '../common/helpers/logging/error-logger.js'

const logger = createLogger()

/**
 * Find appropriate parser and parse packing list document.
 *
 * @param {Object|Buffer} packingList - Raw packing list data
 * @param {string} fileName - Original filename for type detection
 * @param {string} dispatchLocation - Dispatch location identifier
 * @returns {Promise<Object>} Parsed result with validation
 */
async function findParser(packingList, fileName, dispatchLocation) {
  return parsePackingList(packingList, fileName, dispatchLocation)
}

/**
 * Parse packing list with sanitization and format-specific handling.
 *
 * Flow:
 * - Sanitize input
 * - Find appropriate parser
 * - Extract data using matched parser
 * - Validate and cleanup extracted data
 *
 * @param {Object|Buffer} packingList - Raw packing list data
 * @param {string} fileName - Original filename
 * @param {string} dispatchLocation - Dispatch location identifier
 * @returns {Promise<Object>} Parsed and validated result
 */
async function parsePackingList(packingList, fileName, dispatchLocation) {
  try {
    // Input Sanitization
    logger.info(`Sanitizing packing list input for ${fileName}`)
    const sanitizedPackingList = sanitizeInput(packingList, fileName)

    // Parser Discovery
    const parser = await parserFactory.findParser(
      sanitizedPackingList,
      fileName
    )

    // Data Extraction + Validation/Cleanup
    // For PDFs with AI, use the extracted document
    if (
      fileExtension.isPdf(fileName) &&
      parser.result?.isMatched === 'CORRECT'
    ) {
      return await parserFactory.generateParsedPackingList(
        parser.parser,
        parser.result.document,
        dispatchLocation,
        sanitizedPackingList
      )
    } else {
      return await parserFactory.generateParsedPackingList(
        parser,
        sanitizedPackingList,
        dispatchLocation
      )
    }
  } catch (err) {
    logger.error(formatError(err), 'Error parsing packing list')
    return {}
  }
}

/**
 * Sanitize Excel/CSV input by removing trailing spaces and empty cells.
 * PDF files pass through unchanged as they require different processing.
 *
 * @param {Object|Buffer} packingList - Raw packing list data
 * @param {string} fileName - Original filename for format detection
 * @returns {Object|Buffer} Sanitized data
 */
function sanitizeInput(packingList, fileName) {
  if (fileExtension.isExcel(fileName) || fileExtension.isCsv(fileName)) {
    // Sanitise packing list (remove trailing spaces and empty cells)
    const packingListJson = JSON.stringify(packingList)
    const sanitisedPackingListJson = jsonFile.sanitise(packingListJson)
    return JSON.parse(sanitisedPackingListJson)
  } else {
    // PDF and other formats pass through unchanged
    return packingList
  }
}

export { findParser, parsePackingList, sanitizeInput }
