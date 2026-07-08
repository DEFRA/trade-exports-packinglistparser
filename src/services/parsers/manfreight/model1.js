/**
 * Manfreight Excel parser - Model 1
 * @module parsers/manfreight/model1
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
 * Parse the provided packing list JSON for Manfreight model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    // Setup header callback
    const headerTitles = Object.values(headers.MANFREIGHT1.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    // Find primary establishment number from the first non-excluded sheet
    const firstValidSheet = sheets.find(
      (s) => !headers.MANFREIGHT1.invalidSheets.includes(s)
    )
    const establishmentNumber = firstValidSheet
      ? regex.findMatch(
          headers.MANFREIGHT1.establishmentNumber.regex,
          packingListJson[firstValidSheet]
        )
      : null

    // Process each sheet — collect establishment numbers from all sheets but
    // only extract data rows from valid sheets
    for (const sheet of sheets) {
      // Collect establishment numbers from every sheet, including excluded ones
      establishmentNumbers = regex.findAllMatches(
        regex.remosRegex,
        packingListJson[sheet],
        establishmentNumbers
      )

      if (headers.MANFREIGHT1.invalidSheets.includes(sheet)) {
        continue
      }

      // Find header row
      const headerRow = rowFinder(packingListJson[sheet], headerCallback)
      const dataRow = headerRow + 1

      // Map data rows
      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.MANFREIGHT1,
        sheet
      )

      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    // Remove footer rows that contain only totals (net weight and number of
    // packages) with no identifying product information
    packingListContents = packingListContents.filter(
      (row) =>
        !(
          row.description === null &&
          row.commodity_code === null &&
          row.nature_of_products === null &&
          row.type_of_treatment === null &&
          (row.number_of_packages !== null || row.total_net_weight_kg !== null)
        )
    )

    // CRITICAL: Include headers parameter (6th parameter) for CoO validation
    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.MANFREIGHT1,
      establishmentNumbers,
      headers.MANFREIGHT1 // Required for Country of Origin validation
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in Manfreight 1 parser')
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
