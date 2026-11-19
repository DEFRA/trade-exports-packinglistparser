/**
 * GIOVANNI Excel parser - Model 1
 * @module parsers/giovanni/model1
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import { mapParser } from '../../parser-map.js'
import * as regex from '../../../utilities/regex.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import { isZeroOrEmpty } from '../../parser-row-filter.js'

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

    // Filter out drag-down rows with zero or empty values in all core fields
    packingListContents = packingListContents.filter(
      (row) =>
        ![
          row.description,
          row.commodity_code,
          row.number_of_packages,
          row.total_net_weight_kg
        ].every(isZeroOrEmpty)
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
    logger.error(formatError(err), 'Error in Giovanni 1 parser')
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
