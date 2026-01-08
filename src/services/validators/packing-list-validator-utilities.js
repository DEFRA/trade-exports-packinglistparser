/**
 * Utility validators and helpers for packing list column validation.
 *
 * Exports a set of predicate functions used by the packing-list validator pipeline.
 */

import isoCodesData from '../data/data-iso-codes.json' with { type: 'json' }
import ineligibleItemsData from '../data/data-ineligible-items.json' with { type: 'json' }

/**
 * Check whether a value is null, undefined or an empty string.
 *
 * @param {*} value - Value to test
 * @returns {boolean} True when value is null/undefined/empty string
 */
function isNullOrEmptyString(value) {
  return value === null || value === undefined || value === ''
}

/**
 * Determine whether an item is missing an identifier (either commodity code
 * or both nature_of_products and type_of_treatment).
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when identifier data is missing
 */
function hasMissingIdentifier(item) {
  const hasCommodityCode = !isNullOrEmptyString(item.commodity_code)
  const hasNature = !isNullOrEmptyString(item.nature_of_products)
  const hasTreatment = !isNullOrEmptyString(item.type_of_treatment)

  // Must have either commodity code OR both nature and treatment
  return !hasCommodityCode && !(hasNature && hasTreatment)
}

/**
 * Check if commodity code is invalid (non-numeric characters).
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when commodity code is invalid
 */
function hasInvalidProductCode(item) {
  if (isNullOrEmptyString(item.commodity_code)) {
    return false
  }
  // Commodity codes should be numeric (strip all whitespace before checking)
  return (
    item.commodity_code.toString().replaceAll(/\s+/g, '').match(/^\d*$/) ===
    null
  )
}

/**
 * Check if description is missing.
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when description is missing
 */
function hasMissingDescription(item) {
  return isNullOrEmptyString(item.description)
}

/**
 * Check if number of packages is missing.
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when packages is missing
 */
function hasMissingPackages(item) {
  return isNullOrEmptyString(item.number_of_packages)
}

/**
 * Check if number of packages is wrong type (not a number).
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when packages is not a valid number
 */
function wrongTypeForPackages(item) {
  if (isNullOrEmptyString(item.number_of_packages)) {
    return false
  }
  const numberOfPackages = Number(item.number_of_packages)
  return Number.isNaN(numberOfPackages) || numberOfPackages < 0
}

/**
 * Check if net weight is missing.
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when net weight is missing
 */
function hasMissingNetWeight(item) {
  return isNullOrEmptyString(item.total_net_weight_kg)
}

/**
 * Check if net weight is wrong type (not a number).
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when net weight is not a valid number
 */
function wrongTypeNetWeight(item) {
  if (isNullOrEmptyString(item.total_net_weight_kg)) {
    return false
  }
  const totalNetWeightKg = Number(item.total_net_weight_kg)
  return Number.isNaN(totalNetWeightKg) || totalNetWeightKg < 0
}

/**
 * Check if net weight unit is missing.
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when net weight unit is missing
 */
function hasMissingNetWeightUnit(item) {
  return isNullOrEmptyString(item.total_net_weight_unit)
}

/**
 * Check if NIRMS field is missing.
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when NIRMS is missing
 */
function hasMissingNirms(item) {
  return isNullOrEmptyString(item.nirms)
}

/**
 * Check if NIRMS field is invalid (not 'yes', 'no', or 'NIRMS').
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when NIRMS is invalid
 */
function hasInvalidNirms(item) {
  return (
    !isNullOrEmptyString(item.nirms) &&
    !isNirms(item.nirms) &&
    !isNotNirms(item.nirms)
  )
}

/**
 * Check if country of origin is missing.
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when country of origin is missing
 */
function hasMissingCoO(item) {
  return isNirms(item.nirms) && isNullOrEmptyString(item.country_of_origin)
}

/**
 * Check if country of origin is invalid (not a valid ISO code).
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when country of origin is invalid
 */
function hasInvalidCoO(item) {
  return isNirms(item.nirms) && isInvalidCoO(item.country_of_origin)
}

