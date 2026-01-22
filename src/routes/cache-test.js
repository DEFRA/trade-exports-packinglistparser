import { getIneligibleItemsCache } from '../services/cache/ineligible-items-cache.js'
import { STATUS_CODES } from './statuscodes.js'

const cacheTest = {
  method: 'GET',
  path: '/cache/ineligible-items',
  handler: getCacheHandler
}

/**
 * Handler for testing ineligible items cache
 * @param {Object} _request - Hapi request object (unused)
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} Response with cache status and data
 */
function getCacheHandler(_request, h) {
  const cachedData = getIneligibleItemsCache()

  if (cachedData === null) {
    console.log('Ineligible items cache is empty or not initialized')
    return h
      .response({
        message: 'Cache is empty or not initialized',
        data: null
      })
      .code(STATUS_CODES.OK)
  }

  const itemCount = Array.isArray(cachedData) ? cachedData.length : 0
  console.log(`Ineligible items cache contains ${itemCount} items`)
  console.log('Cache data:', JSON.stringify(cachedData, null, 2))

  return h
    .response({
      message: 'Cache retrieved successfully',
      itemCount,
      data: cachedData
    })
    .code(STATUS_CODES.OK)
}

export { cacheTest }
