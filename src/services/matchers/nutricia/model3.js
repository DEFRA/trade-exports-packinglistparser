/**
 * Nutricia matcher - Model 3
 *
 * Detects whether a provided Excel-converted packing list matches
 * the Nutricia Model 3 format by checking establishment number and
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
 * Check whether the provided packing list matches Nutricia Model 3.
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @returns {number} One of matcherResult codes
 */
export function matches(packingList, filename) {
  try {
    let result
    const sheets = Object.keys(packingList)

    if (sheets?.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      if (
        !regex.test(
          headers.NUTRICIA3.establishmentNumber.regex,
          packingList[sheet]
        )
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      result = matchesHeader(
        Object.values(headers.NUTRICIA3.regex),
        packingList[sheet]
      )

      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(`${filename} Packing list matches Nutricia Model 3`)
    }

    return result
  } catch (err) {
    logger.error(formatError(err), 'Error in matches() for Nutricia Model 3')
    return matcherResult.GENERIC_ERROR
  }
}
