import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  initializeIneligibleItemsCache,
  getIneligibleItemsCache,
  setIneligibleItemsCache,
  clearIneligibleItemsCache
} from './ineligible-items-cache.js'

// Mock dependencies
vi.mock('../s3-service.js', () => ({
  getFileFromS3: vi.fn()
}))

vi.mock('../../config.js', () => ({
  config: {
    get: vi.fn()
  }
}))

vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }))
}))

// Import mocked functions after vi.mock
const { getFileFromS3 } = await import('../s3-service.js')
const { config } = await import('../../config.js')

describe('ineligible-items-cache', () => {
  const mockConfig = {
    s3FileName: 'ineligible-items',
    s3Schema: 'v1.0',
    maxRetries: 3,
    retryDelayMs: 100
  }

  const mockIneligibleItems = [
    {
      country_of_origin: 'CN',
      commodity_code: '0207',
      type_of_treatment: null
    },
    {
      country_of_origin: 'BR',
      commodity_code: '0602',
      type_of_treatment: 'Chilled'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    clearIneligibleItemsCache()
    config.get.mockReturnValue(mockConfig)
  })

  afterEach(() => {
    clearIneligibleItemsCache()
  })

  describe('initializeIneligibleItemsCache', () => {
    it('should successfully fetch and cache ineligible items from S3', async () => {
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIneligibleItems))

      await initializeIneligibleItemsCache()

      expect(getFileFromS3).toHaveBeenCalledWith({
        filename: 'ineligible-items',
        schema: 'v1.0'
      })
      expect(getIneligibleItemsCache()).toEqual(mockIneligibleItems)
    })

    it('should handle S3 location without schema', async () => {
      config.get.mockReturnValue({ ...mockConfig, s3Schema: null })
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIneligibleItems))

      await initializeIneligibleItemsCache()

      expect(getFileFromS3).toHaveBeenCalledWith({
        filename: 'ineligible-items'
      })
      expect(getIneligibleItemsCache()).toEqual(mockIneligibleItems)
    })

    it('should retry on failure and succeed on second attempt', async () => {
      getFileFromS3
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(JSON.stringify(mockIneligibleItems))

      await initializeIneligibleItemsCache()

      expect(getFileFromS3).toHaveBeenCalledTimes(2)
      expect(getIneligibleItemsCache()).toEqual(mockIneligibleItems)
    })

    it('should retry configured number of times before failing', async () => {
      const error = new Error('S3 connection failed')
      getFileFromS3.mockRejectedValue(error)

      await expect(initializeIneligibleItemsCache()).rejects.toThrow(
        /Unable to load ineligible items data after 4 attempts/
      )

      // maxRetries = 3, so total attempts = 4 (initial + 3 retries)
      expect(getFileFromS3).toHaveBeenCalledTimes(4)
      expect(getIneligibleItemsCache()).toBeNull()
    })

    it('should wait between retry attempts', async () => {
      // Use real timers and verify multiple attempts were made
      const error = new Error('Temporary failure')
      getFileFromS3.mockRejectedValue(error)

      const startTime = Date.now()

      try {
        await initializeIneligibleItemsCache()
      } catch (e) {
        // Expected to fail
      }

      const elapsed = Date.now() - startTime

      // Should have waited at least for the retry delays
      // With 3 retries and 100ms delay, minimum time is ~300ms
      expect(elapsed).toBeGreaterThanOrEqual(
        mockConfig.retryDelayMs * mockConfig.maxRetries - 50
      ) // Allow 50ms tolerance
      expect(getFileFromS3).toHaveBeenCalledTimes(mockConfig.maxRetries + 1)
    })

    it('should handle JSON parsing errors', async () => {
      getFileFromS3.mockResolvedValue('invalid json {')

      await expect(initializeIneligibleItemsCache()).rejects.toThrow()
      expect(getIneligibleItemsCache()).toBeNull()
    })

    it('should handle empty array from S3', async () => {
      getFileFromS3.mockResolvedValue('[]')

      await initializeIneligibleItemsCache()

      expect(getIneligibleItemsCache()).toEqual([])
    })

    it('should succeed on final retry attempt', async () => {
      getFileFromS3
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'))
        .mockResolvedValueOnce(JSON.stringify(mockIneligibleItems))

      await initializeIneligibleItemsCache()

      expect(getFileFromS3).toHaveBeenCalledTimes(4)
      expect(getIneligibleItemsCache()).toEqual(mockIneligibleItems)
    })
  })

  describe('getIneligibleItemsCache', () => {
    it('should return null when cache is not initialized', () => {
      expect(getIneligibleItemsCache()).toBeNull()
    })

    it('should return cached data after initialization', async () => {
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIneligibleItems))
      await initializeIneligibleItemsCache()

      expect(getIneligibleItemsCache()).toEqual(mockIneligibleItems)
    })
  })

  describe('setIneligibleItemsCache', () => {
    it('should set cache data', () => {
      const testData = [{ test: 'data' }]
      setIneligibleItemsCache(testData)

      expect(getIneligibleItemsCache()).toEqual(testData)
    })

    it('should overwrite existing cache data', async () => {
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIneligibleItems))
      await initializeIneligibleItemsCache()

      const newData = [{ new: 'data' }]
      setIneligibleItemsCache(newData)

      expect(getIneligibleItemsCache()).toEqual(newData)
    })
  })

  describe('clearIneligibleItemsCache', () => {
    it('should clear the cache', async () => {
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIneligibleItems))
      await initializeIneligibleItemsCache()

      expect(getIneligibleItemsCache()).not.toBeNull()

      clearIneligibleItemsCache()

      expect(getIneligibleItemsCache()).toBeNull()
    })

    it('should not throw when cache is already empty', () => {
      expect(() => clearIneligibleItemsCache()).not.toThrow()
      expect(getIneligibleItemsCache()).toBeNull()
    })
  })

  describe('error scenarios', () => {
    it('should include error message in thrown error', async () => {
      const errorMessage = 'S3 bucket not found'
      getFileFromS3.mockRejectedValue(new Error(errorMessage))

      await expect(initializeIneligibleItemsCache()).rejects.toThrow(
        errorMessage
      )
    })

    it('should handle undefined error gracefully', async () => {
      getFileFromS3.mockRejectedValue(undefined)

      await expect(initializeIneligibleItemsCache()).rejects.toThrow()
    })
  })

  describe('configuration', () => {
    it('should use configuration values from config', async () => {
      const customConfig = {
        s3FileName: 'custom-file',
        s3Schema: 'v2.0',
        maxRetries: 5,
        retryDelayMs: 500
      }
      config.get.mockReturnValue(customConfig)
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIneligibleItems))

      await initializeIneligibleItemsCache()

      expect(getFileFromS3).toHaveBeenCalledWith({
        filename: 'custom-file',
        schema: 'v2.0'
      })
    })
  })
})
