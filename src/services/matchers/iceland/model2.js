/**
 * Iceland Model 2 CSV matcher
 *
 * Detects whether a provided CSV-converted packing list matches
 * the Iceland Model 2 format by checking the establishment number and
 * header row patterns.
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers-csv.js'

const logger = createLogger()

/**
 * Check whether the provided CSV packing list matches Iceland Model 2.
 * @param {Array<Array>} packingList - CSV data as array of row arrays
 * @param {string} filename - Source filename for logging
 * @returns {string} - One of matcherResult codes
 */
export function matches(packingList, filename) {
  try {
    // Check for empty file
    if (!packingList || packingList.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    // Check for correct establishment number
    if (!regex.test(headers.ICELAND2.establishmentNumber.regex, packingList)) {
      return matcherResult.WRONG_ESTABLISHMENT_NUMBER
    }

    // Check header values
    const result = matchesHeader(
      Object.values(headers.ICELAND2.regex),
      packingList
    )

    if (result === matcherResult.WRONG_HEADER) {
      return result
    }

    if (result === matcherResult.CORRECT) {
      logger.info(`${filename} Packing list matches Iceland Model 2 CSV`)
    }

    return result
  } catch (err) {
    logger.error(`Error in matches() for file ${filename}`, { err })
    return matcherResult.GENERIC_ERROR
  }
}
