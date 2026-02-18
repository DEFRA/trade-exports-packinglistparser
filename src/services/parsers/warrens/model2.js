/**
 * WARRENS2 parser implementation
 *
 * Parses WARRENS2 Excel packing lists using header matching and
 * `mapParser` then returns the combined result.
 * @module parsers/warrens/model2
 */
import combineParser from '../../parser-combine.js'
import ParserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import * as regex from '../../../utilities/regex.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import { mapParser } from '../../parser-map.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'

const logger = createLogger()

/**
 * Core parse routine used by WARRENS2 and other wrappers.
 * @param {Object} packingListJson - Workbook JSON object keyed by sheet.
 * @param {Object} model - Parser model constant to include in result.
 * @param {RegExp} establishmentNumberRegex - Regex to extract establishment.
 * @returns {Object} Combined parser result.
 */
export function parseModel(packingListJson, model, establishmentNumberRegex) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let establishmentNumbers = []

    const headerTitles = Object.values(headers.WARRENS2.regex)
    const callback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    const firstValidSheet = sheets.find(
      (s) => !headers.WARRENS2.invalidSheets.includes(s)
    )

    let establishmentNumber = null
    if (firstValidSheet) {
      establishmentNumber = regex.findMatch(
        establishmentNumberRegex,
        packingListJson[firstValidSheet]
      )
    }

    for (const sheet of sheets) {
      establishmentNumbers = regex.findAllMatches(
        regex.remosRegex,
        packingListJson[sheet],
        establishmentNumbers
      )

      const headerRow = rowFinder(packingListJson[sheet], callback)
      const dataRow = headerRow + 1
      if (!headers.WARRENS2.invalidSheets.includes(sheet)) {
        const mappedRows = mapParser(
          packingListJson[sheet],
          headerRow,
          dataRow,
          headers.WARRENS2,
          sheet
        )
        packingListContents = packingListContents.concat(mappedRows)
      }
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      model,
      establishmentNumbers,
      headers.WARRENS2
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in Warrens Model 2 parser')
    return combineParser.combine(null, [], false, ParserModel.NOMATCH)
  }
}

/**
 * Wrapper parse function for WARRENS2.
 * @param {Object} packingListJson - Workbook JSON.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  return parseModel(
    packingListJson,
    ParserModel.WARRENS2,
    headers.WARRENS2.establishmentNumber.regex
  )
}
