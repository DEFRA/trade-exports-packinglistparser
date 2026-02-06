/**
 * SAVERS Excel parser - Model 1
 * @module parsers/savers/model1
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
 * Parse the provided packing list JSON for SAVERS model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  // Handle null, undefined, or empty files
  if (!packingListJson || typeof packingListJson !== 'object') {
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }

  const sheets = Object.keys(packingListJson)

  if (sheets.length === 0 || !packingListJson[sheets[0]]) {
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }

  // Find primary establishment number
  const establishmentNumber = regex.findMatch(
    headers.SAVERS1.establishmentNumber.regex,
    packingListJson[sheets[0]]
  )

  try {
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    const headerTitles = Object.values(headers.SAVERS1.regex)
    const callback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    for (const sheet of sheets) {
      if (!headers.SAVERS1.invalidSheets.includes(sheet)) {
        const headerRow = rowFinder(packingListJson[sheet], callback)
        const dataRow = headerRow + 1

        packingListContentsTemp = mapParser(
          packingListJson[sheet],
          headerRow,
          dataRow,
          headers.SAVERS1,
          sheet
        )

        establishmentNumbers = regex.findAllMatches(
          regex.remosRegex,
          packingListJson[sheet],
          establishmentNumbers
        )

        packingListContents = packingListContents.concat(
          packingListContentsTemp.filter(
            (row) =>
              !(
                row.description === 0 &&
                row.number_of_packages === 0 &&
                row.total_net_weight_kg === 0
              )
          )
        )
      }
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.SAVERS1,
      establishmentNumbers,
      headers.SAVERS1
    )
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in Savers 1 parser'
    )
    return combineParser.combine(
      establishmentNumber,
      [],
      false,
      parserModel.SAVERS1,
      [],
      headers.SAVERS1
    )
  }
}
