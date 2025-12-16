/**
 * Parser selector helpers
 *
 * Helpers to select the appropriate parser implementation for Excel, CSV
 * and PDF packing lists based on header matching rules and REMOS values.
 */

// TODO: Import these from model-parsers when created
// import {
//   parsersExcel,
//   parsersCsv,
//   parsersPdf,
//   parsersPdfNonAi,
//   noMatchParsers
// } from '../model-parsers.js'

// Placeholder - will be replaced with actual imports
const parsersExcel = {}
const parsersCsv = {}
const parsersPdf = {}
const parsersPdfNonAi = {}
const noMatchParsers = {
  NOREMOS: { matches: () => false },
  NOREMOSCSV: { matches: () => false },
  NOREMOSPDF: { matches: async () => false }
}

// TODO: Import these from model-headers when created
// import headers from '../model-headers/index.js'
// import headersCsv from '../model-headers-csv/index.js'
// import headersPdf from '../model-headers-pdf/index.js'
const headers = {}
const headersCsv = {}
const headersPdf = {}

/**
 * Get Excel parser based on REMOS validation and header matching.
 *
 * @param {Object} sanitisedPackingList - Sanitized Excel data
 * @param {string} filename - Original filename
 * @returns {Object} Matched parser or NOREMOS parser
 */
function getExcelParser(sanitisedPackingList, filename) {
  return getParser(
    sanitisedPackingList,
    filename,
    parsersExcel,
    headers,
    noMatchParsers.NOREMOS
  )
}

/**
 * Get CSV parser based on REMOS validation and header matching.
 *
 * @param {Object} sanitisedPackingList - Sanitized CSV data
 * @param {string} filename - Original filename
 * @returns {Object} Matched parser or NOREMOSCSV parser
 */
function getCsvParser(sanitisedPackingList, filename) {
  return getParser(
    sanitisedPackingList,
    filename,
    parsersCsv,
    headersCsv,
    noMatchParsers.NOREMOSCSV
  )
}

/**
 * Generic parser selector with REMOS validation and retailer matching.
 *
 * - REMOS Validation: Check if document contains valid REMOS
 * - Retailer Matcher Selection: Loop through parsers to find match
 *
 * @param {Object} sanitisedPackingList - Sanitized packing list data
 * @param {string} filename - Original filename
 * @param {Object} parsers - Collection of parser implementations
 * @param {Object} parserHeaders - Header definitions for validation
 * @param {Object} nomatch - No-match parser for documents without REMOS
 * @returns {Object} Matched parser or nomatch parser
 */
function getParser(
  sanitisedPackingList,
  filename,
  parsers,
  parserHeaders,
  nomatch
) {
  let parser = null

  // REMOS Validation
  if (nomatch.matches(sanitisedPackingList, filename)) {
    // Retailer Matcher Selection
    // Iterate through all available parsers
    for (const key in parsers) {
      if (
        parser === null && // check if parser has already been matched
        parserHeaders[key]?.deprecated !== true && // check if model is deprecated
        parsers[key].matches(sanitisedPackingList, filename) === 'CORRECT'
      ) {
        parser = parsers[key]
      }
    }
  } else {
    // No REMOS found, return nomatch parser
    parser = nomatch
  }

  return parser
}

/**
 * Get PDF parser with AI-based Document Intelligence.
 *
 * @param {Buffer} sanitisedPackingList - PDF buffer
 * @param {string} filename - Original filename
 * @returns {Promise<Object>} Matched parser or empty object
 */
async function getPdfParser(sanitisedPackingList, filename) {
  let parser = {}

  // REMOS Validation for PDF
  const remos = await noMatchParsers.NOREMOSPDF.matches(sanitisedPackingList)

  if (remos) {
    let result = {}

    // Retailer Matcher Selection
    for (const pdfModel in parsersPdf) {
      if (headersPdf[pdfModel]?.establishmentNumber?.regex?.test(remos)) {
        result = await parsersPdf[pdfModel].matches(
          sanitisedPackingList,
          filename
        )
      }

      if (result.isMatched === 'CORRECT') {
        parser.parser = parsersPdf[pdfModel]
        parser.result = result
        break
      }
    }
  } else {
    parser = noMatchParsers.NOREMOS
  }

  return parser
}

/**
 * Get non-AI PDF parser.
 *
 * @param {Buffer} sanitisedPackingList - PDF buffer
 * @param {string} filename - Original filename
 * @returns {Promise<Object>} Matched parser or null
 */
async function getPdfNonAiParser(sanitisedPackingList, filename) {
  let parser = null

  // REMOS Validation
  if (await noMatchParsers.NOREMOSPDF.matches(sanitisedPackingList, filename)) {
    // Retailer Matcher Selection
    for (const key in parsersPdfNonAi) {
      if (
        (await parsersPdfNonAi[key].matches(sanitisedPackingList, filename)) ===
        'CORRECT'
      ) {
        parser = parsersPdfNonAi[key]
      }
    }
  } else {
    parser = noMatchParsers.NOREMOS
  }

  return parser
}

export { getExcelParser, getCsvParser, getPdfParser, getPdfNonAiParser }
