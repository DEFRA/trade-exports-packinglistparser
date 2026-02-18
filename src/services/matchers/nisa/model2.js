/**
 * Nisa Model 2 matcher
 *
 * Detects whether a provided Excel-converted packing list matches
 * the Nisa Model 2 format by checking the establishment number and
 * header row patterns.
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers.js'

const logger = createLogger()

/**
 * Check whether the provided packing list matches Nisa Model 2.
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @returns {string} - One of matcherResult codes
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
        !regex.test(headers.NISA2.establishmentNumber.regex, packingList[sheet])
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // check for header values
      result = matchesHeader(
        Object.values(headers.NISA2.regex),
        packingList[sheet]
      )

      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(
        `Packing list matches nisa Model 2 with filename: ${filename}`
      )
    }

    return result
  } catch (err) {
    logger.error(formatError(err), 'Error in Nisa 2 matcher')
    return matcherResult.GENERIC_ERROR
  }
}
