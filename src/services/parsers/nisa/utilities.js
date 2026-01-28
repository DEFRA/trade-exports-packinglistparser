/**
 * NISA utility helpers
 * @module parsers/nisa/utilities
 */
import * as validatorUtilities from '../../validators/packing-list-validator-utilities.js'

/**
 * Return true when the item appears to be a totals row.
 * @param {Object} item - Row item to test.
 * @returns {boolean}
 */
export function isTotalRow(item) {
  return (
    validatorUtilities.hasMissingDescription(item) &&
    validatorUtilities.hasMissingIdentifier(item) &&
    !validatorUtilities.hasMissingNetWeight(item) &&
    !validatorUtilities.hasMissingPackages(item)
  )
}
