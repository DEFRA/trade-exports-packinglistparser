/**
 * ASDA Excel parser - Model 3
 * @module parsers/asda/model3
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'

const logger = createLogger()

/**
 * Parse the provided packing list JSON for ASDA model 3.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    // Find primary establishment number
    const establishmentNumber = regex.findMatch(
      headers.ASDA3.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    // Setup header callback
    const headerTitles = Object.values(headers.ASDA3.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    // Process each sheet
    for (const sheet of sheets) {
      // Find all establishment numbers
      establishmentNumbers = regex.findAllMatches(
        regex.remosRegex,
        packingListJson[sheet],
        establishmentNumbers
      )

      // Find header row
      const headerRow = rowFinder(packingListJson[sheet], headerCallback)
      const dataRow = headerRow + 1

      // Map data rows
      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.ASDA3,
        sheet
      )

      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    // CRITICAL: Include headers parameter (6th parameter) for CoO validation
    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.ASDA3,
      establishmentNumbers,
      headers.ASDA3 // Required for Country of Origin validation
    )
  } catch (err) {
    logger.error({ err }, 'Error in parse()')
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
