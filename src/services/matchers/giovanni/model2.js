/**
 * Giovanni matcher (model 2)
 *
 * Detects Giovanni Model 2 Excel packing lists by analysing headers and
 * checking establishment number patterns.
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers.js'

const logger = createLogger()

/**
 * Giovanni matcher helper for model 2.
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @param {RegExp} regexExpression - Establishment number regex for the model
 * @returns {string} matcherResult - One of the matcher result codes
 */
export function matchesModel(packingList, filename, regexExpression) {
  try {
    let result
    const sheets = Object.keys(packingList)
    if (sheets?.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      // check for correct establishment number
      if (!regex.test(regexExpression, packingList[sheet])) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // check for header values
      result = matchesHeader(
        Object.values(headers.GIOVANNI2.regex),
        packingList[sheet]
      )
      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(
        `Packing list matches Giovanni Model 2 with filename: ${filename}`
      )
    }

    return result
  } catch (err) {
    logger.error(
      formatError(err),
      `Error in Giovanni Model 2 matcher for file: ${filename}`
    )
    return matcherResult.GENERIC_ERROR
  }
}

/**
 * Check whether the provided packing list matches Giovanni Model 2.
 * @param {Object} packingList - Excel JSON representation
 * @param {string} filename - Source filename for logging
 * @returns {string} - One of matcherResult codes
 */
export function matches(packingList, filename) {
  return matchesModel(
    packingList,
    filename,
    headers.GIOVANNI2.establishmentNumber.regex
  )
}
