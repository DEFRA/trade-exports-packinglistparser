/**
 * Burbank Excel parser - Model 1
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import modelHeaders from '../../model-headers.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'

const logger = createLogger()

const COMMODITY_CODE_SHORT_LENGTH = 9

/**
 * Helper to determine if a mapped row is itself a header row.
 * Used to strip repeated headers that appear in multi-sheet workbooks.
 * @param {Object} item - Row item returned by `mapParser`.
 * @returns {boolean} True when the row matches header patterns.
 */
export function isHeaderRow(item) {
  return Object.entries(modelHeaders.BURBANK1.regex).every(([key, pattern]) =>
    pattern.test(item[key])
  )
}

/**
 * Parse the provided packing list JSON for Burbank Model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    // Find primary establishment number from the first sheet
    const establishmentNumber = regex.findMatch(
      modelHeaders.BURBANK1.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    // Build header callback used by rowFinder
    const headerTitles = Object.values(modelHeaders.BURBANK1.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    for (const sheet of sheets) {
      // Skip lookup/reference sheets that carry no product data
      if (modelHeaders.BURBANK1.invalidSheets.includes(sheet)) {
        continue
      }

      // Collect all establishment numbers across all data sheets
      establishmentNumbers = regex.findAllMatches(
        regex.remosRegex,
        packingListJson[sheet],
        establishmentNumbers
      )

      // Locate the header row then read data from the row beneath it
      const headerRow = rowFinder(packingListJson[sheet], headerCallback)
      const dataRow = headerRow + 1

      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        modelHeaders.BURBANK1,
        sheet
      )

      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    // Remove any repeated header rows from the data set
    packingListContents = packingListContents.filter(
      (item) => !isHeaderRow(item)
    )

    // Pad 9-digit commodity codes to the required 10-digit length
    packingListContents = packingListContents.map((item) => {
      const code =
        item.commodity_code != null
          ? String(item.commodity_code)
          : item.commodity_code
      if (code != null && code.length === COMMODITY_CODE_SHORT_LENGTH) {
        return { ...item, commodity_code: `0${code}` }
      }
      return item
    })

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.BURBANK1,
      establishmentNumbers,
      modelHeaders.BURBANK1
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in parse() for Burbank Model 1')
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
