import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { syncIsoCodesMdmToS3 } from './iso-codes-mdm-s3-sync.js'

// Mock all dependencies before they're imported
vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }))
}))

vi.mock('../mdm-service.js', () => ({
  getIsoCodes: vi.fn()
}))

vi.mock('../s3-service.js', () => ({
  uploadJsonFileToS3: vi.fn()
}))

vi.mock('./iso-codes-cache.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    setIsoCodesCache: vi.fn()
  }
})

vi.mock('../../config.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'isoCodesCache') {
        return {
          s3FileName: 'iso-codes',
          s3Schema: 'cache'
        }
      }
      if (key === 'mdmIntegration') {
        return {
          enabled: true
        }
      }
      return {}
    })
  }
}))

// Import mocked functions after mocks are set up
const { getIsoCodes } = await import('../mdm-service.js')
const { uploadJsonFileToS3 } = await import('../s3-service.js')
const { setIsoCodesCache } = await import('./iso-codes-cache.js')
const { config } = await import('../../config.js')

describe('iso-codes-mdm-s3-sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset config mock to default state
    config.get.mockImplementation((key) => {
      if (key === 'isoCodesCache') {
        return {
          s3FileName: 'iso-codes',
          s3Schema: 'cache'
        }
      }
      if (key === 'mdmIntegration') {
        return {
          enabled: true
        }
      }
      return {}
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('syncIsoCodesMdmToS3', () => {
    it('should skip sync when MDM integration is disabled', async () => {
      config.get.mockImplementation((key) => {
        if (key === 'mdmIntegration') {
          return { enabled: false }
        }
        if (key === 'isoCodesCache') {
          return {
            s3FileName: 'iso-codes',
            s3Schema: 'cache'
          }
        }
        return {}
      })

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(false)
      expect(result.skipped).toBe(true)
      expect(result.reason).toBe('MDM integration is disabled')
      expect(result.timestamp).toBeDefined()
      expect(result.duration).toBeGreaterThanOrEqual(0)

      // Verify MDM and S3 are not called
      expect(getIsoCodes).not.toHaveBeenCalled()
      expect(uploadJsonFileToS3).not.toHaveBeenCalled()
      expect(setIsoCodesCache).not.toHaveBeenCalled()
    })

    it('should successfully sync ISO codes from MDM to S3', async () => {
      const mockData = [
        { effectiveAlpha2: 'GB', name: 'United Kingdom' },
        { effectiveAlpha2: 'US', name: 'United States' },
        { effectiveAlpha2: 'FR', name: 'France' }
      ]

      // Expected simplified format after transformation
      const expectedSimplifiedData = ['GB', 'US', 'FR']

      const mockS3Response = {
        ETag: '"abc123"'
      }

      getIsoCodes.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(true)
      expect(result.itemCount).toBe(3)
      expect(result.etag).toBe('"abc123"')
      expect(result.s3Location).toEqual({
        filename: 'iso-codes',
        schema: 'cache'
      })
      expect(result.timestamp).toBeDefined()
      expect(result.duration).toBeGreaterThanOrEqual(0)

      expect(getIsoCodes).toHaveBeenCalledTimes(1)
      // Now expecting simplified format to be uploaded to S3
      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: 'iso-codes', schema: 'cache' },
        JSON.stringify(expectedSimplifiedData)
      )
      expect(setIsoCodesCache).toHaveBeenCalledTimes(1)
      // Cache also receives simplified format
      expect(setIsoCodesCache).toHaveBeenCalledWith(expectedSimplifiedData)
    })

    it('should handle empty ISO codes array', async () => {
      const mockData = []
      const expectedSimplifiedData = []

      const mockS3Response = {
        ETag: '"empty123"'
      }

      getIsoCodes.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(true)
      expect(result.itemCount).toBe(0)
      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: 'iso-codes', schema: 'cache' },
        JSON.stringify(expectedSimplifiedData)
      )
      expect(setIsoCodesCache).toHaveBeenCalledWith(expectedSimplifiedData)
    })

    it('should handle large ISO codes dataset', async () => {
      const mockData = Array.from({ length: 250 }, (_, i) => ({
        effectiveAlpha2: `C${i}`,
        name: `Country ${i}`
      }))

      // Expected simplified format: just the codes
      const expectedSimplifiedData = Array.from(
        { length: 250 },
        (_, i) => `C${i}`
      )

      const mockS3Response = {
        ETag: '"large456"'
      }

      getIsoCodes.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(true)
      expect(result.itemCount).toBe(250)
      expect(setIsoCodesCache).toHaveBeenCalledWith(expectedSimplifiedData)
    })

    it('should handle MDM returning null data', async () => {
      getIsoCodes.mockResolvedValue(null)

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(false)
      expect(result.error).toBe('No ISO codes data received from MDM')
      expect(result.errorName).toBe('Error')
      expect(result.timestamp).toBeDefined()
      expect(result.duration).toBeGreaterThanOrEqual(0)
      expect(uploadJsonFileToS3).not.toHaveBeenCalled()
      expect(setIsoCodesCache).not.toHaveBeenCalled()
    })

    it('should handle MDM returning undefined', async () => {
      getIsoCodes.mockResolvedValue(undefined)

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(false)
      expect(result.error).toBe('No ISO codes data received from MDM')
      expect(uploadJsonFileToS3).not.toHaveBeenCalled()
      expect(setIsoCodesCache).not.toHaveBeenCalled()
    })

    it('should handle MDM service failure', async () => {
      const mockError = new Error('MDM service unavailable')
      mockError.name = 'ServiceError'
      getIsoCodes.mockRejectedValue(mockError)

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(false)
      expect(result.error).toBe('MDM service unavailable')
      expect(result.errorName).toBe('ServiceError')
      expect(result.timestamp).toBeDefined()
      expect(result.duration).toBeGreaterThanOrEqual(0)
      expect(uploadJsonFileToS3).not.toHaveBeenCalled()
      expect(setIsoCodesCache).not.toHaveBeenCalled()
    })

    it('should handle MDM network timeout', async () => {
      const mockError = new Error('Request timeout')
      mockError.name = 'NetworkError'
      getIsoCodes.mockRejectedValue(mockError)

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Request timeout')
      expect(result.errorName).toBe('NetworkError')
      expect(uploadJsonFileToS3).not.toHaveBeenCalled()
    })

    it('should handle S3 upload failure', async () => {
      const mockData = [
        { code: 'GB', name: 'United Kingdom' },
        { code: 'US', name: 'United States' }
      ]
      const mockError = new Error('S3 upload failed')
      mockError.name = 'S3Error'

      getIsoCodes.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockRejectedValue(mockError)

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(false)
      expect(result.error).toBe('S3 upload failed')
      expect(result.errorName).toBe('S3Error')
      expect(result.timestamp).toBeDefined()
      expect(result.duration).toBeGreaterThanOrEqual(0)

      // Verify MDM was called but cache was not updated due to S3 failure
      expect(getIsoCodes).toHaveBeenCalledTimes(1)
      expect(setIsoCodesCache).not.toHaveBeenCalled()
    })

    it('should handle S3 permission errors', async () => {
      const mockData = [{ code: 'GB', name: 'United Kingdom' }]
      const mockError = new Error('Access denied')
      mockError.name = 'AccessDenied'

      getIsoCodes.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockRejectedValue(mockError)

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Access denied')
      expect(result.errorName).toBe('AccessDenied')
      expect(setIsoCodesCache).not.toHaveBeenCalled()
    })

    it('should include result metadata for successful sync', async () => {
      const mockData = [
        { code: 'GB', name: 'United Kingdom' },
        { code: 'US', name: 'United States' }
      ]

      const mockS3Response = {
        ETag: '"metadata789"'
      }

      getIsoCodes.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      const startTime = Date.now()
      const result = await syncIsoCodesMdmToS3()
      const endTime = Date.now()

      expect(result.success).toBe(true)
      expect(result.timestamp).toBeDefined()
      expect(new Date(result.timestamp).getTime()).toBeGreaterThanOrEqual(
        startTime
      )
      expect(new Date(result.timestamp).getTime()).toBeLessThanOrEqual(endTime)
      expect(result.duration).toBeGreaterThanOrEqual(0)
      expect(result.s3Location).toEqual({
        filename: 'iso-codes',
        schema: 'cache'
      })
      expect(result.itemCount).toBe(2)
      expect(result.etag).toBe('"metadata789"')
    })

    it('should update cache only after successful S3 upload', async () => {
      const mockData = [{ effectiveAlpha2: 'GB', name: 'United Kingdom' }]
      const expectedSimplifiedData = ['GB']

      const mockS3Response = {
        ETag: '"success123"'
      }

      getIsoCodes.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(true)

      // Verify cache is updated with simplified format after S3 upload
      expect(setIsoCodesCache).toHaveBeenCalledTimes(1)
      expect(setIsoCodesCache).toHaveBeenCalledWith(expectedSimplifiedData)
    })

    it('should handle non-array ISO codes data', async () => {
      const mockData = {
        countries: [{ code: 'GB', name: 'United Kingdom' }],
        version: '2.0'
      }

      const mockS3Response = {
        ETag: '"object123"'
      }

      getIsoCodes.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(true)
      expect(result.itemCount).toBe(0) // Non-array returns 0
      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: 'iso-codes', schema: 'cache' },
        JSON.stringify(mockData)
      )
      expect(setIsoCodesCache).toHaveBeenCalledWith(mockData)
    })

    it('should normalize mixed case codes to uppercase', async () => {
      const mockData = [
        { effectiveAlpha2: 'gb', name: 'United Kingdom' },
        { effectiveAlpha2: 'us', name: 'United States' },
        { effectiveAlpha2: 'Fr', name: 'France' }
      ]
      const expectedSimplifiedData = ['GB', 'US', 'FR']

      const mockS3Response = { ETag: '"normalized123"' }
      getIsoCodes.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(true)
      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: 'iso-codes', schema: 'cache' },
        JSON.stringify(expectedSimplifiedData)
      )
      expect(setIsoCodesCache).toHaveBeenCalledWith(expectedSimplifiedData)
    })

    it('should deduplicate duplicate codes', async () => {
      const mockData = [
        { effectiveAlpha2: 'GB', name: 'United Kingdom' },
        { effectiveAlpha2: 'US', name: 'United States' },
        { effectiveAlpha2: 'gb', name: 'Great Britain' },
        { effectiveAlpha2: 'US', name: 'USA' }
      ]
      const expectedSimplifiedData = ['GB', 'US']

      const mockS3Response = { ETag: '"dedup123"' }
      getIsoCodes.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(true)
      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: 'iso-codes', schema: 'cache' },
        JSON.stringify(expectedSimplifiedData)
      )
    })

    it('should filter out codes with null effectiveAlpha2', async () => {
      const mockData = [
        { effectiveAlpha2: 'GB', name: 'United Kingdom' },
        { effectiveAlpha2: null, name: 'Invalid Country' },
        { effectiveAlpha2: 'US', name: 'United States' },
        { name: 'No Code Country' }
      ]
      const expectedSimplifiedData = ['GB', 'US']

      const mockS3Response = { ETag: '"filtered123"' }
      getIsoCodes.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(true)
      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: 'iso-codes', schema: 'cache' },
        JSON.stringify(expectedSimplifiedData)
      )
      expect(setIsoCodesCache).toHaveBeenCalledWith(expectedSimplifiedData)
    })

    it('should handle array of strings (already simplified)', async () => {
      const mockData = ['GB', 'US', 'FR']
      const expectedSimplifiedData = ['GB', 'US', 'FR']

      const mockS3Response = { ETag: '"strings123"' }
      getIsoCodes.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      const result = await syncIsoCodesMdmToS3()

      expect(result.success).toBe(true)
      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: 'iso-codes', schema: 'cache' },
        JSON.stringify(expectedSimplifiedData)
      )
    })
  })
})
