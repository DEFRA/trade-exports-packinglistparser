/**
 * BOOKER Excel parser - Model 2
 * @module parsers/booker/model2
 */
import * as combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'

const logger = createLogger()

/**
 * Parse the provided packing list JSON for BOOKER model 2.
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
      headers.BOOKER2.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    const headerTitles = Object.values(headers.BOOKER2.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    const footerValues = [/^TOTALS$/i]
    const callback = function (x) {
      return regex.testAllPatterns(footerValues, x)
    }

    for (const sheet of sheets) {
      establishmentNumbers = regex.findAllMatches(
        /RMS-GB-\d{6}-\d{3}/i,
        packingListJson[sheet],
        establishmentNumbers
      )

      const footerRow = rowFinder(packingListJson[sheet], callback)
      if (footerRow !== -1) {
        packingListJson[sheet] = packingListJson[sheet].slice(0, footerRow)
      }

      const headerRow = rowFinder(packingListJson[sheet], headerCallback)
      const dataRow = headerRow + 1

      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.BOOKER2,
        sheet
      )
      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.BOOKER2,
      establishmentNumbers,
      headers.BOOKER2
    )
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in Booker Model 2 parser'
    )
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
