import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'

/**
 * No-match parsers
 *
 * Provides trivial parsers used when REMOS cannot be found or when a file
 * is unrecognised. These return the appropriate `parser-model` results.
 * @module parsers/no-match/model1
 */

/**
 * Return a NOREMOS combined result.
 * @param {*} _packingList - Unused parameter kept for signature parity.
 * @param {string} _filename - Unused filename parameter.
 * @returns {Object} Combined parser result indicating NOREMOS.
 */
function noRemosParse(_packingList, _filename) {
  return combineParser.combine(null, [], false, parserModel.NOREMOS)
}

/**
 * Return a NOMATCH combined result for unrecognised files.
 * @param {*} _packingList - Unused parameter kept for signature parity.
 * @param {string} _filename - Unused filename parameter.
 * @returns {Object} Combined parser result indicating NOMATCH.
 */
function unrecognisedParse(_packingList, _filename) {
  return combineParser.combine(null, [], false, parserModel.NOMATCH)
}

export { noRemosParse, unrecognisedParse }
