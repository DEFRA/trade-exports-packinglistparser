/**
 * SAINSBURYS Excel parser - Model 1
 * @module parsers/sainsburys/model1
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
 * Parse the provided packing list JSON for SAINSBURYS model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []
    const establishmentNumber =
      regex
        .findMatch(
          headers.SAINSBURYS1.establishmentNumber.regex,
          packingListJson[sheets[0]]
        )
        ?.replaceAll(/\u200B/g, '') ?? null

    const headerTitles = Object.values(headers.SAINSBURYS1.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    for (const sheet of sheets) {
      establishmentNumbers = appendDistinctEstablishmentNumbers(
        establishmentNumbers,
        packingListJson[sheet]
      )

      const headerRow = rowFinder(packingListJson[sheet], headerCallback)
      const dataRow = headerRow + 1
      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.SAINSBURYS1,
        sheet
      )
      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.SAINSBURYS1,
      establishmentNumbers,
      headers.SAINSBURYS1
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in Sainsburys 1 parser')
    return combineParser.combine(null, [], false, parserModel.NOMATCH)
  }
}

/**
 * Find and normalise distinct establishment numbers from a page.
 * Removes zero-width spaces and deduplicates.
 * @param {Array<string>} establishmentNumbers - Existing establishment numbers
 * @param {Array<Object>} page - Page rows to scan for establishment numbers
 * @returns {Array<string>} Updated list of establishment numbers
 */
function appendDistinctEstablishmentNumbers(establishmentNumbers, page) {
  establishmentNumbers = regex.findAllMatches(
    /^(RMS-GB-\d{6}-\d{3})(?:\u200B)?$/,
    page,
    establishmentNumbers
  )

  establishmentNumbers = establishmentNumbers.map((rms) =>
    rms.replaceAll(/\u200B/g, '')
  )
  return [...new Set(establishmentNumbers)]
}
