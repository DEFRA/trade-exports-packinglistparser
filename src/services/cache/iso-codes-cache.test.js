import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  initializeIsoCodesCache,
  getIsoCodesCache,
  setIsoCodesCache,
  clearIsoCodesCache
} from './iso-codes-cache.js'

// Mock dependencies
vi.mock('../s3-service.js', () => ({
  getFileFromS3: vi.fn(),
  uploadJsonFileToS3: vi.fn()
}))

vi.mock('../mdm-service.js', () => ({
  getIsoCodes: vi.fn()
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
const { getIsoCodes } = await import('../mdm-service.js')
const { config } = await import('../../config.js')

describe('iso-codes-cache', () => {
  const mockConfig = {
    s3FileName: 'iso-codes',
    s3Schema: 'cache',
    maxRetries: 3,
    retryDelayMs: 100
  }

  const mockMdmIntegration = {
    enabled: true
  }

  const mockIsoCodes = ['AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'GB', 'US']

  beforeEach(() => {
    vi.clearAllMocks()
    clearIsoCodesCache()
    config.get.mockImplementation((key) => {
      if (key === 'mdmIntegration') return mockMdmIntegration
      if (key === 'isoCodesCache') return mockConfig
      return {}
    })
  })

  afterEach(() => {
    clearIsoCodesCache()
  })

  describe('initializeIsoCodesCache', () => {
    it('should successfully fetch and cache ISO codes from S3', async () => {
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIsoCodes))

      await initializeIsoCodesCache()

      expect(getFileFromS3).toHaveBeenCalledWith({
        filename: 'iso-codes',
        schema: 'cache'
      })
      expect(getIsoCodesCache()).toEqual(mockIsoCodes)
    })

    it('should handle S3 location without schema', async () => {
      config.get.mockImplementation((key) => {
        if (key === 'mdmIntegration') return mockMdmIntegration
        if (key === 'isoCodesCache') return { ...mockConfig, s3Schema: null }
        return {}
      })
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIsoCodes))

      await initializeIsoCodesCache()

      expect(getFileFromS3).toHaveBeenCalledWith({
        filename: 'iso-codes',
        schema: null
      })
      expect(getIsoCodesCache()).toEqual(mockIsoCodes)
    })

    it('should retry on failure and succeed on second attempt', async () => {
      getFileFromS3
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(JSON.stringify(mockIsoCodes))

      await initializeIsoCodesCache()

      expect(getFileFromS3).toHaveBeenCalledTimes(2)
      expect(getIsoCodesCache()).toEqual(mockIsoCodes)
    })

    it('should retry configured number of times before failing', async () => {
      const error = new Error('S3 connection failed')
      getFileFromS3.mockRejectedValue(error)

      await expect(initializeIsoCodesCache()).rejects.toThrow(
        /Unable to load ISO codes data after 4 S3 attempts and MDM fallback/
      )

      // maxRetries = 3, so total attempts = 4 (initial + 3 retries)
      expect(getFileFromS3).toHaveBeenCalledTimes(4)
      expect(getIsoCodesCache()).toBeNull()
    })

    it('should wait between retry attempts', async () => {
      const error = new Error('Temporary failure')
      getFileFromS3.mockRejectedValue(error)

      const startTime = Date.now()

      try {
        await initializeIsoCodesCache()
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

      await expect(initializeIsoCodesCache()).rejects.toThrow()
      expect(getIsoCodesCache()).toBeNull()
    })

    it('should skip initialization when MDM integration is disabled', async () => {
      config.get.mockImplementation((key) => {
        if (key === 'mdmIntegration') return { enabled: false }
        if (key === 'isoCodesCache') return mockConfig
        return {}
      })

      await initializeIsoCodesCache()

      expect(getFileFromS3).not.toHaveBeenCalled()
      expect(getIsoCodesCache()).toBeNull()
    })

    it('should handle empty array from S3 by attempting MDM fallback', async () => {
      getFileFromS3.mockResolvedValue(JSON.stringify([]))
      getIsoCodes.mockResolvedValue(mockIsoCodes)
      uploadJsonFileToS3.mockResolvedValue({ ETag: 'test-etag' })

      await initializeIsoCodesCache()

      expect(getIsoCodes).toHaveBeenCalled()
      expect(uploadJsonFileToS3).toHaveBeenCalled()
      expect(getIsoCodesCache()).toEqual(mockIsoCodes)
    })

    it('should handle NoSuchKey error by fetching from MDM', async () => {
      const noSuchKeyError = new Error('NoSuchKey')
      noSuchKeyError.name = 'NoSuchKey'
      getFileFromS3.mockRejectedValue(noSuchKeyError)
      getIsoCodes.mockResolvedValue(mockIsoCodes)
      uploadJsonFileToS3.mockResolvedValue({ ETag: 'test-etag' })

      await initializeIsoCodesCache()

      expect(getIsoCodes).toHaveBeenCalled()
      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: 'iso-codes', schema: 'cache' },
        JSON.stringify(mockIsoCodes)
      )
      expect(getIsoCodesCache()).toEqual(mockIsoCodes)
    })

    it('should throw error if both S3 and MDM fail', async () => {
      const s3Error = new Error('S3 error')
      const mdmError = new Error('MDM error')
      getFileFromS3.mockRejectedValue(s3Error)
      getIsoCodes.mockRejectedValue(mdmError)

      await expect(initializeIsoCodesCache()).rejects.toThrow(
        /Unable to load ISO codes data after/
      )
    })
  })

  describe('getIsoCodesCache', () => {
    it('should return null initially', () => {
      expect(getIsoCodesCache()).toBeNull()
    })

    it('should return cached data after initialization', async () => {
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIsoCodes))

      await initializeIsoCodesCache()

      expect(getIsoCodesCache()).toEqual(mockIsoCodes)
    })
  })

  describe('setIsoCodesCache', () => {
    it('should set cache data', () => {
      const testData = ['GB', 'US', 'FR']
      setIsoCodesCache(testData)

      expect(getIsoCodesCache()).toEqual(testData)
    })

    it('should overwrite existing cache data', async () => {
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIsoCodes))
      await initializeIsoCodesCache()

      const newData = ['DE', 'IT', 'ES']
      setIsoCodesCache(newData)

      expect(getIsoCodesCache()).toEqual(newData)
    })
  })

  describe('clearIsoCodesCache', () => {
    it('should clear the cache', async () => {
      getFileFromS3.mockResolvedValue(JSON.stringify(mockIsoCodes))
      await initializeIsoCodesCache()

      expect(getIsoCodesCache()).not.toBeNull()

      clearIsoCodesCache()

      expect(getIsoCodesCache()).toBeNull()
    })

    it('should not throw error when cache is already null', () => {
      expect(() => clearIsoCodesCache()).not.toThrow()
    })
  })

  describe('cacheS3Data - data normalization', () => {
    it('should handle MDM format with effectiveAlpha2 field', async () => {
      const mdmData = [
        { effectiveAlpha2: 'gb', name: 'United Kingdom' },
        { effectiveAlpha2: 'us', name: 'United States' },
        { effectiveAlpha2: 'fr', name: 'France' }
      ]
      getFileFromS3.mockResolvedValue(JSON.stringify(mdmData))

      await initializeIsoCodesCache()

      expect(getIsoCodesCache()).toEqual(['GB', 'US', 'FR'])
    })

    it('should handle MDM format with alpha2 field', async () => {
      const mdmData = [
        { alpha2: 'de', name: 'Germany' },
        { alpha2: 'it', name: 'Italy' },
        { alpha2: 'es', name: 'Spain' }
      ]
      getFileFromS3.mockResolvedValue(JSON.stringify(mdmData))

      await initializeIsoCodesCache()

      expect(getIsoCodesCache()).toEqual(['DE', 'IT', 'ES'])
    })

    it('should handle backward compatible format with code field', async () => {
      const legacyData = [
        { code: 'ca', name: 'Canada' },
        { code: 'mx', name: 'Mexico' },
        { code: 'br', name: 'Brazil' }
      ]
      getFileFromS3.mockResolvedValue(JSON.stringify(legacyData))

      await initializeIsoCodesCache()

      expect(getIsoCodesCache()).toEqual(['CA', 'MX', 'BR'])
    })

    it('should handle Alpha2 field (uppercase A)', async () => {
      const data = [
        { Alpha2: 'au', name: 'Australia' },
        { Alpha2: 'nz', name: 'New Zealand' },
        { Alpha2: 'jp', name: 'Japan' }
      ]
      getFileFromS3.mockResolvedValue(JSON.stringify(data))

      await initializeIsoCodesCache()

      expect(getIsoCodesCache()).toEqual(['AU', 'NZ', 'JP'])
    })

    it('should filter out items with no code fields', async () => {
      const mixedData = [
        { alpha2: 'gb', name: 'United Kingdom' },
        { name: 'Invalid Entry' }, // No code field
        { alpha2: 'us', name: 'United States' },
        { somefield: 'value' } // No code field
      ]
      getFileFromS3.mockResolvedValue(JSON.stringify(mixedData))

      await initializeIsoCodesCache()

      expect(getIsoCodesCache()).toEqual(['GB', 'US'])
    })

    it('should handle already normalized string array', async () => {
      const stringArray = ['GB', 'US', 'FR', 'DE']
      getFileFromS3.mockResolvedValue(JSON.stringify(stringArray))

      await initializeIsoCodesCache()

      expect(getIsoCodesCache()).toEqual(stringArray)
    })

    it('should handle non-array data format', async () => {
      const nonArrayData = { someKey: 'someValue', codes: ['GB', 'US'] }
      getFileFromS3.mockResolvedValue(JSON.stringify(nonArrayData))

      await initializeIsoCodesCache()

      expect(getIsoCodesCache()).toEqual(nonArrayData)
    })

    it('should prioritize effectiveAlpha2 over other fields', async () => {
      const data = [
        {
          effectiveAlpha2: 'gb',
          alpha2: 'uk',
          code: 'en',
          Alpha2: 'br',
          name: 'United Kingdom'
        }
      ]
      getFileFromS3.mockResolvedValue(JSON.stringify(data))

      await initializeIsoCodesCache()

      expect(getIsoCodesCache()).toEqual(['GB'])
    })
  })
})
