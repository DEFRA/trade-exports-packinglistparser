/**
 * TJ Morris matcher (model 2)
 *
 * Alternate TJ Morris matcher handling a different sheet layout.
 */
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'

const logger = createLogger()

/**
 * TJ Morris matcher (model 2)
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @returns {string} matcherResult - One of the matcher result codes
 */
export function matches(packingList, filename) {
  try {
    let result
    const sheets = Object.keys(packingList)
    if (sheets?.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      // check for correct establishment number
      if (
        !regex.test(
          headers.TJMORRIS2.establishmentNumber.regex,
          packingList[sheet]
        )
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // check for header values
      result = matchesHeader(
        Object.values(headers.TJMORRIS2.regex),
        packingList[sheet]
      )
      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(`${filename} Packing list matches Tjmorris Model 2`)
    }
    return result
  } catch (err) {
    logger.error(`Error in matches() for file ${filename}`, { err })
    return matcherResult.GENERIC_ERROR
  }
}
