/**
 * Gousto Model 1 matcher
 *
 * Detects whether a provided Excel-converted packing list matches
 * the Gousto Model 1 format by checking the establishment number and
 * header row patterns.
 */
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import { test } from '../../../utilities/regex.js'
import headers from '../../model-headers.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'

const logger = createLogger()
const currentFilename = fileURLToPath(import.meta.url)
const filename = path.join('src', currentFilename.split('src')[1])

/**
 * Check whether the provided packing list matches Gousto Model 1.
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @returns {string} - One of matcherResult codes
 */
function matches(packingList, packingListFilename) {
  try {
    let result
    const sheets = Object.keys(packingList)
    if (sheets?.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      // check for correct establishment number
      if (
        !test(headers.GOUSTO1.establishmentNumber.regex, packingList[sheet])
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }
      // check for header values
      result = matchesHeader(
        Object.values(headers.GOUSTO1.regex),
        packingList[sheet]
      )
      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(
        `Packing list matches Gousto Model 1 with filename: ${packingListFilename} (filename: ${filename}, function: matches)`
      )
    }

    return result
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack,
          type: err.name
        },
        filename,
        function: 'matches'
      },
      'Error in Gousto Model 1 matcher'
    )

    return matcherResult.GENERIC_ERROR
  }
}

export { matches }
