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
 * Transform MDM ISO codes objects to simple string array format
 * Extracts effectiveAlpha2 codes and normalizes to uppercase
 * Matches the format in data-iso-codes.json: ["AD", "AE", "AF", ...]
 * @param {Array} data - Array of ISO code objects or strings
 * @returns {Array|*} Array of uppercase ISO code strings (deduplicated) or original data if not an array
 */
export function transformToSimpleIsoCodes(data) {
  // Handle non-array data (legacy support for tests/edge cases)
  if (!Array.isArray(data)) {
    return data
  }

  if (data.length === 0) {
    return []
  }

  // If data is an array of objects (MDM format), extract the codes
  if (typeof data[0] === 'object' && data[0] !== null) {
    const codes = data
      .map((item) => {
        const code = item.effectiveAlpha2
        return code ? code.toUpperCase() : null
      })
      .filter((code) => code !== null)

    // Deduplicate using Set
    return [...new Set(codes)]
  }

  // If already strings, just normalize and deduplicate
  const codes = data
    .map((code) => (typeof code === 'string' ? code.toUpperCase() : null))
    .filter((code) => code !== null)

  return [...new Set(codes)]
}

/**
 * Process successful S3 fetch and normalize data format
 * Converts MDM API format to simple string array of ISO alpha-2 codes
 * Handles MDM /geo/countries format: {effectiveAlpha2, name, ...}
 * Performs COMPLETE REPLACEMENT of cache (not merge) to ensure removed codes don't persist
 */
function cacheS3Data(data) {
  // IMPORTANT: This is a complete replacement, not a merge
  // If MDM removes a country code, it will be removed from our cache too
  isoCodesCache = transformToSimpleIsoCodes(data)
  const itemCount = getItemCount(isoCodesCache)
  logger.info({ itemCount }, 'ISO codes cache loaded (complete replacement)')
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
 * Performs COMPLETE REPLACEMENT (not merge) and automatically transforms object arrays to simple string format
 * @param {Array} data - The ISO codes data to cache (objects or strings)
 */
export function setIsoCodesCache(data) {
  // IMPORTANT: This is a complete replacement, not a merge
  // Previous cache data is discarded entirely
  isoCodesCache = transformToSimpleIsoCodes(data)
}

/**
 * Clear the ISO codes cache
 */
export function clearIsoCodesCache() {
  isoCodesCache = null
}
