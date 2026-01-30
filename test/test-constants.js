/**
 * Test Constants
 *
 * Shared constants used across parser service integration tests.
 */

import parserModel from '../src/services/parser-model.js'

/**
 * Invalid filename used for testing parser matching with wrong file extensions.
 * This filename is intentionally invalid and should not match any parser model.
 */
export const INVALID_FILENAME = 'packinglist.wrong'

/**
 * Text fragment used in validation error messages when multiple errors are summarized.
 * When more than 3 errors occur, the system shows the first 3 and indicates additional errors
 * with this text (e.g., "in addition to 2 other locations").
 */
export const ERROR_SUMMARY_TEXT = 'in addition to'

/**
 * Expected result structure when no parser matches the file.
 * Used in integration tests to verify parser discovery fails appropriately.
 */
export const NO_MATCH_RESULT = {
  business_checks: {
    all_required_fields_present: false,
    failure_reasons: null
  },
  items: [],
  registration_approval_number: null,
  parserModel: parserModel.NOMATCH
}

export const NO_REMOS_RESULT = {
  business_checks: {
    all_required_fields_present: false,
    failure_reasons: 'Check GB Establishment RMS Number.'
  },
  items: [],
  registration_approval_number: null,
  parserModel: parserModel.NOREMOS
}
