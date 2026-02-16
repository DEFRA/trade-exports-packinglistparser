/**
 * SAVERS Excel parser - Model 1
 * @module parsers/savers/model1
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
 * Validate input and extract primary establishment number.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Validation result with isValid flag, establishmentNumber, and sheets.
 */
function validateAndExtractEstablishment(packingListJson) {
  if (!packingListJson || typeof packingListJson !== 'object') {
    return { isValid: false, establishmentNumber: null, sheets: [] }
  }

  const sheets = Object.keys(packingListJson)

  if (sheets.length === 0 || !packingListJson[sheets[0]]) {
    return { isValid: false, establishmentNumber: null, sheets }
  }

  const establishmentNumber = regex.findMatch(
    headers.SAVERS1.establishmentNumber.regex,
    packingListJson[sheets[0]]
  )

  return { isValid: true, establishmentNumber, sheets }
}

/**
 * Process a single sheet and extract packing list data.
 * @param {string} sheetName - Name of the sheet being processed.
 * @param {Array} sheetData - Sheet data rows.
 * @param {Array} headerTitles - Expected header patterns.
 * @param {Array} accumulatedEstablishments - Previously found establishment numbers.
 * @returns {Object} Extracted packing list data and updated establishment numbers.
 */
function processSheet(
  sheetName,
  sheetData,
  headerTitles,
  accumulatedEstablishments
) {
  const callback = function (x) {
    return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
  }

  const headerRow = rowFinder(sheetData, callback)
  const dataRow = headerRow + 1

  const packingListData = mapParser(
    sheetData,
    headerRow,
    dataRow,
    headers.SAVERS1,
    sheetName
  )

  const establishments = regex.findAllMatches(
    regex.remosRegex,
    sheetData,
    accumulatedEstablishments
  )

  return { packingListData, establishments }
}

/**
 * Filter out empty/dragdown rows where all key fields are zero.
 * @param {Array} rows - Array of parsed row objects.
 * @returns {Array} Filtered rows without empty entries.
 */
function filterEmptyRows(rows) {
  return rows.filter(
    (row) =>
      !(
        row.description === 0 &&
        row.number_of_packages === 0 &&
        row.total_net_weight_kg === 0
      )
  )
}

/**
 * Parse the provided packing list JSON for SAVERS model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  const validation = validateAndExtractEstablishment(packingListJson)

  if (!validation.isValid) {
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }

  const { establishmentNumber, sheets } = validation

  try {
    let packingListContents = []
    let establishmentNumbers = []
    const headerTitles = Object.values(headers.SAVERS1.regex)

    for (const sheet of sheets) {
      if (!headers.SAVERS1.invalidSheets.includes(sheet)) {
        const result = processSheet(
          sheet,
          packingListJson[sheet],
          headerTitles,
          establishmentNumbers
        )

        establishmentNumbers = result.establishments
        packingListContents = packingListContents.concat(
          filterEmptyRows(result.packingListData)
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
    logger.error(formatError(err), 'Error in Savers 1 parser')
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
