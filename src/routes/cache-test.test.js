import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cacheTestIneligibleItems, cacheTestIsoCodes } from './cache-test.js'

// Mock dependencies
vi.mock('../services/cache/ineligible-items-cache.js', () => ({
  getIneligibleItemsCache: vi.fn()
}))

vi.mock('../services/cache/iso-codes-cache.js', () => ({
  getIsoCodesCache: vi.fn()
}))

const { getIneligibleItemsCache } = await import(
  '../services/cache/ineligible-items-cache.js'
)
const { getIsoCodesCache } = await import(
  '../services/cache/iso-codes-cache.js'
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
      expect(cacheTestIneligibleItems.method).toBe('GET')
      expect(cacheTestIneligibleItems.path).toBe('/cache/ineligible-items')
      expect(cacheTestIneligibleItems.handler).toBeDefined()
    })

    it('should return empty cache message when cache is null', () => {
      getIneligibleItemsCache.mockReturnValue(null)

      cacheTestIneligibleItems.handler({}, mockH)

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

      cacheTestIneligibleItems.handler({}, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        message: 'Cache retrieved successfully',
        itemCount: 2,
        data: mockCachedData
      })
      expect(mockH.code).toHaveBeenCalledWith(200)
    })

    it('should handle empty array from cache', () => {
      getIneligibleItemsCache.mockReturnValue([])

      cacheTestIneligibleItems.handler({}, mockH)

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

      cacheTestIneligibleItems.handler({}, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        message: 'Cache retrieved successfully',
        itemCount: 0,
        data: mockCachedData
      })
      expect(mockH.code).toHaveBeenCalledWith(200)
    })
  })

  describe('GET /cache/iso-codes', () => {
    it('should have correct route configuration', () => {
      expect(cacheTestIsoCodes.method).toBe('GET')
      expect(cacheTestIsoCodes.path).toBe('/cache/iso-codes')
      expect(cacheTestIsoCodes.handler).toBeDefined()
    })

    it('should return empty cache message when cache is null', () => {
      getIsoCodesCache.mockReturnValue(null)

      cacheTestIsoCodes.handler({}, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        message: 'Cache is empty or not initialized',
        data: null
      })
      expect(mockH.code).toHaveBeenCalledWith(200)
    })

    it('should return cached ISO codes data when cache has items', () => {
      const mockCachedData = [
        { code: 'GB', name: 'United Kingdom' },
        { code: 'US', name: 'United States' },
        { code: 'FR', name: 'France' }
      ]
      getIsoCodesCache.mockReturnValue(mockCachedData)

      cacheTestIsoCodes.handler({}, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        message: 'Cache retrieved successfully',
        itemCount: 3,
        data: mockCachedData
      })
      expect(mockH.code).toHaveBeenCalledWith(200)
    })

    it('should handle empty array from ISO codes cache', () => {
      getIsoCodesCache.mockReturnValue([])

      cacheTestIsoCodes.handler({}, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        message: 'Cache retrieved successfully',
        itemCount: 0,
        data: []
      })
      expect(mockH.code).toHaveBeenCalledWith(200)
    })
  })
})
