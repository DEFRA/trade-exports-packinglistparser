/**
 * BUFFALOAD-LOGISTICS Excel parser - Model 1
 * @module parsers/buffaload-logistics/model1
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const logger = createLogger()
const currentFilename = fileURLToPath(import.meta.url)
const filename = path.join('src', currentFilename.split('src')[1])

/**
 * Parse the provided packing list JSON for BUFFALOAD-LOGISTICS model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    const establishmentNumber = regex.findMatch(
      headers.BUFFALOAD1.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    const headerTitles = Object.values(headers.BUFFALOAD1.regex)
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
      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.BUFFALOAD1,
        sheet
      )

      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.BUFFALOAD1,
      establishmentNumbers,
      headers.BUFFALOAD1
    )
  } catch (err) {
    logger.error(
      {
        filename,
        function: 'parse()',
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error parsing Buffaload Logistics Model 1'
    )
    return combineParser.combine(null, [], false, parserModel.NOMATCH)
  }
}

export { parse }
