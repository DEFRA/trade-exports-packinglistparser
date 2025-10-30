import { describe, it, expect, beforeEach, vi } from 'vitest'

// Import after mocking
import { getListFromS3, getFromS3, addFileToS3 } from './s3.js'
import {
  listS3Buckets,
  listS3Objects,
  uploadJsonFileToS3,
  getFileFromS3
} from '../services/s3-service.js'

// Mock the S3 service
vi.mock('../../src/services/s3-service.js', () => ({
  listS3Buckets: vi.fn(),
  listS3Objects: vi.fn(),
  uploadJsonFileToS3: vi.fn(),
  getFileFromS3: vi.fn()
}))

describe('S3 Routes', () => {
  let mockRequest
  let mockH
  let mockResponse

  beforeEach(() => {
    mockResponse = {
      code: vi.fn().mockReturnThis()
    }

    mockH = {
      response: vi.fn().mockReturnValue(mockResponse)
    }

    mockRequest = {
      params: {},
      payload: {}
    }

    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  describe('getListFromS3', () => {
    it('should have correct route configuration', () => {
      expect(getListFromS3.method).toBe('GET')
      expect(getListFromS3.path).toBe('/s3')
      expect(typeof getListFromS3.handler).toBe('function')
    })

    it('should successfully list buckets and objects', async () => {
      const mockBucketsResponse = {
        Buckets: [{ Name: 'bucket1' }, { Name: 'bucket2' }]
      }

      const mockObjectsResponse1 = {
        Contents: [
          { Key: 'file1.txt', Size: 100 },
          { Key: 'file2.txt', Size: 200 }
        ]
      }

      const mockObjectsResponse2 = {
        Contents: [{ Key: 'file3.txt', Size: 300 }]
      }

      listS3Buckets.mockResolvedValue(mockBucketsResponse)
      listS3Objects
        .mockResolvedValueOnce(mockObjectsResponse1)
        .mockResolvedValueOnce(mockObjectsResponse2)

      await getListFromS3.handler(mockRequest, mockH)

      expect(listS3Buckets).toHaveBeenCalledTimes(1)
      expect(listS3Objects).toHaveBeenCalledTimes(2)
      expect(listS3Objects).toHaveBeenNthCalledWith(1, 'bucket1')
      expect(listS3Objects).toHaveBeenNthCalledWith(2, 'bucket2')

      expect(mockH.response).toHaveBeenCalledWith({
        buckets: mockBucketsResponse,
        objects: [
          { bucket: 'bucket1', objects: mockObjectsResponse1.Contents },
          { bucket: 'bucket2', objects: mockObjectsResponse2.Contents }
        ]
      })
      expect(mockResponse.code).toHaveBeenCalledWith(200)
    })

    it('should handle errors when listing buckets fails', async () => {
      const mockError = new Error('S3 service error')
      listS3Buckets.mockRejectedValue(mockError)

      await getListFromS3.handler(mockRequest, mockH)

      expect(listS3Buckets).toHaveBeenCalledTimes(1)
      expect(listS3Objects).not.toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith(
        'Error listing S3 buckets:',
        mockError
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to list S3 buckets'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(500)
    })

    it('should handle errors when listing objects fails', async () => {
      const mockBucketsResponse = {
        Buckets: [{ Name: 'bucket1' }]
      }
      const mockError = new Error('Failed to list objects')

      listS3Buckets.mockResolvedValue(mockBucketsResponse)
      listS3Objects.mockRejectedValue(mockError)

      await getListFromS3.handler(mockRequest, mockH)

      expect(listS3Buckets).toHaveBeenCalledTimes(1)
      expect(listS3Objects).toHaveBeenCalledWith('bucket1')
      expect(console.error).toHaveBeenCalledWith(
        'Error listing S3 buckets:',
        mockError
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to list S3 buckets'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(500)
    })

    it('should handle empty buckets list', async () => {
      const mockBucketsResponse = { Buckets: [] }
      listS3Buckets.mockResolvedValue(mockBucketsResponse)

      await getListFromS3.handler(mockRequest, mockH)

      expect(listS3Buckets).toHaveBeenCalledTimes(1)
      expect(listS3Objects).not.toHaveBeenCalled()
      expect(mockH.response).toHaveBeenCalledWith({
        buckets: mockBucketsResponse,
        objects: []
      })
      expect(mockResponse.code).toHaveBeenCalledWith(200)
    })
  })

  describe('getFromS3', () => {
    it('should have correct route configuration', () => {
      expect(getFromS3.method).toBe('GET')
      expect(getFromS3.path).toBe('/s3/{key}')
      expect(typeof getFromS3.handler).toBe('function')
    })

    it('should successfully get file from S3', async () => {
      const mockFileData = '{"test": "data"}'
      const testKey = 'test-file.json'

      mockRequest.params.key = testKey
      getFileFromS3.mockResolvedValue(mockFileData)

      await getFromS3.handler(mockRequest, mockH)

      expect(getFileFromS3).toHaveBeenCalledWith(testKey)
      expect(mockH.response).toHaveBeenCalledWith(mockFileData)
      expect(mockResponse.code).toHaveBeenCalledWith(200)
    })

    it('should handle errors when getting file fails', async () => {
      const mockError = new Error('File not found')
      const testKey = 'nonexistent-file.json'

      mockRequest.params.key = testKey
      getFileFromS3.mockRejectedValue(mockError)

      await getFromS3.handler(mockRequest, mockH)

      expect(getFileFromS3).toHaveBeenCalledWith(testKey)
      expect(console.error).toHaveBeenCalledWith(
        'Error getting file from S3:',
        mockError
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to get file from S3'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(500)
    })

    it('should handle special characters in key', async () => {
      const mockFileData = 'file content'
      const testKey = 'folder/sub-folder/file with spaces.txt'

      mockRequest.params.key = testKey
      getFileFromS3.mockResolvedValue(mockFileData)

      await getFromS3.handler(mockRequest, mockH)

      expect(getFileFromS3).toHaveBeenCalledWith(testKey)
      expect(mockH.response).toHaveBeenCalledWith(mockFileData)
      expect(mockResponse.code).toHaveBeenCalledWith(200)
    })
  })

  describe('addFileToS3', () => {
    it('should have correct route configuration', () => {
      expect(addFileToS3.method).toBe('POST')
      expect(addFileToS3.path).toBe('/s3/{key}')
      expect(typeof addFileToS3.handler).toBe('function')
    })

    it('should successfully upload file to S3', async () => {
      const testKey = 'new-file.json'
      const testPayload = { data: 'test', value: 123 }

      mockRequest.params.key = testKey
      mockRequest.payload = testPayload
      uploadJsonFileToS3.mockResolvedValue({ ETag: '"abc123"' })

      await addFileToS3.handler(mockRequest, mockH)

      expect(console.log).toHaveBeenCalledWith(
        'Payload received for S3 upload:',
        testPayload
      )
      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        testKey,
        JSON.stringify(testPayload)
      )
      expect(mockH.response).toHaveBeenCalledWith({
        message: 'File added to S3 successfully'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(201)
    })

    it('should handle complex JSON payload', async () => {
      const testKey = 'complex-file.json'
      const complexPayload = {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          preferences: {
            theme: 'dark',
            notifications: true
          }
        },
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ]
      }

      mockRequest.params.key = testKey
      mockRequest.payload = complexPayload
      uploadJsonFileToS3.mockResolvedValue({ ETag: '"def456"' })

      await addFileToS3.handler(mockRequest, mockH)

      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        testKey,
        JSON.stringify(complexPayload)
      )
      expect(mockH.response).toHaveBeenCalledWith({
        message: 'File added to S3 successfully'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(201)
    })

    it('should handle errors when upload fails', async () => {
      const mockError = new Error('Upload failed')
      const testKey = 'upload-file.json'
      const testPayload = { test: 'data' }

      mockRequest.params.key = testKey
      mockRequest.payload = testPayload
      uploadJsonFileToS3.mockRejectedValue(mockError)

      await addFileToS3.handler(mockRequest, mockH)

      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        testKey,
        JSON.stringify(testPayload)
      )
      expect(console.error).toHaveBeenCalledWith(
        'Error adding file to S3:',
        mockError
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to add file to S3'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(500)
    })

    it('should handle empty payload', async () => {
      const testKey = 'empty-file.json'
      const emptyPayload = {}

      mockRequest.params.key = testKey
      mockRequest.payload = emptyPayload
      uploadJsonFileToS3.mockResolvedValue({ ETag: '"empty123"' })

      await addFileToS3.handler(mockRequest, mockH)

      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        testKey,
        JSON.stringify(emptyPayload)
      )
      expect(mockH.response).toHaveBeenCalledWith({
        message: 'File added to S3 successfully'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(201)
    })

    it('should handle null payload', async () => {
      const testKey = 'null-file.json'

      mockRequest.params.key = testKey
      mockRequest.payload = null
      uploadJsonFileToS3.mockResolvedValue({ ETag: '"null123"' })

      await addFileToS3.handler(mockRequest, mockH)

      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        testKey,
        JSON.stringify(null)
      )
      expect(mockH.response).toHaveBeenCalledWith({
        message: 'File added to S3 successfully'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(201)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle concurrent requests properly', async () => {
      const testKey1 = 'file1.json'
      const testKey2 = 'file2.json'
      const testData1 = 'data1'
      const testData2 = 'data2'

      mockRequest.params.key = testKey1
      getFileFromS3.mockResolvedValueOnce(testData1)

      const request2 = { params: { key: testKey2 } }
      getFileFromS3.mockResolvedValueOnce(testData2)

      await Promise.all([
        getFromS3.handler(mockRequest, mockH),
        getFromS3.handler(request2, mockH)
      ])

      expect(getFileFromS3).toHaveBeenCalledTimes(2)
      expect(getFileFromS3).toHaveBeenNthCalledWith(1, testKey1)
      expect(getFileFromS3).toHaveBeenNthCalledWith(2, testKey2)
    })
  })
})
