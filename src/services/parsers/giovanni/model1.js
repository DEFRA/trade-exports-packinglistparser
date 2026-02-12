/**
 * GIOVANNI Excel parser - Model 1
 * @module parsers/giovanni/model1
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import { mapParser } from '../../parser-map.js'
import * as regex from '../../../utilities/regex.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'

const logger = createLogger()

/**
 * Parse the provided packing list JSON for GIOVANNI model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    const headerTitles = Object.values(headers.GIOVANNI1.regex)
    const callback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    const establishmentNumber = regex.findMatch(
      headers.GIOVANNI1.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    for (const sheet of sheets) {
      establishmentNumbers = regex.findAllMatches(
        regex.remosRegex,
        packingListJson[sheet],
        establishmentNumbers
      )

      // Find header row for each sheet individually
      const headerRow = rowFinder(packingListJson[sheet], callback)
      const dataRow = headerRow + 1

      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.GIOVANNI1,
        sheet
      )

      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    // Filter out drag-down rows with all zeros
    packingListContents = packingListContents.filter(
      (row) =>
        !(
          row.description === 0 &&
          row.commodity_code === 0 &&
          row.number_of_packages === 0 &&
          row.total_net_weight_kg === 0
        )
    )

    // Filter out rows with all null values
    packingListContents = packingListContents.filter(
      (row) =>
        !(
          row.description === null &&
          row.commodity_code === null &&
          row.number_of_packages === null &&
          row.total_net_weight_kg === null
        )
    )

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.GIOVANNI1,
      establishmentNumbers,
      headers.GIOVANNI1
    )
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in Giovanni 1 parser'
    )
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
