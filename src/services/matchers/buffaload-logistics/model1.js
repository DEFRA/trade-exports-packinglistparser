/**
 * Buffaload Logistics Model 1 Matcher
 * @module matchers/buffaload-logistics/model1
 */
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const logger = createLogger()
const currentFilename = fileURLToPath(import.meta.url)
const filename = path.join('src', currentFilename.split('src')[1])

/**
 * Check whether the provided packing list matches Buffaload Logistics Model 1.
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} sourceFilename - Source filename for logging
 * @returns {number} - One of matcherResult codes
 */
function matches(packingList, sourceFilename) {
  try {
    let result
    const sheets = Object.keys(packingList)
    if (sheets?.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      // check for correct establishment number
      if (
        !regex.test(
          headers.BUFFALOAD1.establishmentNumber.regex,
          packingList[sheet]
        )
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // check for header values
      result = matchesHeader(
        Object.values(headers.BUFFALOAD1.regex),
        packingList[sheet]
      )
      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(
        {
          filename,
          function: 'matches()',
          sourceFilename
        },
        `Packing list matches buffaload-logistics Model 1 with filename: ${sourceFilename}`
      )
    }

    return result
  } catch (err) {
    logger.error(
      {
        filename,
        function: 'matches()',
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in Buffaload Logistics Model 1 matcher'
    )
    return matcherResult.GENERIC_ERROR
  }
}

export { matches }
