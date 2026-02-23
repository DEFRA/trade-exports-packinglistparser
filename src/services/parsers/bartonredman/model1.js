/**
 * Barton and Redman Excel parser - Model 1
 * @module parsers/bartonredman/model1
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
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
 * Parse the provided packing list JSON for Barton and Redman model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    const firstValidSheet = sheets.find(
      (sheet) => !headers.BARTONREDMAN1.invalidSheets.includes(sheet)
    )

    let establishmentNumber = null
    if (firstValidSheet) {
      establishmentNumber = regex.findMatch(
        headers.BARTONREDMAN1.establishmentNumber.regex,
        packingListJson[firstValidSheet]
      )
    }

    const headerTitles = Object.values(headers.BARTONREDMAN1.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    for (const sheet of sheets) {
      if (headers.BARTONREDMAN1.invalidSheets.includes(sheet)) {
        continue
      }

      establishmentNumbers = regex.findAllMatches(
        regex.remosRegex,
        packingListJson[sheet],
        establishmentNumbers
      )

      const headerRow = rowFinder(packingListJson[sheet], headerCallback)
      const dataRow = headerRow + 1

      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.BARTONREDMAN1,
        sheet
      )

      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.BARTONREDMAN1,
      establishmentNumbers,
      headers.BARTONREDMAN1
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in Barton and Redman 1 parser')
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
