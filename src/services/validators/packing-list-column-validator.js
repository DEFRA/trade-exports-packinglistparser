/**
 * Packing list column-level validators and failure reason generation.
 *
 * Provides composition of per-item validators and helpers that turn those
 * validation results into user-facing failure reason strings.
 */

import {
  hasMissingDescription,
  hasMissingIdentifier,
  hasMissingNetWeight,
  hasMissingPackages,
  wrongTypeForPackages,
  wrongTypeNetWeight,
  hasInvalidProductCode,
  hasMissingNetWeightUnit,
  hasMissingNirms,
  hasInvalidNirms,
  hasMissingCoO,
  hasInvalidCoO,
  hasIneligibleItems
} from './packing-list-validator-utilities.js'

/**
 * Validate a full packing list and produce final failure output.
 *
 * @param {Object} packingList - The parsed packing list object
 * @returns {Object} result - { hasAllFields: boolean, failureReasons?: string }
 */
function validatePackingList(packingList) {
  const validationResult = validatePackingListByIndexAndType(packingList)
  return generateFailuresByIndexAndTypes(validationResult, packingList)
}

/**
 * Run the set of validation checks and return a structured map of failing row locations.
 *
 * @param {Object} packingList - The parsed packing list object
 * @returns {Object} validationSummary - Collections of failing locations grouped by failure type
 */
function validatePackingListByIndexAndType(packingList) {
  const basicValidationResults = getBasicValidationResults(packingList)
  const packingListStatusResults = getPackingListStatusResults(packingList)
  const countryOfOriginResults =
    getCountryOfOriginValidationResults(packingList)

  return {
    ...basicValidationResults,
    ...packingListStatusResults,
    ...countryOfOriginResults,
    hasAllFields: calculateHasAllFields(
      basicValidationResults,
      packingListStatusResults,
      countryOfOriginResults
    )
  }
}

/**
 * Run basic column-level validators against each item row.
 *
 * @param {Object} packingList - The parsed packing list object
 * @returns {Object} basicResults - Arrays of row_location values for each failure category
 */
function getBasicValidationResults(packingList) {
  return {
    missingIdentifier: findItems(packingList.items, hasMissingIdentifier),
    invalidProductCodes: findItems(packingList.items, hasInvalidProductCode),
    missingDescription: findItems(packingList.items, hasMissingDescription),
    missingPackages: findItems(packingList.items, hasMissingPackages),
    invalidPackages: findItems(packingList.items, wrongTypeForPackages),
    missingNetWeight: findItems(packingList.items, hasMissingNetWeight),
    invalidNetWeight: findItems(packingList.items, wrongTypeNetWeight),
    missingNetWeightUnit: findItems(packingList.items, hasMissingNetWeightUnit)
  }
}

/**
 * Determine high-level status flags for the packing list.
 *
 * @param {Object} packingList - The parsed packing list object
 * @returns {Object} statusResults - Boolean flags describing packing list status
 */
function getPackingListStatusResults(packingList) {
  const hasRemos = packingList.registration_approval_number !== null
  const isEmpty = packingList.items.length === 0
  const missingRemos =
    packingList.registration_approval_number === null ||
    packingList.parserModel === 'NOREMOS'
  const noMatch = packingList.parserModel === 'NOMATCH'
  const hasSingleRms = packingList.establishment_numbers?.length <= 1

  return {
    hasRemos,
    isEmpty,
    missingRemos,
    noMatch,
    hasSingleRms
  }
}

/**
 * Run country-of-origin related validators when enabled.
 *
 * @param {Object} packingList - The parsed packing list object
 * @returns {Object} cooResults - Arrays of row_location values for CoO failures
 */
function getCountryOfOriginValidationResults(packingList) {
  if (packingList.validateCountryOfOrigin) {
    return {
      missingNirms: findItems(packingList.items, hasMissingNirms),
      invalidNirms: findItems(packingList.items, hasInvalidNirms),
      missingCoO: findItems(packingList.items, hasMissingCoO),
      invalidCoO: findItems(packingList.items, hasInvalidCoO),
      ineligibleItems: findItems(packingList.items, hasIneligibleItems)
    }
  }

  return {
    missingNirms: [],
    invalidNirms: [],
    missingCoO: [],
    invalidCoO: [],
    ineligibleItems: []
  }
}

