/**
 * Parser combine utility
 *
 * Combines parsed data into standardized result structure compatible with
 * legacy trade-exportscore-plp format.
 */

/**
 * Combine parsed data into standardized result structure.
 * @param {string} establishmentNumber - Primary establishment number
 * @param {Array} packingListContents - Parsed item rows
 * @param {boolean} allRequiredFieldsPresent - Validation flag
 * @param {string} ParserModel - Parser model identifier
 * @param {Array<string>} establishmentNumbers - All establishment numbers found
 * @param {Object|null} header - Header metadata for special flags
 * @returns {Object} Combined parser result
 */
export function combine(
  establishmentNumber,
  packingListContents,
  allRequiredFieldsPresent,
  ParserModel,
  establishmentNumbers = [],
  header = null
) {
  return {
    registration_approval_number: establishmentNumber,
    items: packingListContents,
    business_checks: {
      all_required_fields_present: allRequiredFieldsPresent,
      failure_reasons: null
    },
    parserModel: ParserModel,
    establishment_numbers: establishmentNumbers,
    unitInHeader: header?.findUnitInHeader ?? false,
    validateCountryOfOrigin: header?.validateCountryOfOrigin ?? false,
    blanketNirms: header?.blanketNirms ?? false
  }
}

export default {
  combine
}
