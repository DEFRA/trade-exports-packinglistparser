/**
 * NUTRICIA Excel parser - Model 2
 * @module parsers/nutricia/model2
 */
import parserModel from '../../parser-model.js'
import combineParser from '../../parser-combine.js'
import { mapParser } from '../../parser-map.js'
import headers from '../../model-headers.js'
import * as regex from '../../../utilities/regex.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'

const logger = createLogger()

/**
 * Parse the provided packing list JSON for NUTRICIA model 2.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    const establishmentNumber = regex.findMatch(
      headers.NUTRICIA2.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    const headerTitles = Object.values(headers.NUTRICIA2.regex)
    const callback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

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
        headers.NUTRICIA2,
        sheet
      )

      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.NUTRICIA2,
      establishmentNumbers,
      headers.NUTRICIA2
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in parse() for Nutricia Model 2')
    return combineParser.combine(null, [], false, parserModel.NOMATCH)
  }
}
