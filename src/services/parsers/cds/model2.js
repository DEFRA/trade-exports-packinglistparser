/**
 * CDS Excel parser - Model 2
 * @module parsers/cds/model2
 */
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import parserModel from '../../parser-model.js'
import { combine } from '../../parser-combine.js'
import modelHeaders from '../../model-headers.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import { findMatch, findAllMatches } from '../../../utilities/regex.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'

const logger = createLogger()
const currentFilename = fileURLToPath(import.meta.url)
const filename = path.join('src', currentFilename.split('src')[1])

/**
 * Parse the provided packing list JSON for CDS model 2.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let tempPackingListContents = []
    let establishmentNumbers = []

    const establishmentNumber = findMatch(
      modelHeaders.CDS2.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    const headerTitles = Object.values(modelHeaders.CDS2.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    for (const sheet of sheets) {
      establishmentNumbers = findAllMatches(
        /(RMS-GB-\d{6}-\d{3})/i,
        packingListJson[sheet],
        establishmentNumbers
      )

      const headerRow = rowFinder(packingListJson[sheet], headerCallback)
      const dataRow = headerRow + 1
      tempPackingListContents = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        modelHeaders.CDS2,
        sheet
      )
      packingListContents = packingListContents.concat(tempPackingListContents)
    }

    return combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.CDS2,
      establishmentNumbers,
      modelHeaders.CDS2
    )
  } catch (err) {
    logger.error(
      {
        ...formatError(err),
        filename,
        function: 'parse'
      },
      'Error parsing CDS model 2'
    )
    return combine(null, [], false, parserModel.NOMATCH)
  }
}

export { parse }
