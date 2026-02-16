/**
 * TURNERS Excel parser - Model 1
 */
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import modelHeaders from '../../model-headers.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'

const logger = createLogger()

/**
 * Helper function to determine if an item is a header row (mandatory headers only).
 * @param {Object} item - Row item returned by `mapParser`.
 * @returns {boolean} True when the row matches header patterns.
 */
export function isHeaderRow(item) {
  return Object.entries(modelHeaders.TURNERS1.regex).every(([key, pattern]) =>
    pattern.test(item[key])
  )
}

/**
 * Parse the provided packing list JSON for TURNERS model 1.
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
      modelHeaders.TURNERS1.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    const headerTitles = Object.values(modelHeaders.TURNERS1.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    for (const sheet of sheets) {
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
        modelHeaders.TURNERS1,
        sheet
      )

      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    // filter the packing list to remove headers
    packingListContents = packingListContents.filter(
      (item) => !isHeaderRow(item)
    )

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.TURNERS1,
      establishmentNumbers,
      modelHeaders.TURNERS1
    )
  } catch (err) {
    logger.error(formatError(err), 'Error parsing TURNERS Model 1')
    return combineParser.combine(null, [], false, parserModel.NOMATCH)
  }
}
