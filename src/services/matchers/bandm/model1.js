/**
 * B&M matcher
 *
 * Detects whether a provided packing list matches the
 * B&M format by verifying establishment number and header patterns.
 */
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'

const logger = createLogger()

/**
 * Check whether the provided packing list matches B&M Model 1.
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @returns {number} - One of matcherResult codes
 */
export function matches(packingList, filename) {
  try {
    let result = matcherResult.EMPTY_FILE
    const sheets = Object.keys(packingList)
    if (sheets?.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      const hasEstablishmentNumber = regex.test(
        headers.BANDM1.establishmentNumber.regex,
        packingList[sheet]
      )

      // If no establishment number found, skip empty sheets or return error
      if (!hasEstablishmentNumber && result === matcherResult.EMPTY_FILE) {
        continue
      }
      if (!hasEstablishmentNumber) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // check for header values
      result = matchesHeader(
        Object.values(headers.BANDM1.regex),
        packingList[sheet]
      )
      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(`${filename} Packing list matches B&M Model 1`)
    }

    return result
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in B&M Model 1 matcher'
    )
    return matcherResult.GENERIC_ERROR
  }
}
