/**
 * Lactalis McLelland Excel parser - Model 1
 * @module parsers/lactalis/model1
 *
 * Handles both LACTALIS MCL (Q8) and LACTALIS LNCD (Q7) sheet formats.
 * Filters out zero-filled rows and "(blank)" placeholder rows.
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
 * Parse the provided packing list JSON for Lactalis McLelland Model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    // Find primary establishment number
    const establishmentNumber = regex.findMatch(
      headers.LACTALIS1.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    // Setup header callback
    const headerTitles = Object.values(headers.LACTALIS1.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    // Process each sheet
    for (const sheet of sheets) {
      // Find all establishment numbers
      establishmentNumbers = regex.findAllMatches(
        regex.remosRegex,
        packingListJson[sheet],
        establishmentNumbers
      )

      // Find header row
      const headerRow = rowFinder(packingListJson[sheet], headerCallback)
      const dataRow = headerRow + 1

      // Map data rows
      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.LACTALIS1,
        sheet
      )

      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    // Filter out "(blank)" placeholder rows and zero-filled rows
    packingListContents = packingListContents.filter((item) => {
      const desc = String(item.description ?? '').trim()
      return desc !== '' && desc !== '(blank)' && desc !== '0'
    })

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.LACTALIS1,
      establishmentNumbers,
      headers.LACTALIS1
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in parse()')
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
