import { createLogger } from '../../common/helpers/logging/logger.js'
import { getIneligibleItems } from '../mdm-service.js'
import { initializeCache } from './cache-common.js'

const logger = createLogger()

// In-memory cache for ineligible items
let ineligibleItemsCache = null

/**
 * Check if data is empty (null, empty array, or empty ineligibleItems)
 */
function isDataEmpty(data) {
  return (
    !data ||
    (Array.isArray(data) && data.length === 0) ||
    data.ineligibleItems?.length === 0
  )
}

/**
 * Extract item count from data
 */
function getItemCount(data) {
  return (
    data?.ineligibleItems?.length || (Array.isArray(data) ? data.length : 0)
  )
}

/**
 * Deduplicate ineligible items based on unique combination of fields
 * Uses identifying fields (country_of_origin, commodity_code, type_of_treatment)
 * Falls back to stringified object comparison if key fields are missing
 * Keeps the last occurrence if duplicates exist (latest version)
 * @param {Array} items - Array of ineligible items
 * @returns {Array} Deduplicated array of ineligible items
 */
export function deduplicateIneligibleItems(items) {
  if (!Array.isArray(items)) {
    return items
  }

  if (items.length === 0) {
    return items
  }

  // Create a Map using unique key
  // Using Map preserves insertion order and automatically handles duplicates by keeping last value
  const uniqueItems = new Map()

  items.forEach((item) => {
    // Create a unique key from the identifying fields
    const country = item.country_of_origin || ''
    const commodity = item.commodity_code || ''
    const treatment = item.type_of_treatment || ''

    // If all identifying fields are empty, use object stringification as fallback
    // This handles test data and edge cases
    const key =
      country || commodity || treatment
        ? `${country}|${commodity}|${treatment}`
        : JSON.stringify(item)

    uniqueItems.set(key, item)
  })

  const deduplicated = Array.from(uniqueItems.values())

  if (deduplicated.length < items.length) {
    logger.info(
      `Removed duplicate ineligible items - cache contains latest version only (original: ${items.length}, deduplicated: ${deduplicated.length}, duplicates removed: ${items.length - deduplicated.length})`
    )
  }

  return deduplicated
}

/**
 * Process successful S3 fetch and deduplicate data
 * Performs COMPLETE REPLACEMENT of cache (not merge) to ensure removed items don't persist
 */
function cacheS3Data(data) {
  // IMPORTANT: This is a complete replacement, not a merge
  // If MDM removes an item, it will be removed from our cache too

  // Handle both object with ineligibleItems array and direct array formats
  if (data?.ineligibleItems) {
    ineligibleItemsCache = {
      ...data,
      ineligibleItems: deduplicateIneligibleItems(data.ineligibleItems)
    }
  } else if (Array.isArray(data)) {
    ineligibleItemsCache = deduplicateIneligibleItems(data)
  } else {
    ineligibleItemsCache = data
  }

  const itemCount = getItemCount(ineligibleItemsCache)
  logger.info(
    { itemCount },
    'Ineligible items cache loaded (complete replacement)'
  )
}

/**
 * Initialize the ineligible items cache by fetching data from S3 with retry logic
 * @returns {Promise<void>}
 * @throws {Error} If unable to fetch data after all retry attempts
 */
export async function initializeIneligibleItemsCache() {
  await initializeCache(
    'ineligibleItemsCache',
    isDataEmpty,
    cacheS3Data,
    getIneligibleItems,
    'ineligible items'
  )
}

/**
 * Get the cached ineligible items data
 * @returns {Array|null} The cached ineligible items array or null if not initialized
 */
export function getIneligibleItemsCache() {
  return ineligibleItemsCache
}

/**
 * Set the ineligible items cache (useful for testing)
 * Performs COMPLETE REPLACEMENT (not merge) and deduplicates to prevent duplicate entries
 * @param {Array|Object} data - The ineligible items data to cache
 */
export function setIneligibleItemsCache(data) {
  // IMPORTANT: This is a complete replacement, not a merge
  // Previous cache data is discarded entirely

  // Handle both object with ineligibleItems array and direct array formats
  if (data?.ineligibleItems) {
    ineligibleItemsCache = {
      ...data,
      ineligibleItems: deduplicateIneligibleItems(data.ineligibleItems)
    }
  } else if (Array.isArray(data)) {
    ineligibleItemsCache = deduplicateIneligibleItems(data)
  } else {
    ineligibleItemsCache = data
  }
}

/**
 * Clear the ineligible items cache
 */
export function clearIneligibleItemsCache() {
  ineligibleItemsCache = null
}
