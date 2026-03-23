/**
 * GIOVANNI Excel parser - Model 2
 * @module parsers/giovanni/model2
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

const logger = createLogger()

/**
 * Parse the provided packing list JSON for GIOVANNI model 2.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []
    const headerTitles = Object.values(headers.GIOVANNI2.regex)
    const callback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    const establishmentNumber = regex.findMatch(
      headers.GIOVANNI2.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    for (const sheet of sheets) {
      establishmentNumbers = regex.findAllMatches(
        /(RMS-GB-\d{6}-\d{3})/i,
        packingListJson[sheet],
        establishmentNumbers
      )

      const headerRow = rowFinder(packingListJson[sheet], callback)
      const dataRow = headerRow + 1

      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.GIOVANNI2,
        sheet
      )

      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    packingListContents = packingListContents.filter(
      (row) =>
        !(
          row.description === '(blank)' &&
          row.commodity_code === '(blank)' &&
          row.number_of_packages === 0 &&
          (row.total_net_weight_kg === 0 || row.total_net_weight_kg === null) &&
          row.country_of_origin === '(blank)'
        )
    )

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.GIOVANNI2,
      establishmentNumbers,
      headers.GIOVANNI2
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in Giovanni 2 parser')
    return combineParser.combine(null, [], false, parserModel.NOMATCH)
  }
}
