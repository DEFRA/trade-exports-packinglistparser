import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  isNoSuchKeyError,
  fetchFromS3WithRetry,
  populateFromMDM,
  initializeCache
} from './cache-common.js'

// Mock dependencies
vi.mock('../s3-service.js', () => ({
  getFileFromS3: vi.fn(),
  uploadJsonFileToS3: vi.fn()
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
    warn: vi.fn()
  }))
}))

describe('cache-common', () => {
  let mockGetFileFromS3
  let mockUploadJsonFileToS3
  let mockConfig

  beforeEach(async () => {
    vi.clearAllMocks()

    const s3Module = await import('../s3-service.js')
    mockGetFileFromS3 = s3Module.getFileFromS3
    mockUploadJsonFileToS3 = s3Module.uploadJsonFileToS3

    const configModule = await import('../../config.js')
    mockConfig = configModule.config
  })

  describe('isNoSuchKeyError', () => {
    it('should return true for error with NoSuchKey name', () => {
      const error = { name: 'NoSuchKey', message: 'File not found' }
      expect(isNoSuchKeyError(error)).toBe(true)
    })

    it('should return true for error with NoSuchKey Code', () => {
      const error = { Code: 'NoSuchKey', message: 'File not found' }
      expect(isNoSuchKeyError(error)).toBe(true)
    })

    it('should return false for other errors', () => {
      const error = { name: 'NetworkError', message: 'Network failed' }
      expect(isNoSuchKeyError(error)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isNoSuchKeyError(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isNoSuchKeyError(undefined)).toBe(false)
    })
  })

  describe('fetchFromS3WithRetry', () => {
    const location = { filename: 'test-file', schema: 'test-schema' }
    const maxRetries = 2
    const retryDelayMs = 100

    it('should successfully fetch and cache data from S3', async () => {
      const mockData = [{ id: 1, name: 'Test' }]
      mockGetFileFromS3.mockResolvedValue(JSON.stringify(mockData))

      const isDataEmpty = vi.fn().mockReturnValue(false)
      const cacheS3Data = vi.fn()

      const result = await fetchFromS3WithRetry(
        location,
        maxRetries,
        retryDelayMs,
        isDataEmpty,
        cacheS3Data,
        'test data'
      )

      expect(result.success).toBe(true)
      expect(isDataEmpty).toHaveBeenCalledWith(mockData)
      expect(cacheS3Data).toHaveBeenCalledWith(mockData)
    })

    it('should return error when S3 data is empty', async () => {
      const mockData = []
      mockGetFileFromS3.mockResolvedValue(JSON.stringify(mockData))

      const isDataEmpty = vi.fn().mockReturnValue(true)
      const cacheS3Data = vi.fn()

      const result = await fetchFromS3WithRetry(
        location,
        maxRetries,
        retryDelayMs,
        isDataEmpty,
        cacheS3Data,
        'test data'
      )

      expect(result.success).toBe(false)
      expect(result.error.message).toBe('S3 data is empty')
      expect(cacheS3Data).not.toHaveBeenCalled()
    })

    it('should return error for NoSuchKey without retry', async () => {
      const error = { name: 'NoSuchKey', message: 'File not found' }
      mockGetFileFromS3.mockRejectedValue(error)

      const isDataEmpty = vi.fn()
      const cacheS3Data = vi.fn()

      const result = await fetchFromS3WithRetry(
        location,
        maxRetries,
        retryDelayMs,
        isDataEmpty,
        cacheS3Data,
        'test data'
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe(error)
      expect(mockGetFileFromS3).toHaveBeenCalledTimes(1)
    })

    it('should retry on non-NoSuchKey errors', async () => {
      const error = new Error('Network error')
      mockGetFileFromS3
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)

      const isDataEmpty = vi.fn()
      const cacheS3Data = vi.fn()

      const result = await fetchFromS3WithRetry(
        location,
        maxRetries,
        retryDelayMs,
        isDataEmpty,
        cacheS3Data,
        'test data'
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe(error)
      expect(mockGetFileFromS3).toHaveBeenCalledTimes(maxRetries + 1)
    })

    it('should succeed on retry', async () => {
      const mockData = [{ id: 1, name: 'Test' }]
      const error = new Error('Temporary error')
      mockGetFileFromS3
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(JSON.stringify(mockData))

      const isDataEmpty = vi.fn().mockReturnValue(false)
      const cacheS3Data = vi.fn()

      const result = await fetchFromS3WithRetry(
        location,
        maxRetries,
        retryDelayMs,
        isDataEmpty,
        cacheS3Data,
        'test data'
      )

      expect(result.success).toBe(true)
      expect(cacheS3Data).toHaveBeenCalledWith(mockData)
      expect(mockGetFileFromS3).toHaveBeenCalledTimes(2)
    })
  })

  describe('populateFromMDM', () => {
    const location = { filename: 'test-file', schema: 'test-schema' }
    const s3Error = new Error('S3 failed')

    it('should fetch from MDM and upload to S3', async () => {
      const mockData = [{ id: 1, name: 'Test' }]
      const getMdmData = vi.fn().mockResolvedValue(mockData)
      const cacheS3Data = vi.fn()

      mockUploadJsonFileToS3.mockResolvedValue({ ETag: '"123"' })

      await populateFromMDM(
        location,
        s3Error,
        getMdmData,
        cacheS3Data,
        'test data'
      )

      expect(getMdmData).toHaveBeenCalledTimes(1)
      expect(mockUploadJsonFileToS3).toHaveBeenCalledWith(
        location,
        JSON.stringify(mockData)
      )
      expect(cacheS3Data).toHaveBeenCalledWith(mockData)
    })

    it('should not upload when MDM returns null', async () => {
      const getMdmData = vi.fn().mockResolvedValue(null)
      const cacheS3Data = vi.fn()

      await populateFromMDM(
        location,
        s3Error,
        getMdmData,
        cacheS3Data,
        'test data'
      )

      expect(getMdmData).toHaveBeenCalledTimes(1)
      expect(mockUploadJsonFileToS3).not.toHaveBeenCalled()
      expect(cacheS3Data).not.toHaveBeenCalled()
    })

    it('should throw error when MDM fails', async () => {
      const mdmError = new Error('MDM service unavailable')
      const getMdmData = vi.fn().mockRejectedValue(mdmError)
      const cacheS3Data = vi.fn()

      await expect(
        populateFromMDM(location, s3Error, getMdmData, cacheS3Data, 'test data')
      ).rejects.toThrow(
        'Unable to load test data from S3 or MDM: S3 error: S3 failed, MDM error: MDM service unavailable'
      )

      expect(mockUploadJsonFileToS3).not.toHaveBeenCalled()
      expect(cacheS3Data).not.toHaveBeenCalled()
    })

    it('should throw error when S3 upload fails', async () => {
      const mockData = [{ id: 1, name: 'Test' }]
      const getMdmData = vi.fn().mockResolvedValue(mockData)
      const cacheS3Data = vi.fn()
      const uploadError = new Error('S3 upload failed')

      mockUploadJsonFileToS3.mockRejectedValue(uploadError)

      await expect(
        populateFromMDM(location, s3Error, getMdmData, cacheS3Data, 'test data')
      ).rejects.toThrow(
        'Unable to load test data from S3 or MDM: S3 error: S3 failed, MDM error: S3 upload failed'
      )

      expect(cacheS3Data).not.toHaveBeenCalled()
    })
  })

  describe('initializeCache', () => {
    const configKey = 'testCache'
    const isDataEmpty = vi.fn().mockReturnValue(false)
    const cacheS3Data = vi.fn()
    const getMdmData = vi.fn()
    const cacheType = 'test data'

    beforeEach(() => {
      mockConfig.get.mockImplementation((key) => {
        if (key === 'mdmIntegration') {
          return { enabled: true }
        }
        if (key === configKey) {
          return {
            s3FileName: 'test-file',
            s3Schema: 'test-schema',
            maxRetries: 2,
            retryDelayMs: 100
          }
        }
        return {}
      })
    })

    it('should skip initialization when MDM is disabled', async () => {
      mockConfig.get.mockImplementation((key) => {
        if (key === 'mdmIntegration') {
          return { enabled: false }
        }
        return {}
      })

      await initializeCache(
        configKey,
        isDataEmpty,
        cacheS3Data,
        getMdmData,
        cacheType
      )

      expect(mockGetFileFromS3).not.toHaveBeenCalled()
      expect(getMdmData).not.toHaveBeenCalled()
    })

    it('should successfully initialize from S3', async () => {
      const mockData = [{ id: 1, name: 'Test' }]
      mockGetFileFromS3.mockResolvedValue(JSON.stringify(mockData))

      await initializeCache(
        configKey,
        isDataEmpty,
        cacheS3Data,
        getMdmData,
        cacheType
      )

      expect(cacheS3Data).toHaveBeenCalledWith(mockData)
      expect(getMdmData).not.toHaveBeenCalled()
    })

    it('should fallback to MDM when S3 file does not exist', async () => {
      const mockData = [{ id: 1, name: 'Test' }]
      const s3Error = { name: 'NoSuchKey', message: 'File not found' }
      mockGetFileFromS3.mockRejectedValue(s3Error)
      getMdmData.mockResolvedValue(mockData)
      mockUploadJsonFileToS3.mockResolvedValue({ ETag: '"123"' })

      await initializeCache(
        configKey,
        isDataEmpty,
        cacheS3Data,
        getMdmData,
        cacheType
      )

      expect(getMdmData).toHaveBeenCalledTimes(1)
      expect(mockUploadJsonFileToS3).toHaveBeenCalled()
      expect(cacheS3Data).toHaveBeenCalledWith(mockData)
    })

    it('should fallback to MDM when S3 data is empty', async () => {
      const mockData = [{ id: 1, name: 'Test' }]
      mockGetFileFromS3.mockResolvedValue(JSON.stringify([]))
      isDataEmpty.mockReturnValue(true)
      getMdmData.mockResolvedValue(mockData)
      mockUploadJsonFileToS3.mockResolvedValue({ ETag: '"123"' })

      await initializeCache(
        configKey,
        isDataEmpty,
        cacheS3Data,
        getMdmData,
        cacheType
      )

      expect(getMdmData).toHaveBeenCalledTimes(1)
      expect(mockUploadJsonFileToS3).toHaveBeenCalled()
    })

    it('should throw error when both S3 and MDM fail', async () => {
      const error = new Error('Network error')
      mockGetFileFromS3
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)

      await expect(
        initializeCache(
          configKey,
          isDataEmpty,
          cacheS3Data,
          getMdmData,
          cacheType
        )
      ).rejects.toThrow('Unable to load test data data after 3 attempts')

      expect(mockGetFileFromS3).toHaveBeenCalledTimes(3)
    })
  })
})
