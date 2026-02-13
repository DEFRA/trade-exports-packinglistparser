import { createLogger } from '../../common/helpers/logging/logger.js'
import { getIsoCodes } from '../mdm-service.js'
import { initializeCache } from './cache-common.js'

const logger = createLogger()

// In-memory cache for ISO codes
let isoCodesCache = null

/**
 * Check if data is empty (null, empty array)
 */
function isDataEmpty(data) {
  return !data || (Array.isArray(data) && data.length === 0)
}

/**
 * Extract item count from data
 */
function getItemCount(data) {
  return Array.isArray(data) ? data.length : 0
}

/**
 * Process successful S3 fetch and normalize data format
 * Converts MDM API format [{code, name}] to simple string array [code]
 */
function cacheS3Data(data) {
  // Normalize data: if array of objects with 'code' property, extract just the codes
  if (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0] === 'object' &&
    data[0].code
  ) {
    isoCodesCache = data.map((item) => item.code?.toUpperCase() || item.code)
  } else {
    isoCodesCache = data
  }
  const itemCount = getItemCount(isoCodesCache)
  logger.info({ itemCount }, 'ISO codes cache loaded')
}

/**
 * Initialize the ISO codes cache by fetching data from S3 with retry logic
 * @returns {Promise<void>}
 * @throws {Error} If unable to fetch data after all retry attempts
 */
export async function initializeIsoCodesCache() {
  await initializeCache(
    'isoCodesCache',
    isDataEmpty,
    cacheS3Data,
    getIsoCodes,
    'ISO codes'
  )
}

/**
 * Get the cached ISO codes data
 * @returns {Array|null} The cached ISO codes array or null if not initialized
 */
export function getIsoCodesCache() {
  return isoCodesCache
}

/**
 * Set the ISO codes cache (useful for testing)
 * @param {Array} data - The ISO codes data to cache
 */
export function setIsoCodesCache(data) {
  isoCodesCache = data
}

/**
 * Clear the ISO codes cache
 */
export function clearIsoCodesCache() {
  isoCodesCache = null
}