/**
 * Validate if a country code is a valid ISO code.
 *
 * @param {string} code - Country code to validate
 * @returns {boolean} True when code is valid ISO code
 */
function isValidIsoCode(code) {
  if (!code || typeof code !== 'string') {
    return false
  }
  const normalizedCode = code.toLowerCase().trim()
  return isoCodesData.some(
    (isoCode) => isoCode.toLowerCase() === normalizedCode
  )
}

/**
 * Check if country of origin value is invalid.
 *
 * @param {*} countryOfOrigin - Raw country_of_origin value
 * @returns {boolean} True when value is present but invalid
 */
function isInvalidCoO(countryOfOrigin) {
  if (isNullOrEmptyString(countryOfOrigin)) {
    return false
  }

  if (typeof countryOfOrigin !== 'string') {
    return true
  }

  const normalizedValue = countryOfOrigin.trim().toLowerCase()

  // Special case for "x"
  if (normalizedValue === 'x') {
    return false
  }

  // Check if it contains comma-separated values
  if (normalizedValue.includes(',')) {
    const codes = normalizedValue.split(',')
    // All individual codes must be valid
    return codes.some((code) => !isValidIsoCode(code.trim()))
  }

  // Single value case
  return !isValidIsoCode(countryOfOrigin)
}

/**
 * Check if item contains ineligible/prohibited goods.
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when item is ineligible
 */
function hasIneligibleItems(item) {
  return (
    isNirms(item.nirms) &&
    !isNullOrEmptyString(item.country_of_origin) &&
    !hasInvalidCoO(item) &&
    !isNullOrEmptyString(item.commodity_code) &&
    isIneligibleItem(
      item.country_of_origin,
      item.commodity_code,
      item.type_of_treatment
    )
  )
}

/**
 * Check if NIRMS field indicates NIRMS goods.
 *
 * @param {string} nirms - NIRMS field value
 * @returns {boolean} True when value indicates NIRMS goods
 */
function isNirms(nirms) {
  if (isNullOrEmptyString(nirms)) {
    return false
  }
  return stringMatchesPattern(nirms, /^(yes|nirms|green|y|g)$/i, /^green lane/i)
}

/**
 * Check if NIRMS field indicates non-NIRMS goods.
 *
 * @param {string} nirms - NIRMS field value
 * @returns {boolean} True when value indicates non-NIRMS goods
 */
function isNotNirms(nirms) {
  if (isNullOrEmptyString(nirms)) {
    return false
  }
  return stringMatchesPattern(
    nirms,
    /^(no|red|n|r)$/i,
    /^red lane/i,
    /^non[- ]?nirms/i
  )
}

/**
 * Check if a string matches any of the given regex patterns.
 *
 * @param {string} value - Value to test
 * @param {...RegExp} patterns - Regex patterns to test against
 * @returns {boolean} True when value matches any pattern
 */
function stringMatchesPattern(value, ...patterns) {
  const normalized = String(value).trim()
  return patterns.some((pattern) => pattern.test(normalized))
}

/**
 * Check if an item matches ineligible items criteria.
 *
 * @param {string} countryOfOrigin - Country of origin code
 * @param {string} commodityCode - Commodity code
 * @param {string} typeOfTreatment - Type of treatment
 * @returns {boolean} True when item is ineligible
 */
function isIneligibleItem(countryOfOrigin, commodityCode, typeOfTreatment) {
  const normalizedTypeOfTreatment =
    typeof typeOfTreatment === 'string' && typeOfTreatment.trim() !== ''
      ? typeOfTreatment.trim()
      : null

  // Find matching entries based on country and commodity code
  const matchingEntries = ineligibleItemsData.filter(
    (item) =>
      isCountryOfOriginMatching(countryOfOrigin, item.country_of_origin) &&
      commodityCode
        .toString()
        .toLowerCase()
        .startsWith(item.commodity_code?.toLowerCase())
  )

  if (matchingEntries.length === 0) {
    return false
  }

  // Check for exception rules (prefixed with !)
  const exceptionRules = matchingEntries.filter((item) =>
    item.type_of_treatment?.startsWith('!')
  )
  const standardRules = matchingEntries.filter(
    (item) => !item.type_of_treatment?.startsWith('!')
  )

  if (exceptionRules.length > 0) {
    const matchesException = matchesExceptionRule(
      exceptionRules,
      normalizedTypeOfTreatment
    )
    // Item is allowed if it matches an exception rule
    return !matchesException
  }

  return matchesStandardRule(standardRules, normalizedTypeOfTreatment)
}

