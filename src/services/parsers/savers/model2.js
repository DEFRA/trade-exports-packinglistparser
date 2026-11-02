/**
 * SAVERS CSV parser - Model 2
 * @module parsers/savers/model2
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import csvHeaders from '../../model-headers-csv.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'

const logger = createLogger()

const MEANINGFUL_FIELDS = [
  'description',
  'nature_of_products',
  'type_of_treatment',
  'country_of_origin',
  'nirms',
  'number_of_packages',
  'total_net_weight_kg'
]

const NOT_APPLICABLE_PATTERN = /^#?n\/?a$/i

function isMeaninglessValue(value) {
  if (value === null || value === undefined) {
    return true
  }

  const text = String(value).trim()
  if (text === '' || NOT_APPLICABLE_PATTERN.test(text)) {
    return true
  }

  const numeric = Number.parseFloat(text)
  return !Number.isNaN(numeric) && numeric === 0
}

function hasNoMeaningfulData(row) {
  return MEANINGFUL_FIELDS.every((field) => isMeaninglessValue(row[field]))
}

/**
 * Parse the provided CSV packing list for SAVERS model 2.
 * @param {Array<Array>} packingListCsv - CSV data as array of row arrays
 * @returns {Object} Combined parser result.
 */
export function parse(packingListCsv) {
  try {
    if (!packingListCsv || packingListCsv.length === 0) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    let packingListContents = []
    let establishmentNumbers = []

    const establishmentNumber = regex.findMatch(
      csvHeaders.SAVERS2.establishmentNumber.regex,
      packingListCsv
    )

    if (!establishmentNumber) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    establishmentNumbers = regex.findAllMatches(
      regex.remosRegex,
      packingListCsv,
      establishmentNumbers
    )

    const headerTitles = Object.values(csvHeaders.SAVERS2.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    const headerRow = rowFinder(packingListCsv, headerCallback)
    const dataRow = headerRow + 1

    packingListContents = mapParser(
      packingListCsv,
      headerRow,
      dataRow,
      csvHeaders.SAVERS2,
      null
    )

    // Drop filler rows (blank/N/A/zero) so they are excluded from validation.
    // Filtering the mapped items preserves each survivor's original row number.
    packingListContents = packingListContents.filter(
      (row) => !hasNoMeaningfulData(row)
    )

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.SAVERS2,
      establishmentNumbers,
      csvHeaders.SAVERS2
    )
  } catch (err) {
    logger.error(formatError(err), 'Error parsing SAVERS Model 2')
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
