/**
 * Savers Model 2 matcher (CSV)
 *
 * Detects whether a provided CSV-converted packing list matches the
 * Savers CSV Model 2 format by checking the establishment number and
 * header row patterns.
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import csvHeaders from '../../model-headers-csv.js'

const logger = createLogger()

/**
 * Check whether the provided packing list matches Savers Model 2 (CSV).
 * @param {Array<Array>} packingList - CSV data as array of row arrays
 * @param {string} filename - Source filename for logging
 * @returns {number} - One of matcherResult codes
 */
export function matches(packingList, filename) {
  try {
    if (!packingList || packingList.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    if (
      !regex.test(csvHeaders.SAVERS2.establishmentNumber.regex, packingList)
    ) {
      return matcherResult.WRONG_ESTABLISHMENT_NUMBER
    }

    const result = matchesHeader(
      Object.values(csvHeaders.SAVERS2.regex),
      packingList
    )

    if (result === matcherResult.CORRECT) {
      logger.info(
        { filename },
        `Packing list matches Savers Model 2 CSV with filename: ${filename}`
      )
    }

    return result
  } catch (err) {
    logger.error(formatError(err), 'Error in Savers Model 2 matcher')
    return matcherResult.GENERIC_ERROR
  }
}
