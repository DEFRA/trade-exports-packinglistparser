/**
 * CDS matcher (model 2)
 */
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import { test } from '../../../utilities/regex.js'
import modelHeaders from '../../model-headers.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'

const logger = createLogger()
const currentFilename = fileURLToPath(import.meta.url)
const filename = path.join('src', currentFilename.split('src')[1])

/**
 * CDS matcher (model 2)
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} packingListFilename - Source filename for logging
 * @returns {string} matcherResult - One of the matcher result codes
 */
function matches(packingList, packingListFilename) {
  try {
    let result
    const sheets = Object.keys(packingList)
    if (sheets?.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      // check for correct establishment number
      if (
        !test(modelHeaders.CDS2.establishmentNumber.regex, packingList[sheet])
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }
      // check for header values
      result = matchesHeader(
        Object.values(modelHeaders.CDS2.regex),
        packingList[sheet]
      )
      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(
        `Packing list matches CDS Model 2 (filename: ${packingListFilename}, function: matches, file: ${filename})`
      )
    }

    return result
  } catch (err) {
    logger.error(
      {
        ...formatError(err),
        filename,
        function: 'matches'
      },
      'Error matching CDS model 2'
    )
    return matcherResult.GENERIC_ERROR
  }
}

export { matches }
