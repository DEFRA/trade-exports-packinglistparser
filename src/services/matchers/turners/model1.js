/**
 * Turners matcher
 *
 * Detects Turners packing list spreadsheet formats by validating
 * headers and establishment numbers.
 */
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import modelHeaders from '../../model-headers.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'

const logger = createLogger()

/**
 * Check whether the provided packing list matches Turners Model 1.
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @returns {string} - One of matcherResult codes
 */
export function matches(packingList, filename) {
  try {
    let result = matcherResult.WRONG_HEADER
    const sheets = Object.keys(packingList)

    if (sheets?.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      // check for correct establishment number
      if (
        !regex.test(
          modelHeaders.TURNERS1.establishmentNumber.regex,
          packingList[sheet]
        )
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // check for header values
      result = matchesHeader(
        Object.values(modelHeaders.TURNERS1.regex),
        packingList[sheet]
      )

      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(
        { filename },
        `Packing list matches Turners Model 1 with filename: ${filename}`
      )
    }

    return result
  } catch (err) {
    logger.error({ error: err, filename }, 'Error in Turners Model 1 matcher')
    return matcherResult.GENERIC_ERROR
  }
}
