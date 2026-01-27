/**
 * ASDA Model 4 matcher (CSV)
 *
 * Detects whether a provided CSV-converted packing list matches the
 * ASDA CSV Model 4 format by checking the establishment number and
 * header row patterns.
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import csvHeaders from '../../model-headers-csv.js'

const logger = createLogger()

/**
 * Check whether the provided packing list matches ASDA Model 4 (CSV).
 * @param {Array<Array>} packingList - CSV data as array of row arrays
 * @param {string} filename - Source filename for logging
 * @returns {number} - One of matcherResult codes
 */
export function matches(packingList, filename) {
  try {
    // Check for empty file
    if (!packingList || packingList.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    // Check for correct establishment number
    if (!regex.test(csvHeaders.ASDA4.establishmentNumber.regex, packingList)) {
      return matcherResult.WRONG_ESTABLISHMENT_NUMBER
    }

    // Check header values - CSV uses packingList directly
    const result = matchesHeader(
      Object.values(csvHeaders.ASDA4.regex),
      packingList
    )

    if (result === matcherResult.WRONG_HEADER) {
      return result
    }

    if (result === matcherResult.CORRECT) {
      logger.info(
        `Packing list matches Asda Model 4 CSV with filename: ${filename}`
      )
    }

    return result
  } catch (err) {
    logger.error(`Error in ASDA Model 4 matcher: ${err.message}`, {
      stack: err.stack
    })
    return matcherResult.GENERIC_ERROR
  }
}
