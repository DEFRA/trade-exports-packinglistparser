/**
 * MARS Excel parser - Model 1
 * @module parsers/mars/model1
 */
import combineParser from '../../parser-combine.js'
import ParserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import { mapParser } from '../../parser-map.js'
import * as regex from '../../../utilities/regex.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'

const logger = createLogger()

/**
 * Parse the provided packing list JSON for MARS model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    const headerTitles = Object.values(headers.MARS1.regex)
    const callback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    const establishmentNumber = regex.findMatch(
      headers.MARS1.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    for (const sheet of sheets) {
      establishmentNumbers = regex.findAllMatches(
        regex.remosRegex,
        packingListJson[sheet],
        establishmentNumbers
      )

      const headerRow = rowFinder(packingListJson[sheet], callback)
      const dataRow = headerRow + 1

      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.MARS1,
        sheet
      )
      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      ParserModel.MARS1,
      establishmentNumbers,
      headers.MARS1
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in Mars Model 1 parser')
    return combineParser.combine(null, [], false, ParserModel.NOMATCH)
  }
}
