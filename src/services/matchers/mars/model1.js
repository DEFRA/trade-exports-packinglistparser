/**
 * Mars matcher
 *
 * Matches Mars packing list layout using header and establishment
 * patterns.
 */
import MatcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'

const logger = createLogger()

/**
 * Check whether the provided packing list matches Mars Model 1.
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @returns {number} - One of matcherResult codes
 */
export function matches(packingList, filename) {
  try {
    let result
    const sheets = Object.keys(packingList)
    if (sheets?.length === 0) {
      return MatcherResult.EMPTY_FILE
    }
    for (const sheet of sheets) {
      // check for correct establishment number
      if (
        !regex.test(headers.MARS1.establishmentNumber.regex, packingList[sheet])
      ) {
        return MatcherResult.WRONG_ESTABLISHMENT_NUMBER
      }
      // check for header values
      result = matchesHeader(
        Object.values(headers.MARS1.regex),
        packingList[sheet]
      )
      if (result === MatcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === MatcherResult.CORRECT) {
      logger.info(`${filename} Packing list matches Mars Model 1`)
    }

    return result
  } catch (err) {
    logger.error(formatError(err), 'Error in matches() for Mars Model 1')
    return MatcherResult.GENERIC_ERROR
  }
}
