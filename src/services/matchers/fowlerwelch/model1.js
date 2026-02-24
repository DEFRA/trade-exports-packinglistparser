/**
 * Fowler-Welch matcher (model 1)
 *
 * Detects the Fowler-Welch Excel format by verifying establishment
 * numbers and header rows.
 */
import MatcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import { matchesHeader } from '../../matches-header.js'

const logger = createLogger()

/**
 * Check whether the provided packing list matches Fowler-Welch Model 1.
 * This function accepts a regexExpression to support reuse between models.
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @param {RegExp} regexExpression - Establishment number regex for the model
 * @returns {string} - One of matcherResult codes
 */
function matchesModel(packingList, filename, regexExpression) {
  try {
    let result = MatcherResult.EMPTY_FILE // Initialise to EMPTY_FILE as spreadsheet with only invalid sheets is equivalent to an empty file.
    const sheets = Object.keys(packingList)
    if (!sheets?.length) {
      return MatcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      // Skip invalid sheets
      if (headers.FOWLERWELCH1.invalidSheets.includes(sheet)) {
        continue
      }

      // Check for correct establishment number
      if (!regex.test(regexExpression, packingList[sheet])) {
        return MatcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // Check for header values
      result = matchesHeader(
        Object.values(headers.FOWLERWELCH1.regex),
        packingList[sheet]
      )
      if (result === MatcherResult.WRONG_HEADER) {
        return result
      }
    }

    logger.info(
      `Packing list matches fowlerwelch Model 1 with filename: ${filename}`
    )

    return result // Return the last checked result if no issues were found
  } catch (err) {
    logger.error(formatError(err), 'Error in Fowlerwelch Model 1 matcher')
    return MatcherResult.GENERIC_ERROR
  }
}

/**
 * Wrapper for matchesModel using the Fowler-Welch Model 1 establishment regex.
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @returns {string} - One of matcherResult codes
 */
function matches(packingList, filename) {
  return matchesModel(
    packingList,
    filename,
    headers.FOWLERWELCH1.establishmentNumber.regex
  )
}

export { matches, matchesModel }
