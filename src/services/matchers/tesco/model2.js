/**
 * Tesco matcher (model 2)
 *
 * Alternate Tesco matcher for a different spreadsheet variant.
 */
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'

const logger = createLogger()

/**
 * Tesco matcher (model 2)
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @returns {string} matcherResult - One of the matcher result codes
 */
export function matches(packingList, filename) {
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
          headers.TESCO2.establishmentNumber.regex,
          packingList[sheet]
        )
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // check for header values
      result = matchesHeader(
        Object.values(headers.TESCO2.regex),
        packingList[sheet]
      )
      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(
        `Packing list matches Tesco Model 2 with filename: ${filename}`
      )
    }

    return result
  } catch (err) {
    logger.error(formatError(err), 'Error in Tesco Model 2 matcher')
    return matcherResult.GENERIC_ERROR
  }
}
