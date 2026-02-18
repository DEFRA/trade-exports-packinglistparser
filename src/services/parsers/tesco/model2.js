/**
 * TESCO Excel parser - Model 2
 * @module parsers/tesco/model2
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

function isNotEmptyRow(row) {
  const ignoreColumns = new Set(['total_net_weight_unit', 'row_location'])
  return Object.keys(row)
    .filter((k) => !ignoreColumns.has(k))
    .some((k) => row[k])
}

/**
 * Parse the provided packing list JSON for Tesco model 2.
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
      headers.TESCO2.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    const headerTitles = Object.values(headers.TESCO2.regex)
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

      const dataRow = headerRow + 2
      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.TESCO2,
        sheet
      )

      // find net weight column
      const key = packingListJson[sheet].reduce((foundKey, obj) => {
        if (foundKey) {
          return foundKey
        }
        return Object.keys(obj).find((x) =>
          headers.TESCO2.regex.total_net_weight_kg.test(obj[x])
        )
      }, null)

      // update value with unit
      const unit = regex.findUnit(
        packingListJson[sheet][headerRow + 1][key]?.toString()
      )
      const packingListContentsTempUnit = packingListContentsTemp
        .filter(isNotEmptyRow)
        .map((item) => ({
          ...item,
          total_net_weight_unit: unit
        }))

      packingListContents = packingListContents.concat(
        packingListContentsTempUnit
      )
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.TESCO2,
      establishmentNumbers,
      headers.TESCO2
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in Tesco 2 parser')
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
