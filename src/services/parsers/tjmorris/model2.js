/**
 * TJMORRIS Excel parser - Model 2
 * @module parsers/tjmorris/model2
 */
import { combine } from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import * as regex from '../../../utilities/regex.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { rowFinder } from '../../../utilities/row-finder.js'
import { matchesHeader } from '../../matches-header.js'
import matcherResult from '../../matcher-result.js'
import { mapParser } from '../../parser-map.js'

const currentFilename = fileURLToPath(import.meta.url)
const filename = path.join('src', currentFilename.split('src')[1])
const logger = createLogger()

/**
 * Parse the provided packing list JSON for TJMORRIS model 2.
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
      headers.TJMORRIS2.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    const headerTitles = Object.values(headers.TJMORRIS2.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === matcherResult.CORRECT
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
        headers.TJMORRIS2,
        sheet
      )
      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    return combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.TJMORRIS2,
      establishmentNumbers,
      headers.TJMORRIS2
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
      'TJ Morris Model 2 parser error'
    )
    return combine(null, [], false, parserModel.NOMATCH)
  }
}
