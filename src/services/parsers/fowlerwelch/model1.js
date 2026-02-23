/**
 * FOWLERWELCH Excel parser - Model 1
 * @module parsers/fowlerwelch/model1
 */
import combineParser from '../../parser-combine.js'
import ParserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import * as regex from '../../../utilities/regex.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import { mapParser } from '../../parser-map.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import * as validatorUtilities from '../../validators/packing-list-validator-utilities.js'

const logger = createLogger()

/**
 * Core parse routine used by FowlerWelch wrappers.
 * @param {Object} packingListJson - Workbook JSON object keyed by sheet.
 * @param {Object} model - Parser model constant to include in the result.
 * @param {RegExp} establishmentNumberRegex - Regex used to find est number.
 * @returns {Object} Combined parser result.
 */
export function parseModel(packingListJson, model, establishmentNumberRegex) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    const headerTitles = Object.values(headers.FOWLERWELCH1.regex)
    const callback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }
    const establishmentNumber = regex.findMatch(
      establishmentNumberRegex,
      packingListJson[sheets[0]]
    )

    const notDragDownCallback = function (item) {
      return !(
        validatorUtilities.hasMissingDescription(item) &&
        validatorUtilities.hasMissingIdentifier(item) &&
        validatorUtilities.hasMissingPackages(item) &&
        validatorUtilities.hasMissingNetWeight(item)
      )
    }

    for (const sheet of sheets) {
      establishmentNumbers = regex.findAllMatches(
        regex.remosRegex,
        packingListJson[sheet],
        establishmentNumbers
      )

      const headerRow = rowFinder(packingListJson[sheet], callback)
      const dataRow = headerRow + 1
      if (!headers.FOWLERWELCH1.invalidSheets.includes(sheet)) {
        packingListContentsTemp = mapParser(
          packingListJson[sheet],
          headerRow,
          dataRow,
          headers.FOWLERWELCH1,
          sheet
        )

        packingListContentsTemp =
          packingListContentsTemp.filter(notDragDownCallback)

        packingListContents = packingListContents.concat(
          packingListContentsTemp
        )
      }
    }
    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      model,
      establishmentNumbers,
      headers.FOWLERWELCH1
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in Fowlerwelch Model 1 parser')
    return combineParser.combine(null, [], false, ParserModel.NOMATCH)
  }
}

/**
 * Parse wrapper for FowlerWelch model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  return parseModel(
    packingListJson,
    ParserModel.FOWLERWELCH1,
    headers.FOWLERWELCH1.establishmentNumber.regex
  )
}
