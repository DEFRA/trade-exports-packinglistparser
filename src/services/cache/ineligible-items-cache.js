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
 * Process successful S3 fetch
 */
function cacheS3Data(data) {
  ineligibleItemsCache = data
  const itemCount = getItemCount(data)
  logger.info(`Ineligible items cache loaded (itemCount: ${itemCount})`)
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
 * @param {Array} data - The ineligible items data to cache
 */
export function setIneligibleItemsCache(data) {
  ineligibleItemsCache = data
}

/**
 * Clear the ineligible items cache
 */
export function clearIneligibleItemsCache() {
  ineligibleItemsCache = null
}
