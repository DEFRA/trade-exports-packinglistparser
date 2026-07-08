/**
 * Manfreight Model 1 matcher
 *
 * Detects whether a provided Excel-converted packing list matches
 * the Manfreight Model 1 format by checking the establishment number and
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
 * Check whether the provided packing list matches Manfreight Model 1.
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @returns {number} - One of matcherResult codes
 */
export function matches(packingList, filename) {
  try {
    // Initialise to EMPTY_FILE — a workbook containing only invalid sheets is
    // treated the same as an empty file.
    let result = matcherResult.EMPTY_FILE
    const sheets = Object.keys(packingList)

    if (!sheets?.length) {
      return matcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      // Skip sheets that are excluded for this model
      if (headers.MANFREIGHT1.invalidSheets.includes(sheet)) {
        continue
      }

      // Check for correct establishment number
      if (
        !regex.test(
          headers.MANFREIGHT1.establishmentNumber.regex,
          packingList[sheet]
        )
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // Check for header values
      result = matchesHeader(
        Object.values(headers.MANFREIGHT1.regex),
        packingList[sheet]
      )

      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(`${filename} Packing list matches Manfreight Model 1`)
    }

    return result
  } catch (err) {
    logger.error(formatError(err), 'Error in matches() for Manfreight Model 1')
    return matcherResult.GENERIC_ERROR
  }
}