/**
 * Check if country of origin matches the rule.
 *
 * @param {string} itemCountry - Item's country of origin
 * @param {string} ruleCountry - Rule's country of origin
 * @returns {boolean} True when countries match
 */
function isCountryOfOriginMatching(itemCountry, ruleCountry) {
  if (!itemCountry || !ruleCountry) {
    return false
  }
  return itemCountry.toLowerCase().trim() === ruleCountry.toLowerCase().trim()
}

/**
 * Check if item matches any exception rule.
 *
 * @param {Array<Object>} exceptionRules - Array of exception rules
 * @param {string|null} typeOfTreatment - Type of treatment to check
 * @returns {boolean} True when item matches an exception
 */
function matchesExceptionRule(exceptionRules, typeOfTreatment) {
  return exceptionRules.some((rule) => {
    const exceptionTreatment = rule.type_of_treatment.substring(1) // Remove ! prefix
    if (exceptionTreatment === '' || exceptionTreatment === null) {
      return typeOfTreatment === null || typeOfTreatment === ''
    }
    return (
      typeOfTreatment &&
      typeOfTreatment.toLowerCase() === exceptionTreatment.toLowerCase()
    )
  })
}

/**
 * Check if item matches any standard rule.
 *
 * @param {Array<Object>} standardRules - Array of standard rules
 * @param {string|null} typeOfTreatment - Type of treatment to check
 * @returns {boolean} True when item matches a standard rule
 */
function matchesStandardRule(standardRules, typeOfTreatment) {
  return standardRules.some((rule) => {
    // null in rule means match any treatment
    if (rule.type_of_treatment === null) {
      return true
    }
    // Match specific treatment
    if (typeOfTreatment === null) {
      return false
    }
    return (
      typeOfTreatment.toLowerCase() === rule.type_of_treatment.toLowerCase()
    )
  })
}

/**
 * Remove item objects that only contain an empty `row_location` and no data.
 *
 * @param {Array<Object>} packingListItems - Array of item objects
 * @returns {Array<Object>} Filtered array with empty entries removed
 */
function removeEmptyItems(packingListItems) {
  const isNullOrUndefined = (entry) =>
    entry[0] === 'row_location' || entry[1] === null || entry[1] === undefined

  return packingListItems.filter(
    (x) => !Object.entries(x).every(isNullOrUndefined)
  )
}

/**
 * Remove items with invalid or missing critical data.
 * This is a final cleanup step after validation.
 *
 * @param {Array<Object>} packingListItems - Array of item objects
 * @returns {Array<Object>} Filtered array with bad data removed
 */
function removeBadData(packingListItems) {
  for (const x of packingListItems) {
    if (wrongTypeForPackages(x)) {
      x.number_of_packages = null
    }
    if (wrongTypeNetWeight(x)) {
      x.total_net_weight_kg = null
    }
  }
  return packingListItems
}

export {
  isNullOrEmptyString,
  hasMissingIdentifier,
  hasInvalidProductCode,
  hasMissingDescription,
  hasMissingPackages,
  wrongTypeForPackages,
  hasMissingNetWeight,
  wrongTypeNetWeight,
  hasMissingNetWeightUnit,
  hasMissingNirms,
  hasInvalidNirms,
  hasMissingCoO,
  hasInvalidCoO,
  hasIneligibleItems,
  removeEmptyItems,
  removeBadData,
  isNirms,
  isNotNirms
}
