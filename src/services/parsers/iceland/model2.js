/**
 * Iceland CSV parser - Model 2
 * @module parsers/iceland/model2
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers-csv.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'

const logger = createLogger()

/**
 * Parse the provided CSV packing list for Iceland model 2.
 * @param {Array<Array>} packingListCsv - CSV data as array of row arrays
 * @returns {Object} Combined parser result.
 */
export function parse(packingListCsv) {
  try {
    // Validate input
    if (!packingListCsv || packingListCsv.length === 0) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    let packingListContents = []
    let establishmentNumbers = []

    // Find primary establishment number
    const establishmentNumber = regex.findMatch(
      headers.ICELAND2.establishmentNumber.regex,
      packingListCsv
    )

    // If no establishment number found, return NOMATCH
    if (!establishmentNumber) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    // Find all establishment numbers for validation
    establishmentNumbers = regex.findAllMatches(
      /RMS-GB-\d{6}-\d{3}$/,
      packingListCsv,
      establishmentNumbers
    )

    // Find header row using the header patterns
    const headerTitles = Object.values(headers.ICELAND2.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    const headerRow = rowFinder(packingListCsv, headerCallback)

    // If header not found, return NOMATCH
    if (headerRow === -1) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    const dataRow = headerRow + 1

    // Parse the CSV data using mapParser (no sheet name for CSV)
    packingListContents = mapParser(
      packingListCsv,
      headerRow,
      dataRow,
      headers.ICELAND2,
      null // No sheet name for CSV
    )

    // CRITICAL: Include headers parameter (6th parameter) for validation
    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.ICELAND2,
      establishmentNumbers,
      headers.ICELAND2 // Required for Country of Origin validation
    )
  } catch (err) {
    logger.error({ err }, 'Error in parse()')
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
