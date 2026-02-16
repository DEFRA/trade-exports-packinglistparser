import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  initializeIneligibleItemsCache,
  getIneligibleItemsCache,
  setIneligibleItemsCache,
  clearIneligibleItemsCache,
  deduplicateIneligibleItems
} from './ineligible-items-cache.js'

// Mock dependencies
vi.mock('../s3-service.js', () => ({
  getFileFromS3: vi.fn(),
  uploadJsonFileToS3: vi.fn()
}))

vi.mock('../mdm-service.js', () => ({
  getIneligibleItems: vi.fn()
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
const { getFileFromS3, uploadJsonFileToS3 } = await import('../s3-service.js')
const { getIneligibleItems } = await import('../mdm-service.js')
const { config } = await import('../../config.js')

describe('ineligible-items-cache', () => {
  const mockConfig = {
    s3FileName: 'ineligible-items',
    s3Schema: 'v1.0',
    maxRetries: 3,
    retryDelayMs: 100
  }

  const mockMdmIntegration = {
    enabled: true
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
    config.get.mockImplementation((key) => {
      if (key === 'mdmIntegration') return mockMdmIntegration
      if (key === 'ineligibleItemsCache') return mockConfig
      return {}
    })
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
      config.get.mockImplementation((key) => {
        if (key === 'mdmIntegration') {
          return mockMdmIntegration
        }
        if (key === 'ineligibleItemsCache') {
          return { ...mockConfig, s3Schema: null }
        }
        return {}
      })
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIneligibleItems))

      await initializeIneligibleItemsCache()

      expect(getFileFromS3).toHaveBeenCalledWith({
        filename: 'ineligible-items',
        schema: null
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
        /Unable to load ineligible items data after 4 S3 attempts and MDM fallback/
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

    it('should handle data with ineligibleItems array property', async () => {
      const dataWithProperty = {
        ineligibleItems: mockIneligibleItems,
        version: '1.0',
        lastUpdated: '2026-01-27'
      }
      getFileFromS3.mockResolvedValue(JSON.stringify(dataWithProperty))

      await initializeIneligibleItemsCache()

      expect(getIneligibleItemsCache()).toEqual(dataWithProperty)
    })

    it('should handle object without ineligibleItems or array structure', async () => {
      const objectData = {
        someKey: 'someValue',
        anotherKey: 123
      }
      getFileFromS3.mockResolvedValue(JSON.stringify(objectData))

      await initializeIneligibleItemsCache()

      expect(getIneligibleItemsCache()).toEqual(objectData)
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

    it('should skip initialization when MDM integration is disabled', async () => {
      config.get.mockImplementation((key) => {
        if (key === 'mdmIntegration') return { enabled: false }
        if (key === 'ineligibleItemsCache') return mockConfig
        return {}
      })

      await initializeIneligibleItemsCache()

      expect(getFileFromS3).not.toHaveBeenCalled()
      expect(getIneligibleItemsCache()).toBeNull()
    })

    it('should populate from MDM when S3 file does not exist (NoSuchKey)', async () => {
      const noSuchKeyError = new Error('The specified key does not exist')
      noSuchKeyError.name = 'NoSuchKey'

      getFileFromS3.mockRejectedValueOnce(noSuchKeyError)
      getIneligibleItems.mockResolvedValueOnce(mockIneligibleItems)
      uploadJsonFileToS3.mockResolvedValueOnce({ ETag: '"abc123"' })

      await initializeIneligibleItemsCache()

      expect(getFileFromS3).toHaveBeenCalledTimes(1)
      expect(getIneligibleItems).toHaveBeenCalledTimes(1)
      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: 'ineligible-items', schema: 'v1.0' },
        JSON.stringify(mockIneligibleItems)
      )
      expect(getIneligibleItemsCache()).toEqual(mockIneligibleItems)
    })

    it('should populate from MDM when S3 returns empty array', async () => {
      getFileFromS3.mockResolvedValueOnce('[]')
      getIneligibleItems.mockResolvedValueOnce(mockIneligibleItems)
      uploadJsonFileToS3.mockResolvedValueOnce({ ETag: '"abc123"' })

      await initializeIneligibleItemsCache()

      expect(getIneligibleItems).toHaveBeenCalledTimes(1)
      expect(uploadJsonFileToS3).toHaveBeenCalledTimes(1)
      expect(getIneligibleItemsCache()).toEqual(mockIneligibleItems)
    })

    it('should populate from MDM when S3 returns empty ineligibleItems', async () => {
      const emptyData = { ineligibleItems: [] }
      getFileFromS3.mockResolvedValueOnce(JSON.stringify(emptyData))
      getIneligibleItems.mockResolvedValueOnce(mockIneligibleItems)
      uploadJsonFileToS3.mockResolvedValueOnce({ ETag: '"abc123"' })

      await initializeIneligibleItemsCache()

      expect(getIneligibleItems).toHaveBeenCalledTimes(1)
      expect(uploadJsonFileToS3).toHaveBeenCalledTimes(1)
      expect(getIneligibleItemsCache()).toEqual(mockIneligibleItems)
    })

    it('should throw error when both S3 and MDM fail (NoSuchKey scenario)', async () => {
      const s3Error = new Error('The specified key does not exist')
      s3Error.name = 'NoSuchKey'
      const mdmError = new Error('MDM connection failed')

      getFileFromS3.mockRejectedValueOnce(s3Error)
      getIneligibleItems.mockRejectedValueOnce(mdmError)

      await expect(initializeIneligibleItemsCache()).rejects.toThrow(
        'Unable to load ineligible items from S3 or MDM: S3 error: The specified key does not exist, MDM error: MDM connection failed'
      )

      expect(getFileFromS3).toHaveBeenCalledTimes(1)
      expect(getIneligibleItems).toHaveBeenCalledTimes(1)
      expect(uploadJsonFileToS3).not.toHaveBeenCalled()
      expect(getIneligibleItemsCache()).toBeNull()
    })

    it('should throw error when both S3 returns empty data and MDM fails', async () => {
      const mdmError = new Error('MDM service unavailable')

      getFileFromS3.mockResolvedValueOnce('[]')
      getIneligibleItems.mockRejectedValueOnce(mdmError)

      await expect(initializeIneligibleItemsCache()).rejects.toThrow(
        'Unable to load ineligible items from S3 or MDM: S3 error: S3 data is empty, MDM error: MDM service unavailable'
      )

      expect(getFileFromS3).toHaveBeenCalledTimes(1)
      expect(getIneligibleItems).toHaveBeenCalledTimes(1)
      expect(uploadJsonFileToS3).not.toHaveBeenCalled()
      expect(getIneligibleItemsCache()).toBeNull()
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
      config.get.mockImplementation((key) => {
        if (key === 'mdmIntegration') return mockMdmIntegration
        if (key === 'ineligibleItemsCache') return customConfig
        return {}
      })
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIneligibleItems))

      await initializeIneligibleItemsCache()

      expect(getFileFromS3).toHaveBeenCalledWith({
        filename: 'custom-file',
        schema: 'v2.0'
      })
    })
  })

  describe('deduplicateIneligibleItems', () => {
    it('should return non-array input unchanged', () => {
      const input = { some: 'object' }
      expect(deduplicateIneligibleItems(input)).toEqual(input)
    })

    it('should return empty array unchanged', () => {
      expect(deduplicateIneligibleItems([])).toEqual([])
    })

    it('should deduplicate items with same identifying fields', () => {
      const items = [
        {
          country_of_origin: 'CN',
          commodity_code: '0207',
          type_of_treatment: 'Frozen'
        },
        {
          country_of_origin: 'CN',
          commodity_code: '0207',
          type_of_treatment: 'Frozen'
        }
      ]
      const result = deduplicateIneligibleItems(items)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(items[1]) // Should keep the last one
    })

    it('should deduplicate based on country, commodity, and treatment combination', () => {
      const items = [
        {
          country_of_origin: 'CN',
          commodity_code: '0207',
          type_of_treatment: 'Frozen',
          extra: 'field1'
        },
        {
          country_of_origin: 'CN',
          commodity_code: '0207',
          type_of_treatment: 'Frozen',
          extra: 'field2'
        },
        {
          country_of_origin: 'BR',
          commodity_code: '0207',
          type_of_treatment: 'Frozen'
        }
      ]
      const result = deduplicateIneligibleItems(items)
      expect(result).toHaveLength(2)
      expect(result[0].extra).toBe('field2') // Should keep last CN item
      expect(result[1].country_of_origin).toBe('BR')
    })

    it('should handle null/undefined identifying fields', () => {
      const items = [
        {
          country_of_origin: 'CN',
          commodity_code: null,
          type_of_treatment: undefined
        },
        {
          country_of_origin: 'CN',
          commodity_code: '',
          type_of_treatment: null
        }
      ]
      const result = deduplicateIneligibleItems(items)
      expect(result).toHaveLength(1) // Both have same key: CN||
    })

    it('should use JSON.stringify fallback when all identifying fields are empty', () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ]
      const result = deduplicateIneligibleItems(items)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ id: 1, name: 'Item 1' })
      expect(result[1]).toEqual({ id: 2, name: 'Item 2' })
    })

    it('should preserve insertion order', () => {
      const items = [
        {
          country_of_origin: 'US',
          commodity_code: '0101',
          type_of_treatment: null
        },
        {
          country_of_origin: 'CN',
          commodity_code: '0207',
          type_of_treatment: 'Frozen'
        },
        {
          country_of_origin: 'BR',
          commodity_code: '0602',
          type_of_treatment: 'Chilled'
        }
      ]
      const result = deduplicateIneligibleItems(items)
      expect(result).toHaveLength(3)
      expect(result[0].country_of_origin).toBe('US')
      expect(result[1].country_of_origin).toBe('CN')
      expect(result[2].country_of_origin).toBe('BR')
    })

    it('should keep last occurrence when duplicates exist', () => {
      const items = [
        {
          country_of_origin: 'CN',
          commodity_code: '0207',
          type_of_treatment: 'Frozen',
          version: 'v1'
        },
        {
          country_of_origin: 'US',
          commodity_code: '0101',
          type_of_treatment: null,
          version: 'v1'
        },
        {
          country_of_origin: 'CN',
          commodity_code: '0207',
          type_of_treatment: 'Frozen',
          version: 'v2'
        }
      ]
      const result = deduplicateIneligibleItems(items)
      expect(result).toHaveLength(2)
      expect(result[0].country_of_origin).toBe('CN')
      expect(result[0].version).toBe('v2') // Should have latest CN version
      expect(result[1].country_of_origin).toBe('US')
    })
  })
})
