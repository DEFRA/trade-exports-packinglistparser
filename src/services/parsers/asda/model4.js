/**
 * ASDA CSV parser - Model 4
 * @module parsers/asda/model4
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import csvHeaders from '../../model-headers-csv.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'

const logger = createLogger()

/**
 * Parse the provided CSV packing list for ASDA model 4.
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
      csvHeaders.ASDA4.establishmentNumber.regex,
      packingListCsv
    )

    // If no establishment number found, return NOMATCH
    if (!establishmentNumber) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    // Find all establishment numbers for validation
    establishmentNumbers = regex.findAllMatches(
      regex.remosRegex,
      packingListCsv,
      establishmentNumbers
    )

    // Find header row using the header patterns
    const headerTitles = Object.values(csvHeaders.ASDA4.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    const headerRow = rowFinder(packingListCsv, headerCallback)
    const dataRow = headerRow + 1

    // Map parser for CSV (null for sheet name since CSV has no sheets)
    packingListContents = mapParser(
      packingListCsv,
      headerRow,
      dataRow,
      csvHeaders.ASDA4,
      null
    )

    // CRITICAL: Include headers parameter (6th parameter) for CoO validation
    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.ASDA4,
      establishmentNumbers,
      csvHeaders.ASDA4
    )
  } catch (err) {
    logger.error(`Error parsing ASDA Model 4: ${err.message}`, {
      stack: err.stack
    })
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
