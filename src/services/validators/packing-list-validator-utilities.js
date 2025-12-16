/**
 * Utility validators and helpers for packing list column validation.
 *
 * Exports a set of predicate functions used by the packing-list validator pipeline.
 */

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
  // Commodity codes should be numeric
  return !/^\d+$/.test(String(item.commodity_code).trim())
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
  return Number.isNaN(Number(item.number_of_packages))
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
  return Number.isNaN(Number(item.total_net_weight_kg))
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
  if (isNullOrEmptyString(item.nirms)) {
    return false
  }
  const normalized = String(item.nirms).toLowerCase().trim()
  return !['yes', 'no', 'nirms'].includes(normalized)
}

/**
 * Check if country of origin is missing.
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when country of origin is missing
 */
function hasMissingCoO(item) {
  return isNullOrEmptyString(item.country_of_origin)
}

/**
 * Check if country of origin is invalid (not a valid ISO code).
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when country of origin is invalid
 */
function hasInvalidCoO(item) {
  if (isNullOrEmptyString(item.country_of_origin)) {
    return false
  }
  // TODO: Validate against ISO codes list when data file is available
  return false
}

/**
 * Check if item contains ineligible/prohibited goods.
 *
 * @param {Object} item - Packing list item object
 * @returns {boolean} True when item is ineligible
 */
function hasIneligibleItems(item) {
  // TODO: Check against ineligible items list when data file is available
  return false
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
  return packingListItems.filter((item) => {
    // Keep items that have at least a description or commodity code
    return (
      !isNullOrEmptyString(item.description) ||
      !isNullOrEmptyString(item.commodity_code)
    )
  })
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
  removeBadData
}
