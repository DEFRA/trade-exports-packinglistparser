/**
 * BOOTS Excel parser - Model 1
 * @module parsers/boots/model1
 */
import combineParser from '../../parser-combine.js'
import ParserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'

const logger = createLogger()

/**
 * Parse the provided packing list JSON for BOOTS model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  const sheets = Object.keys(packingListJson)
  const establishmentNumber = regex.findMatch(
    headers.BOOTS1.establishmentNumber.regex,
    packingListJson[sheets[0]]
  )

  try {
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    const headerTitles = Object.values(headers.BOOTS1.regex)
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
        headers.BOOTS1,
        sheet
      )

      const footerValues = new Set([
        'Total Quantity of items:',
        'Gross Mass in Kgs:',
        'Total Value in GBP:'
      ])
      packingListContents = packingListContents.concat(
        packingListContentsTemp.filter(
          (row) => !footerValues.has(row.description)
        )
      )
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      ParserModel.BOOTS1,
      establishmentNumbers,
      headers.BOOTS1
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in Boots Model 1 parser')
    return combineParser.combine(
      establishmentNumber,
      [],
      false,
      ParserModel.BOOTS1,
      [],
      headers.BOOTS1
    )
  }
}
