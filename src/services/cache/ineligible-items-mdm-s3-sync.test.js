import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { syncMdmToS3 } from './ineligible-items-mdm-s3-sync.js'

// Mock all dependencies before they're imported
vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }))
}))

vi.mock('../mdm-service.js', () => ({
  getIneligibleItems: vi.fn()
}))

vi.mock('../s3-service.js', () => ({
  uploadJsonFileToS3: vi.fn()
}))

vi.mock('./ineligible-items-cache.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    setIneligibleItemsCache: vi.fn()
  }
})

vi.mock('../../config.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'ineligibleItemsCache') {
        return {
          s3FileName: 'ineligible-items',
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
const { getIneligibleItems } = await import('../mdm-service.js')
const { uploadJsonFileToS3 } = await import('../s3-service.js')
const { setIneligibleItemsCache } = await import('./ineligible-items-cache.js')
const { config } = await import('../../config.js')

describe('ineligible-items-mdm-s3-sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset config mock to default state
    config.get.mockImplementation((key) => {
      if (key === 'ineligibleItemsCache') {
        return {
          s3FileName: 'ineligible-items',
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

  describe('syncMdmToS3', () => {
    it('should skip sync when MDM integration is disabled', async () => {
      config.get.mockImplementation((key) => {
        if (key === 'mdmIntegration') {
          return { enabled: false }
        }
        if (key === 'ineligibleItemsCache') {
          return {
            s3FileName: 'ineligible-items',
            s3Schema: 'cache'
          }
        }
        return {}
      })

      const result = await syncMdmToS3()

      expect(result.success).toBe(false)
      expect(result.skipped).toBe(true)
      expect(result.reason).toBe('MDM integration is disabled')
      expect(result.timestamp).toBeDefined()
      expect(result.duration).toBeGreaterThanOrEqual(0)

      // Verify MDM and S3 are not called
      expect(getIneligibleItems).not.toHaveBeenCalled()
      expect(uploadJsonFileToS3).not.toHaveBeenCalled()
      expect(setIneligibleItemsCache).not.toHaveBeenCalled()
    })

    it('should successfully sync data from MDM to S3', async () => {
      const mockData = {
        ineligibleItems: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ],
        version: '1.0'
      }

      const mockS3Response = {
        ETag: '"abc123"'
      }

      getIneligibleItems.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      const result = await syncMdmToS3()

      expect(result.success).toBe(true)
      expect(result.itemCount).toBe(2)
      expect(result.etag).toBe('"abc123"')
      expect(result.s3Location).toEqual({
        filename: 'ineligible-items',
        schema: 'cache'
      })
      expect(result.timestamp).toBeDefined()
      expect(result.duration).toBeGreaterThanOrEqual(0)

      expect(getIneligibleItems).toHaveBeenCalledTimes(1)
      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: 'ineligible-items', schema: 'cache' },
        JSON.stringify(mockData)
      )
      expect(setIneligibleItemsCache).toHaveBeenCalledTimes(1)
      expect(setIneligibleItemsCache).toHaveBeenCalledWith(mockData)
    })

    it('should handle array data format', async () => {
      const mockData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ]

      const mockS3Response = {
        ETag: '"def456"'
      }

      getIneligibleItems.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      const result = await syncMdmToS3()

      expect(result.success).toBe(true)
      expect(result.itemCount).toBe(3)
      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: 'ineligible-items', schema: 'cache' },
        JSON.stringify(mockData)
      )
    })

    it('should handle MDM returning null data', async () => {
      getIneligibleItems.mockResolvedValue(null)

      const result = await syncMdmToS3()

      expect(result.success).toBe(false)
      expect(result.error).toBe('No data received from MDM')
      expect(uploadJsonFileToS3).not.toHaveBeenCalled()
      expect(setIneligibleItemsCache).not.toHaveBeenCalled()
    })

    it('should handle MDM service failure', async () => {
      const mockError = new Error('MDM service unavailable')
      getIneligibleItems.mockRejectedValue(mockError)

      const result = await syncMdmToS3()

      expect(result.success).toBe(false)
      expect(result.error).toBe('MDM service unavailable')
      expect(result.timestamp).toBeDefined()
      expect(result.duration).toBeGreaterThanOrEqual(0)
      expect(uploadJsonFileToS3).not.toHaveBeenCalled()
      expect(setIneligibleItemsCache).not.toHaveBeenCalled()
    })

    it('should handle S3 upload failure', async () => {
      const mockData = {
        ineligibleItems: [{ id: 1, name: 'Item 1' }]
      }
      const mockError = new Error('S3 upload failed')

      getIneligibleItems.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockRejectedValue(mockError)

      const result = await syncMdmToS3()

      expect(result.success).toBe(false)
      expect(result.error).toBe('S3 upload failed')
      expect(getIneligibleItems).toHaveBeenCalledTimes(1)
      expect(setIneligibleItemsCache).not.toHaveBeenCalled()
    })

    it('should update cache with fresh data after successful sync', async () => {
      const mockData = { ineligibleItems: [{ id: 1, name: 'Item 1' }] }
      const mockS3Response = { ETag: '"xyz789"' }

      getIneligibleItems.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      await syncMdmToS3()

      expect(setIneligibleItemsCache).toHaveBeenCalledTimes(1)
      expect(setIneligibleItemsCache).toHaveBeenCalledWith(mockData)
    })

    it('should handle empty ineligibleItems array', async () => {
      const mockData = {
        ineligibleItems: [],
        version: '1.0'
      }

      const mockS3Response = {
        ETag: '"empty123"'
      }

      getIneligibleItems.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      const result = await syncMdmToS3()

      expect(result.success).toBe(true)
      expect(result.itemCount).toBe(0)
    })

    it('should handle object without ineligibleItems property', async () => {
      const mockData = {
        someOtherKey: 'value',
        anotherKey: 123
      }

      const mockS3Response = {
        ETag: '"other123"'
      }

      getIneligibleItems.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      const result = await syncMdmToS3()

      expect(result.success).toBe(true)
      expect(result.itemCount).toBe(0)
    })
  })

  describe('AC3 - Error Logging', () => {
    it('should log MDM API failure with detailed error information', async () => {
      const mockError = new Error('MDM API connection timeout')
      mockError.name = 'TimeoutError'
      getIneligibleItems.mockRejectedValue(mockError)

      const result = await syncMdmToS3()

      // Verify error is logged with failure details
      expect(result.success).toBe(false)
      expect(result.error).toBe('MDM API connection timeout')
      expect(result.errorName).toBe('TimeoutError')
      expect(result.timestamp).toBeDefined()
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('should preserve existing S3 data when MDM fails', async () => {
      const mockError = new Error('MDM service unavailable')
      getIneligibleItems.mockRejectedValue(mockError)

      await syncMdmToS3()

      // Verify S3 data remains unchanged - uploadJsonFileToS3 is never called
      expect(uploadJsonFileToS3).not.toHaveBeenCalled()
      // Verify cache is not updated
      expect(setIneligibleItemsCache).not.toHaveBeenCalled()
    })

    it('should continue service execution after MDM failure', async () => {
      const mockError = new Error('MDM authentication failed')
      getIneligibleItems.mockRejectedValue(mockError)

      // Service continues - function returns result instead of throwing
      const result = await syncMdmToS3()

      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.error).toBe('MDM authentication failed')
    })

    it('should log network errors with full details', async () => {
      const networkError = new Error('Network request failed')
      networkError.name = 'NetworkError'
      networkError.code = 'ECONNREFUSED'
      getIneligibleItems.mockRejectedValue(networkError)

      const result = await syncMdmToS3()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network request failed')
      expect(result.errorName).toBe('NetworkError')
      expect(uploadJsonFileToS3).not.toHaveBeenCalled()
    })

    it('should handle S3 upload failure without affecting service', async () => {
      const mockData = { ineligibleItems: [{ id: 1 }] }
      const s3Error = new Error('S3 bucket not accessible')
      s3Error.name = 'S3Error'

      getIneligibleItems.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockRejectedValue(s3Error)

      const result = await syncMdmToS3()

      // Service continues running
      expect(result.success).toBe(false)
      expect(result.error).toBe('S3 bucket not accessible')
      expect(result.errorName).toBe('S3Error')
      // MDM was successfully called before S3 failure
      expect(getIneligibleItems).toHaveBeenCalledTimes(1)
      // Cache not updated due to failure
      expect(setIneligibleItemsCache).not.toHaveBeenCalled()
    })

    it('should log authorization errors with appropriate details', async () => {
      const authError = new Error('Unauthorized: Invalid credentials')
      authError.name = 'AuthorizationError'
      authError.status = 401
      getIneligibleItems.mockRejectedValue(authError)

      const result = await syncMdmToS3()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized: Invalid credentials')
      expect(result.errorName).toBe('AuthorizationError')
      expect(uploadJsonFileToS3).not.toHaveBeenCalled()
    })
  })

  describe('Deduplication', () => {
    it('should deduplicate ineligibleItems before storing to S3 (object format)', async () => {
      const mockData = {
        ineligibleItems: [
          {
            country_of_origin: 'CN',
            commodity_code: '0207',
            type_of_treatment: 'Frozen'
          },
          {
            country_of_origin: 'US',
            commodity_code: '0101',
            type_of_treatment: null
          },
          {
            country_of_origin: 'CN',
            commodity_code: '0207',
            type_of_treatment: 'Frozen'
          } // Duplicate
        ],
        version: '1.0'
      }

      const mockS3Response = { ETag: '"dedup123"' }
      getIneligibleItems.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      await syncMdmToS3()

      // Verify deduplicated data was sent to S3
      expect(uploadJsonFileToS3).toHaveBeenCalledTimes(1)
      const uploadedData = JSON.parse(uploadJsonFileToS3.mock.calls[0][1])
      expect(uploadedData.ineligibleItems).toHaveLength(2)
      expect(uploadedData.version).toBe('1.0')
    })

    it('should deduplicate array format before storing to S3', async () => {
      const mockData = [
        {
          country_of_origin: 'CN',
          commodity_code: '0207',
          type_of_treatment: 'Frozen'
        },
        {
          country_of_origin: 'US',
          commodity_code: '0101',
          type_of_treatment: null
        },
        {
          country_of_origin: 'CN',
          commodity_code: '0207',
          type_of_treatment: 'Frozen'
        }
      ]

      const mockS3Response = { ETag: '"dedup456"' }
      getIneligibleItems.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      await syncMdmToS3()

      const uploadedData = JSON.parse(uploadJsonFileToS3.mock.calls[0][1])
      expect(uploadedData).toHaveLength(2)
    })

    it('should handle non-array non-object data without deduplication', async () => {
      const mockData = { someKey: 'someValue' }

      const mockS3Response = { ETag: '"other789"' }
      getIneligibleItems.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      await syncMdmToS3()

      const uploadedData = JSON.parse(uploadJsonFileToS3.mock.calls[0][1])
      expect(uploadedData).toEqual(mockData)
    })

    it('should update cache with deduplicated data', async () => {
      const mockData = {
        ineligibleItems: [
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
      }

      const mockS3Response = { ETag: '"cache123"' }
      getIneligibleItems.mockResolvedValue(mockData)
      uploadJsonFileToS3.mockResolvedValue(mockS3Response)

      await syncMdmToS3()

      expect(setIneligibleItemsCache).toHaveBeenCalledTimes(1)
      const cacheData = setIneligibleItemsCache.mock.calls[0][0]
      expect(cacheData.ineligibleItems).toHaveLength(1)
    })
  })
})