/**
 * Determine whether all required fields are present and valid.
 *
 * @param {Object} basicResults - Result of getBasicValidationResults
 * @param {Object} statusResults - Result of getPackingListStatusResults
 * @param {Object} countryOfOriginResults - Result of getCountryOfOriginValidationResults
 * @returns {boolean} hasAll - True when no missing/invalid fields
 */
function calculateHasAllFields(
  basicResults,
  statusResults,
  countryOfOriginResults
) {
  const hasAllItems =
    basicResults.missingIdentifier.length +
      basicResults.missingDescription.length +
      basicResults.missingPackages.length +
      basicResults.missingNetWeight.length +
      basicResults.missingNetWeightUnit.length ===
    0

  const allItemsValid =
    basicResults.invalidPackages.length +
      basicResults.invalidNetWeight.length +
      basicResults.invalidProductCodes.length ===
    0

  const countryOfOriginValid =
    countryOfOriginResults.missingNirms.length +
      countryOfOriginResults.invalidNirms.length +
      countryOfOriginResults.missingCoO.length +
      countryOfOriginResults.invalidCoO.length +
      countryOfOriginResults.ineligibleItems.length ===
    0

  return (
    hasAllItems &&
    allItemsValid &&
    countryOfOriginValid &&
    statusResults.hasRemos &&
    !statusResults.isEmpty &&
    statusResults.hasSingleRms
  )
}

/**
 * Helper to map item rows to their row_location when a predicate matches.
 *
 * @param {Array} items - Array of packing list item objects
 * @param {Function} fn - Predicate function that returns truthy for failing rows
 * @returns {Array} locations - Array of row_location objects for matching rows
 */
function findItems(items, fn) {
  return items
    .filter(fn)
    .map((item) => item.row_location)
    .filter(Boolean)
}

/**
 * Turn the validation summary into final failure text (or success flag).
 *
 * @param {Object} validationResult - Output of validatePackingListByIndexAndType
 * @param {Object} packingList - The parsed packing list object
 * @returns {Object} result - { hasAllFields, failureReasons? }
 */
function generateFailuresByIndexAndTypes(validationResult, packingList) {
  if (validationResult.hasAllFields && validationResult.hasSingleRms) {
    return {
      hasAllFields: true
    }
  } else {
    // Build failure reasons
    let failureReasons = ''

    if (validationResult.missingRemos) {
      failureReasons += 'Missing REMOS establishment number.\n'
    }

    if (validationResult.isEmpty) {
      failureReasons += 'Packing list contains no data.\n'
    }

    if (!validationResult.hasSingleRms) {
      failureReasons += 'Multiple RMS establishment numbers found.\n'
    }

    // Add per-field failures
    if (validationResult.missingIdentifier.length > 0) {
      failureReasons += 'Identifier is missing in some rows.\n'
    }

    if (validationResult.invalidProductCodes.length > 0) {
      failureReasons += 'Invalid product codes found.\n'
    }

    if (validationResult.missingDescription.length > 0) {
      failureReasons += 'Description is missing in some rows.\n'
    }

    if (validationResult.missingPackages.length > 0) {
      failureReasons += 'Number of packages is missing in some rows.\n'
    }

    if (validationResult.invalidPackages.length > 0) {
      failureReasons += 'Invalid number of packages found.\n'
    }

    if (validationResult.missingNetWeight.length > 0) {
      failureReasons += 'Net weight is missing in some rows.\n'
    }

    if (validationResult.invalidNetWeight.length > 0) {
      failureReasons += 'Invalid net weight values found.\n'
    }

    if (validationResult.missingNetWeightUnit.length > 0) {
      failureReasons += 'Net weight unit is missing in some rows.\n'
    }

    return {
      hasAllFields: false,
      failureReasons: failureReasons || 'Validation failed.'
    }
  }
}

export {
  validatePackingList,
  validatePackingListByIndexAndType,
  generateFailuresByIndexAndTypes
}
