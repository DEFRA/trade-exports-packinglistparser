/**
 * Header matching utility
 *
 * Checks if any row in a packing list sheet matches all provided regex patterns.
 */
import { createLogger } from '../common/helpers/logging/logger.js'
import { formatError } from '../common/helpers/logging/error-logger.js'
import matcherResult from './matcher-result.js'
import * as regex from '../utilities/regex.js'

const logger = createLogger()

/**
 * Check if any row in packing list sheet matches all provided regex patterns.
 * @param {Array<RegExp>} regexHeaders - Array of regex patterns to match
 * @param {Array<Object>} packingListSheet - Packing list sheet rows
 * @returns {number} MatcherResult code (CORRECT, WRONG_HEADER, or GENERIC_ERROR)
 */
export function matchesHeader(regexHeaders, packingListSheet) {
  try {
    for (const row of packingListSheet) {
      if (regex.testAllPatterns(regexHeaders, row)) {
        return matcherResult.CORRECT
      }
    }
    return matcherResult.WRONG_HEADER
  } catch (err) {
    logger.error(formatError(err), 'Error in matchesHeader()')
    return matcherResult.GENERIC_ERROR
  }
}
