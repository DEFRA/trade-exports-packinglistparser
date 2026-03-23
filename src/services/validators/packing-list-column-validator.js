/**
 * Packing list column-level validators and failure reason generation.
 *
 * Provides composition of per-item validators and helpers that turn those
 * validation results into user-facing failure reason strings used by the
 * packing-list validation pipeline.
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
import parserModel from '../parser-model.js'
import failureReasonsDescriptions from './packing-list-failure-reasons.js'

/**
 * Validate a full packing list and produce final failure output.
 * @param {Object} packingList - The parsed packing list object.
 * @returns {Object} result - Validation result containing either `hasAllFields: true` or `hasAllFields: false` and `failureReasons`.
 */
function validatePackingList(packingList) {
  const validationResult = validatePackingListByIndexAndType(packingList)
  return generateFailuresByIndexAndTypes(validationResult, packingList)
}

/**
 * Run the set of validation checks and return a structured map of failing row locations.
 * @param {Object} packingList - The parsed packing list object.
 * @returns {Object} validationSummary - Collections of failing locations grouped by failure type and a boolean `hasAllFields`.
 */
function validatePackingListByIndexAndType(packingList) {
  const itemValidationResults = getItemValidationResults(packingList)
  const basicValidationResults = getBasicValidationResults(
    itemValidationResults
  )
  const packingListStatusResults = getPackingListStatusResults(packingList)
  const countryOfOriginResults = getCountryOfOriginValidationResults(
    itemValidationResults
  )
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
 * Run all relevant item-level validators in a single pass across rows.
 * @param {Object} packingList - The parsed packing list object.
 * @returns {Object} itemValidationResults - Arrays of `row_location` values for all supported item-level checks.
 */
function getItemValidationResults(packingList) {
  const checks = {
    missingIdentifier: hasMissingIdentifier,
    invalidProductCodes: hasInvalidProductCode,
    missingDescription: hasMissingDescription,
    missingPackages: hasMissingPackages,
    invalidPackages: wrongTypeForPackages,
    missingNetWeight: hasMissingNetWeight,
    invalidNetWeight: wrongTypeNetWeight,
    missingNetWeightUnit: hasMissingNetWeightUnit
  }

  if (packingList.validateCountryOfOrigin) {
    checks.missingNirms = hasMissingNirms
    checks.invalidNirms = hasInvalidNirms
    checks.missingCoO = hasMissingCoO
    checks.invalidCoO = hasInvalidCoO
    checks.ineligibleItems = hasIneligibleItems
  } else {
    checks.missingNirms = null
    checks.invalidNirms = null
    checks.missingCoO = null
    checks.invalidCoO = null
    checks.ineligibleItems = null
  }

  return collectItemValidationResults(packingList.items, checks)
}

/**
 * Run basic column-level validators against each item row and collect failing row locations.
 * @param {Object} itemValidationResults - Aggregate item-level validation output.
 * @returns {Object} basicResults - Arrays of `row_location` values for each basic failure category.
 */
function getBasicValidationResults(itemValidationResults) {
  return {
    missingIdentifier: itemValidationResults.missingIdentifier,
    invalidProductCodes: itemValidationResults.invalidProductCodes,
    missingDescription: itemValidationResults.missingDescription,
    missingPackages: itemValidationResults.missingPackages,
    invalidPackages: itemValidationResults.invalidPackages,
    missingNetWeight: itemValidationResults.missingNetWeight,
    invalidNetWeight: itemValidationResults.invalidNetWeight,
    missingNetWeightUnit: itemValidationResults.missingNetWeightUnit
  }
}

/**
 * Determine high-level status flags for the packing list (RMS presence, emptiness, parser match etc.).
 * @param {Object} packingList - The parsed packing list object.
 * @returns {Object} statusResults - Boolean flags describing packing list status.
 */
function getPackingListStatusResults(packingList) {
  const hasRemos = packingList.registration_approval_number !== null
  const isEmpty = packingList.items.length === 0
  const missingRemos =
    packingList.registration_approval_number === null ||
    packingList.parserModel === parserModel.NOREMOS
  const noMatch = packingList.parserModel === parserModel.NOMATCH
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
 * Run country-of-origin related validators when enabled and collect failing locations.
 * @param {Object} itemValidationResults - Aggregate item-level validation output.
 * @returns {Object} cooResults - Arrays of `row_location` values for country-of-origin related failures.
 */
function getCountryOfOriginValidationResults(itemValidationResults) {
  return {
    missingNirms: itemValidationResults.missingNirms,
    invalidNirms: itemValidationResults.invalidNirms,
    missingCoO: itemValidationResults.missingCoO,
    invalidCoO: itemValidationResults.invalidCoO,
    ineligibleItems: itemValidationResults.ineligibleItems
  }
}

/**
 * Determine whether all required fields are present and valid across the packing list.
 * @param {Object} basicResults - Result of `getBasicValidationResults`.
 * @param {Object} statusResults - Result of `getPackingListStatusResults`.
 * @param {Object} countryOfOriginResults - Result of `getCountryOfOriginValidationResults`.
 * @returns {boolean} hasAll - True when no missing/invalid fields and RMS & CO checks pass.
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
    !statusResults.missingRemos
  )
}

/**
 * Execute all provided item-level checks in one pass through the item collection.
 * @param {Array} items - Array of packing list item objects.
 * @param {Object} checks - Map of check names to predicate functions.
 * @returns {Object} results - Map of check names to arrays of matching `row_location` values.
 */
function collectItemValidationResults(items, checks) {
  const results = {}
  const activeChecks = []

  for (const [checkName, check] of Object.entries(checks)) {
    results[checkName] = []

    if (check !== null) {
      activeChecks.push({ checkName, check })
    }
  }

  for (const item of items) {
    const { row_location: rowLocation } = item

    for (const { checkName, check } of activeChecks) {
      if (check(item)) {
        results[checkName].push(rowLocation)
      }
    }
  }

  return results
}

/**
 * Turn the validation summary into final failure text (or success flag).
 * @param {Object} validationResult - Output of `validatePackingListByIndexAndType`.
 * @param {Object} packingList - The parsed packing list object used for header flags.
 * @returns {Object} result - If valid returns `{ hasAllFields: true }` else `{ hasAllFields: false, failureReasons: string }`.
 */
function generateFailuresByIndexAndTypes(validationResult, packingList) {
  if (validationResult.hasAllFields && validationResult.hasSingleRms) {
    return {
      hasAllFields: true
    }
  } else {
    // build failure reason
    const failuresAndChecks = {
      failureReasons: getFailureReasons(validationResult),
      checks: createValidationChecks(validationResult)
    }

    // Handle multiple RMS as a special case
    addSingleRmsFailureReason(validationResult, failuresAndChecks)

    // Handle net weight unit as a special case
    addNetWeightFailureReasonOrCheck(
      validationResult,
      packingList.unitInHeader,
      failuresAndChecks
    )

    // if there is a nirms blanket statement, just the description below is assigned to the failure reason
    addNirmsFailureReasonOrCheck(
      validationResult,
      packingList.blanketNirms,
      failuresAndChecks
    )

    const failingChecks = failuresAndChecks.checks.filter(
      (check) => check.collection.length > 0
    )
    for (const check of failingChecks) {
      failuresAndChecks.failureReasons += generateFailureReasonFromRows(
        check.description,
        check.collection
      )
    }

    return {
      hasAllFields: false,
      failureReasons: failuresAndChecks.failureReasons
    }
  }
}

/**
 * Append multiple-RMS failure reason to the accumulated reasons when present.
 * @param {Object} validationResult - Validation summary object.
 * @param {Object} reasonsAndChecks - Accumulator containing `failureReasons` and `checks`.
 */
function addSingleRmsFailureReason(validationResult, reasonsAndChecks) {
  if (!validationResult.hasSingleRms) {
    reasonsAndChecks.failureReasons += failureReasonsDescriptions.MULTIPLE_RMS
  }
}

/**
 * Either append a net-weight-unit blanket failure reason or add a check entry for rows needing attention.
 * @param {Object} validationResult - Validation summary object.
 * @param {boolean} unitInHeader - True when a unit-of-weight appears in the header.
 * @param {Object} reasonsAndChecks - Accumulator containing `failureReasons` and `checks`.
 */
function addNetWeightFailureReasonOrCheck(
  validationResult,
  unitInHeader,
  reasonsAndChecks
) {
  if (validationResult.missingNetWeightUnit.length !== 0 && unitInHeader) {
    reasonsAndChecks.failureReasons += `${failureReasonsDescriptions.NET_WEIGHT_UNIT_MISSING}.\n`
  }
  // if the net weight unit is not in the header, the collection of the row/sheet location and description should be added into the checks array
  else {
    reasonsAndChecks.checks.push({
      collection: validationResult.missingNetWeightUnit,
      description: failureReasonsDescriptions.NET_WEIGHT_UNIT_MISSING
    })
  }
}

/**
 * Either append a blanket NIRMS failure reason or add a check entry for per-row missing NIRMS.
 * @param {Object} validationResult - Validation summary object.
 * @param {boolean} blanketNirms - True when a blanket NIRMS statement is present on the packing list.
 * @param {Object} reasonsAndChecks - Accumulator containing `failureReasons` and `checks`.
 */
function addNirmsFailureReasonOrCheck(
  validationResult,
  blanketNirms,
  reasonsAndChecks
) {
  if (validationResult.missingNirms.length !== 0 && blanketNirms) {
    reasonsAndChecks.failureReasons += `${failureReasonsDescriptions.NIRMS_MISSING}.\n`
  }
  // if there is no nirms blanket statement, the collection of the row/sheet location and description should be added into the checks array
  else {
    reasonsAndChecks.checks.push({
      collection: validationResult.missingNirms,
      description: failureReasonsDescriptions.NIRMS_MISSING
    })
  }
}

/**
 * Build the ordered list of validation checks used to generate per-row failure descriptions.
 * @param {Object} validationResult - Validation summary object.
 * @returns {Array} checks - Array of { collection, description } entries used by the failure text generator.
 */
function createValidationChecks(validationResult) {
  return [
    {
      collection: validationResult.missingIdentifier,
      description: failureReasonsDescriptions.IDENTIFIER_MISSING
    },
    {
      collection: validationResult.invalidProductCodes,
      description: failureReasonsDescriptions.PRODUCT_CODE_INVALID
    },
    {
      collection: validationResult.missingDescription,
      description: failureReasonsDescriptions.DESCRIPTION_MISSING
    },
    {
      collection: validationResult.missingPackages,
      description: failureReasonsDescriptions.PACKAGES_MISSING
    },
    {
      collection: validationResult.missingNetWeight,
      description: failureReasonsDescriptions.NET_WEIGHT_MISSING
    },
    {
      collection: validationResult.invalidPackages,
      description: failureReasonsDescriptions.PACKAGES_INVALID
    },
    {
      collection: validationResult.invalidNetWeight,
      description: failureReasonsDescriptions.NET_WEIGHT_INVALID
    },
    {
      collection: validationResult.invalidNirms,
      description: failureReasonsDescriptions.NIRMS_INVALID
    },
    {
      collection: validationResult.missingCoO,
      description: failureReasonsDescriptions.COO_MISSING
    },
    {
      collection: validationResult.invalidCoO,
      description: failureReasonsDescriptions.COO_INVALID
    },
    {
      collection: validationResult.ineligibleItems,
      description: failureReasonsDescriptions.PROHIBITED_ITEM
    }
  ]
}

/**
 * Convert a collection of row locations into a user-facing failure reason string.
 * Chooses page/sheet-aware formatting when available.
 * @param {string} description - Short failure description text.
 * @param {Array} rows - Array of row location objects (may include sheetName or pageNumber).
 * @returns {string} reasonText - Human readable failure sentence(s) ending in newline when applicable.
 */
function generateFailureReasonFromRows(description, rows) {
  if (rows.length === 0) {
    return ''
  } else if (rows[0].sheetName) {
    return generateRowLocation(
      generateLocationSheetDescription,
      description,
      rows
    )
  } else if (rows[0].pageNumber) {
    return generateRowLocation(
      generateLocationPageDescription,
      description,
      rows
    )
  } else {
    return generateByRow(description, rows)
  }
}

const maxItemsToShow = 3

/**
 * Format a failure reason when only row numbers are available.
 * @param {string} description - Short failure description text.
 * @param {Array} rows - Array of row location objects containing `rowNumber`.
 * @returns {string} formatted - Human readable sentence describing row numbers.
 */
function generateByRow(description, rows) {
  if (rows.length === 0) {
    return ''
  } else if (rows.length === 1) {
    return `${description} in row ${rows[0].rowNumber}.\n`
  } else if (rows.length === 2) {
    return `${description} in rows ${rows[0].rowNumber} and ${rows[1].rowNumber}.\n`
  } else if (rows.length === maxItemsToShow) {
    return `${description} in rows ${rows[0].rowNumber}, ${rows[1].rowNumber} and ${rows[2].rowNumber}.\n`
  } else {
    return `${description} in rows ${rows
      .slice(0, maxItemsToShow)
      .map((row) => row.rowNumber)
      .join(
        ', '
      )} in addition to ${rows.length - maxItemsToShow} other locations.\n`
  }
}

/**
 * Generic formatter that uses a provided `generateDescription` to format named locations
 * such as sheet+row or page+row descriptions.
 * @param {Function} generateDescription - Function that returns a short description for a single row-location object.
 * @param {string} description - Short failure description text.
 * @param {Array} rows - Array of row location objects.
 * @returns {string} formatted - Human readable sentence describing locations.
 */
function generateRowLocation(generateDescription, description, rows) {
  if (rows.length === 0) {
    return ''
  } else if (rows.length === 1) {
    return `${description} in ${generateDescription(rows[0])}.\n`
  } else if (rows.length === 2) {
    return `${description} in ${generateDescription(rows[0])} and ${generateDescription(rows[1])}.\n`
  } else if (rows.length === maxItemsToShow) {
    return `${description} in ${generateDescription(rows[0])}, ${generateDescription(rows[1])} and ${generateDescription(rows[2])}.\n`
  } else {
    return `${description} in ${rows
      .slice(0, maxItemsToShow)
      .map((row) => generateDescription(row))
      .join(
        ', '
      )} in addition to ${rows.length - maxItemsToShow} other locations.\n`
  }
}

/**
 * Create a sheet-aware location description.
 * @param {Object} row - Row-location object with `sheetName` and `rowNumber`.
 * @returns {string} text - Formatted location such as `sheet "Sheet 1" row 2`.
 */
function generateLocationSheetDescription(row) {
  return `sheet "${row.sheetName}" row ${row.rowNumber}`
}

/**
 * Create a page-aware location description.
 * @param {Object} row - Row-location object with `pageNumber` and `rowNumber`.
 * @returns {string} text - Formatted location such as `page 2 row 5`.
 */
function generateLocationPageDescription(row) {
  return `page ${row.pageNumber} row ${row.rowNumber}`
}

/**
 * Determine any global failure reason text (no-match / missing REMOS / empty data).
 * @param {Object} validationResult - Validation summary object.
 * @returns {string|null} text - Either `null` for no-match, a global failure reason string, or empty string.
 */
function getFailureReasons(validationResult) {
  if (validationResult.noMatch) {
    return null
  }
  if (validationResult.missingRemos) {
    return failureReasonsDescriptions.MISSING_REMOS
  }
  if (validationResult.isEmpty) {
    return failureReasonsDescriptions.EMPTY_DATA
  }
  return ''
}

export {
  validatePackingList,
  validatePackingListByIndexAndType,
  generateFailuresByIndexAndTypes,
  generateFailureReasonFromRows
}
