/**
 * Savers Model 1 matcher
 *
 * Detects whether a provided Excel-converted packing list matches
 * the Savers Model 1 format by checking the establishment number and
 * header row patterns.
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers.js'

const logger = createLogger()

/**
 * Check whether the provided packing list matches Savers Model 1.
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @returns {number} - One of matcherResult codes
 */
export function matches(packingList, filename) {
  try {
    let result = matcherResult.EMPTY_FILE // Initialise to EMPTY_FILE as spreadsheet with only invalid sheets is equivalent to an empty file.
    const sheets = Object.keys(packingList)

    if (sheets?.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      // Skip invalid sheets
      if (headers.SAVERS1.invalidSheets.includes(sheet)) {
        continue
      }

      // Check for correct establishment number
      if (
        !regex.test(
          headers.SAVERS1.establishmentNumber.regex,
          packingList[sheet]
        )
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // Check for header values
      result = matchesHeader(
        Object.values(headers.SAVERS1.regex),
        packingList[sheet]
      )

      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(
        { filename },
        `Packing list matches Savers Model 1 with filename: ${filename}`
      )
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
      'Error in Savers 1 matcher'
    )
    return matcherResult.GENERIC_ERROR
  }
}
