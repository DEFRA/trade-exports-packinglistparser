/**
 * Warrens matcher (model 2)
 *
 * Alternate Warrens matcher variant which validates header rows.
 */
import MatcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { matchesHeader } from '../../matches-header.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'

const logger = createLogger()

/**
 * Warrens matcher helper for model 2.
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @param {RegExp} regexExpression - Establishment number regex for the model
 * @returns {string} matcherResult - One of the matcher result codes
 */
export function matchesModel(packingList, filename, regexExpression) {
  try {
    let result = MatcherResult.EMPTY_FILE // Initialise to EMPTY_FILE as spreadsheet with only invalid sheets is equivalent to an empty file.
    const sheets = Object.keys(packingList)
    if (!sheets?.length) {
      return MatcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      // Skip invalid sheets - may not be needed here?
      if (headers.WARRENS2.invalidSheets.includes(sheet)) {
        continue
      }

      // Check for correct establishment number
      if (!regex.test(regexExpression, packingList[sheet])) {
        return MatcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // Check for header values
      result = matchesHeader(
        Object.values(headers.WARRENS2.regex),
        packingList[sheet]
      )
      if (result === MatcherResult.WRONG_HEADER) {
        return result
      }
    }

    logger.info(`${filename} Packing list matches Warrens Model 2`)

    return result // Return the last checked result if no issues were found
  } catch (err) {
    logger.error(
      formatError(err),
      'Error in matchesModel() for Warrens Model 2'
    )
    return MatcherResult.GENERIC_ERROR
  }
}

/**
 * Check whether the provided packing list matches Warrens Model 2.
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @returns {string} - One of matcherResult codes
 */
export function matches(packingList, filename) {
  return matchesModel(
    packingList,
    filename,
    headers.WARRENS2.establishmentNumber.regex
  )
}
