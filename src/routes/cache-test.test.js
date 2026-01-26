import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cacheTest } from './cache-test.js'

// Mock dependencies
vi.mock('../services/cache/ineligible-items-cache.js', () => ({
  getIneligibleItemsCache: vi.fn()
}))

const { getIneligibleItemsCache } = await import(
  '../services/cache/ineligible-items-cache.js'
)

describe('cache-test route', () => {
  let mockH

  beforeEach(() => {
    vi.clearAllMocks()
    mockH = {
      response: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis()
    }
  })

  describe('GET /cache/ineligible-items', () => {
    it('should have correct route configuration', () => {
      expect(cacheTest.method).toBe('GET')
      expect(cacheTest.path).toBe('/cache/ineligible-items')
      expect(cacheTest.handler).toBeDefined()
    })

    it('should return empty cache message when cache is null', () => {
      getIneligibleItemsCache.mockReturnValue(null)

      cacheTest.handler({}, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        message: 'Cache is empty or not initialized',
        data: null
      })
      expect(mockH.code).toHaveBeenCalledWith(200)
    })

    it('should return cached data when cache has items', () => {
      const mockCachedData = [
        { country_of_origin: 'CN', commodity_code: '0207' },
        { country_of_origin: 'BR', commodity_code: '0602' }
      ]
      getIneligibleItemsCache.mockReturnValue(mockCachedData)

      cacheTest.handler({}, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        message: 'Cache retrieved successfully',
        itemCount: 2,
        data: mockCachedData
      })
      expect(mockH.code).toHaveBeenCalledWith(200)
    })

    it('should handle empty array from cache', () => {
      getIneligibleItemsCache.mockReturnValue([])

      cacheTest.handler({}, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        message: 'Cache retrieved successfully',
        itemCount: 0,
        data: []
      })
      expect(mockH.code).toHaveBeenCalledWith(200)
    })

    it('should handle non-array cached data', () => {
      const mockCachedData = { items: [] }
      getIneligibleItemsCache.mockReturnValue(mockCachedData)

      cacheTest.handler({}, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        message: 'Cache retrieved successfully',
        itemCount: 0,
        data: mockCachedData
      })
      expect(mockH.code).toHaveBeenCalledWith(200)
    })
  })
})
