/**
 * Approval status utility
 *
 * Provides shared logic for determining approval status based on
 * parsing results and validation failure reasons. Used by both
 * data storage and message creation to ensure consistency.
 */

import failureReasonConstants from '../services/validators/packing-list-failure-reasons.js'

/**
 * Determine approval status based on parsing result and failure reasons.
 * @param {boolean} allRequiredFieldsPresent - True when all business checks pass
 * @param {string|null} failureReasons - Failure reason text when validation failed
 * @returns {string} Approval status: "approved", "rejected_ineligible", "rejected_coo", or "rejected_other"
 */
export function determineApprovalStatus(
  allRequiredFieldsPresent,
  failureReasons
) {
  if (allRequiredFieldsPresent) {
    return 'approved'
  }

  if (failureReasons && typeof failureReasons === 'string') {
    // Check if failure is specifically due to ineligible/prohibited items
    if (failureReasons.includes(failureReasonConstants.PROHIBITED_ITEM)) {
      return 'rejected_ineligible'
    }

    // Check if failure is specifically due to Country of Origin issues
    if (
      failureReasons.includes(failureReasonConstants.COO_MISSING) ||
      failureReasons.includes(failureReasonConstants.COO_INVALID)
    ) {
      return 'rejected_coo'
    }
  }

  return 'rejected_other'
}
