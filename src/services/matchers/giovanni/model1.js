/**
 * Giovanni matcher (model 1)
 *
 * Detects Giovanni-style Excel packing lists by analysing headers and
 * checking establishment number patterns.
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers.js'

const logger = createLogger()

/**
 * Giovanni matcher helper for model 1.
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
        Object.values(headers.GIOVANNI1.regex),
        packingList[sheet]
      )

      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(
        { filename },
        `Packing list matches giovanni Model 1 with filename: ${filename}`
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
      'Error in Giovanni 1 matcher'
    )
    return matcherResult.GENERIC_ERROR
  }
}

/**
 * Check whether the provided packing list matches Giovanni Model 1.
 * @param {Object} packingList - PDF buffer or JSON representation
 * @param {string} filename - Source filename for logging
 * @returns {string} - One of matcherResult codes
 */
export function matches(packingList, filename) {
  return matchesModel(
    packingList,
    filename,
    headers.GIOVANNI1.establishmentNumber.regex
  )
}
