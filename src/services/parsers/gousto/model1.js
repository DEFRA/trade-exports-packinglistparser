/**
 * Gousto Excel parser - Model 1
 * @module parsers/gousto/model1
 */
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { combine } from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import {
  findMatch,
  findAllMatches,
  remosRegex
} from '../../../utilities/regex.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'

const logger = createLogger()
const currentFilename = fileURLToPath(import.meta.url)
const filename = path.join('src', currentFilename.split('src')[1])

/**
 * Parse the provided packing list JSON for Gousto model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    const establishmentNumber = findMatch(
      headers.GOUSTO1.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    const headerTitles = Object.values(headers.GOUSTO1.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    for (const sheet of sheets) {
      establishmentNumbers = findAllMatches(
        remosRegex,
        packingListJson[sheet],
        establishmentNumbers
      )

      const headerRow = rowFinder(packingListJson[sheet], headerCallback)
      const dataRow = headerRow + 1

      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.GOUSTO1,
        sheet
      )
      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    return combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.GOUSTO1,
      establishmentNumbers,
      headers.GOUSTO1
    )
  } catch (err) {
    logger.error(
      {
        ...formatError(err),
        filename,
        function: 'parse'
      },
      'Error parsing Gousto Model 1'
    )
    return combine(null, [], false, parserModel.NOMATCH)
  }
}

export { parse }
