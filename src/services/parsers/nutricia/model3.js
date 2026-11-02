/**
 * Nutricia Excel parser - Model 3
 * @module parsers/nutricia/model3
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
 * Remove non-data rows that can appear after data (for example declaration/footer rows).
 * @param {Array<Object>} items - Parsed row items.
 * @returns {Array<Object>} Filtered data rows.
 */
function filterNonDataRows(items) {
  return items.filter((item) => {
    const coreDataFields = [
      item.description,
      item.number_of_packages,
      item.total_net_weight_kg,
      item.country_of_origin
    ]

    return coreDataFields.some((value) => value !== null)
  })
}

/**
 * Parse the provided packing list JSON for Nutricia model 3.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let establishmentNumbers = []

    const establishmentNumber = regex.findMatch(
      headers.NUTRICIA3.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    const headerTitles = Object.values(headers.NUTRICIA3.regex)
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

      const parsedItems = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.NUTRICIA3,
        sheet
      )

      packingListContents = packingListContents.concat(
        filterNonDataRows(parsedItems)
      )
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.NUTRICIA3,
      establishmentNumbers,
      headers.NUTRICIA3
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in Nutricia Model 3 parser')
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
