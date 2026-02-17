import { describe, it, expect, beforeEach, vi } from 'vitest'

// Import after mocking so the mocked service is used by the route module
import { getListFromS3, getFromS3, addFileToS3 } from './s3.js'
import {
  listS3Objects,
  uploadJsonFileToS3,
  getFileFromS3
} from '../services/s3-service.js'

import { STATUS_CODES } from './statuscodes.js'

// Mock the S3 service BEFORE importing the routes so imports pick up the mocks
vi.mock('../services/s3-service.js', () => ({
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
      payload: {},
      logger: {
        error: vi.fn()
      }
    }

    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  describe('getListFromS3', () => {
    it('should have correct route configuration', () => {
      expect(getListFromS3.method).toBe('GET')
      expect(getListFromS3.path).toBe('/s3')
      expect(typeof getListFromS3.handler).toBe('function')
    })

    it('should successfully return objects from listS3Objects', async () => {
      const mockObjectsResponse = {
        Contents: [
          { Key: 'file1.txt', Size: 100 },
          { Key: 'file2.txt', Size: 200 }
        ]
      }

      listS3Objects.mockResolvedValue(mockObjectsResponse)

      // include schema query param
      mockRequest.query = { schema: 'v2' }

      await getListFromS3.handler(mockRequest, mockH)

      expect(listS3Objects).toHaveBeenCalledTimes(1)
      expect(listS3Objects).toHaveBeenCalledWith('v2')
      // makeListHandler now returns the objectsResponse directly
      expect(mockH.response).toHaveBeenCalledWith(mockObjectsResponse)
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })

    it('should call listS3Objects with undefined when no schema provided', async () => {
      const mockObjectsResponse = { Contents: [] }
      listS3Objects.mockResolvedValue(mockObjectsResponse)

      // explicit empty query (no schema)
      mockRequest.query = {}

      await getListFromS3.handler(mockRequest, mockH)

      expect(listS3Objects).toHaveBeenCalledTimes(1)
      expect(listS3Objects).toHaveBeenCalledWith(undefined)
      expect(mockH.response).toHaveBeenCalledWith(mockObjectsResponse)
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })

    it('should handle errors when listing objects fails', async () => {
      const mockError = new Error('S3 service error')
      listS3Objects.mockRejectedValue(mockError)

      mockRequest.query = { schema: 'v2' }

      await getListFromS3.handler(mockRequest, mockH)

      expect(listS3Objects).toHaveBeenCalledTimes(1)
      expect(mockRequest.logger.error).toHaveBeenCalledWith(
        {
          error: {
            message: mockError.message,
            stack_trace: mockError.stack,
            type: mockError.name
          }
        },
        'Error listing S3 buckets (schema: v2)'
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to list S3 buckets'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(
        STATUS_CODES.INTERNAL_SERVER_ERROR
      )
    })

    // previous bucket-iteration tests removed because makeListHandler now calls
    // listS3Objects() directly and returns its result

    it('should handle empty objects response', async () => {
      const mockObjectsResponse = { Contents: [] }
      listS3Objects.mockResolvedValue(mockObjectsResponse)
      mockRequest.query = { schema: 'v2' }

      await getListFromS3.handler(mockRequest, mockH)

      expect(listS3Objects).toHaveBeenCalledTimes(1)
      expect(listS3Objects).toHaveBeenCalledWith('v2')
      expect(mockH.response).toHaveBeenCalledWith(mockObjectsResponse)
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })
  })

  describe('getFromS3', () => {
    it('should have correct route configuration', () => {
      expect(getFromS3.method).toBe('GET')
      expect(getFromS3.path).toBe('/s3/{filename}')
      expect(typeof getFromS3.handler).toBe('function')
    })

    it('should successfully get file from S3', async () => {
      const mockFileData = '{"test": "data"}'
      const testFilename = 'test-file'
      mockRequest.params.filename = testFilename
      mockRequest.query = { schema: 'v2' }
      getFileFromS3.mockResolvedValue(mockFileData)

      await getFromS3.handler(mockRequest, mockH)

      expect(getFileFromS3).toHaveBeenCalledWith({
        filename: testFilename,
        schema: 'v2'
      })
      expect(mockH.response).toHaveBeenCalledWith(mockFileData)
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })

    it('should call getFileFromS3 without schema when query empty', async () => {
      const mockFileData = '{"test": "data"}'
      const testFilename = 'test-file'

      mockRequest.params.filename = testFilename
      mockRequest.query = {}
      getFileFromS3.mockResolvedValue(mockFileData)

      await getFromS3.handler(mockRequest, mockH)

      expect(getFileFromS3).toHaveBeenCalledWith({
        filename: testFilename,
        schema: undefined
      })
      expect(mockH.response).toHaveBeenCalledWith(mockFileData)
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })

    it('should handle errors when getting file fails', async () => {
      const mockError = new Error('File not found')
      const testFilename = 'nonexistent-file'
      mockRequest.params.filename = testFilename
      mockRequest.query = { schema: 'v2' }
      getFileFromS3.mockRejectedValue(mockError)

      await getFromS3.handler(mockRequest, mockH)

      expect(getFileFromS3).toHaveBeenCalledWith({
        filename: testFilename,
        schema: 'v2'
      })
      expect(mockRequest.logger.error).toHaveBeenCalledWith(
        {
          error: {
            message: mockError.message,
            stack_trace: mockError.stack,
            type: mockError.name
          }
        },
        'Error getting file from S3 (filename: nonexistent-file, schema: v2)'
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to get file from S3'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(
        STATUS_CODES.INTERNAL_SERVER_ERROR
      )
    })

    it('should handle special characters in key', async () => {
      const mockFileData = 'file content'
      const testFilename = 'folder/sub-folder/file with spaces.txt'
      mockRequest.params.filename = testFilename
      mockRequest.query = { schema: 'v2' }
      getFileFromS3.mockResolvedValue(mockFileData)

      await getFromS3.handler(mockRequest, mockH)

      expect(getFileFromS3).toHaveBeenCalledWith({
        filename: testFilename,
        schema: 'v2'
      })
      expect(mockH.response).toHaveBeenCalledWith(mockFileData)
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })
  })

  describe('addFileToS3', () => {
    it('should have correct route configuration', () => {
      expect(addFileToS3.method).toBe('POST')
      expect(addFileToS3.path).toBe('/s3/{filename}')
      expect(typeof addFileToS3.handler).toBe('function')
    })

    it('should successfully upload file to S3', async () => {
      const testFilename = 'new-file'
      const testPayload = { data: 'test', value: 123 }

      mockRequest.params.filename = testFilename
      mockRequest.query = { schema: 'v2' }
      mockRequest.payload = testPayload
      uploadJsonFileToS3.mockResolvedValue({ ETag: '"abc123"' })

      await addFileToS3.handler(mockRequest, mockH)

      expect(console.log).toHaveBeenCalledWith(
        'Payload received for S3 upload:',
        testPayload
      )
      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: testFilename, schema: 'v2' },
        JSON.stringify(testPayload)
      )
      expect(mockH.response).toHaveBeenCalledWith({
        message: 'File added to S3 successfully'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.CREATED)
    })

    it('should call uploadJsonFileToS3 without schema when query empty', async () => {
      const testFilename = 'new-file'
      const testPayload = { data: 'test', value: 123 }

      mockRequest.params.filename = testFilename
      mockRequest.query = {}
      mockRequest.payload = testPayload
      uploadJsonFileToS3.mockResolvedValue({ ETag: '"abc123"' })

      await addFileToS3.handler(mockRequest, mockH)

      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: testFilename, schema: undefined },
        JSON.stringify(testPayload)
      )
      expect(mockH.response).toHaveBeenCalledWith({
        message: 'File added to S3 successfully'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.CREATED)
    })

    it('should handle complex JSON payload', async () => {
      const testFilename = 'complex-file'
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

      mockRequest.params.filename = testFilename
      mockRequest.query = { schema: 'v2' }
      mockRequest.payload = complexPayload
      uploadJsonFileToS3.mockResolvedValue({ ETag: '"def456"' })

      await addFileToS3.handler(mockRequest, mockH)

      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: testFilename, schema: 'v2' },
        JSON.stringify(complexPayload)
      )
      expect(mockH.response).toHaveBeenCalledWith({
        message: 'File added to S3 successfully'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.CREATED)
    })

    it('should handle errors when upload fails', async () => {
      const mockError = new Error('Upload failed')
      const testFilename = 'upload-file'
      const testPayload = { test: 'data' }

      mockRequest.params.filename = testFilename
      mockRequest.query = { schema: 'v2' }
      mockRequest.payload = testPayload
      uploadJsonFileToS3.mockRejectedValue(mockError)

      await addFileToS3.handler(mockRequest, mockH)

      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: testFilename, schema: 'v2' },
        JSON.stringify(testPayload)
      )
      expect(mockRequest.logger.error).toHaveBeenCalledWith(
        {
          error: {
            message: mockError.message,
            stack_trace: mockError.stack,
            type: mockError.name
          }
        },
        'Error adding file to S3 (filename: upload-file, schema: v2)'
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to add file to S3'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(
        STATUS_CODES.INTERNAL_SERVER_ERROR
      )
    })

    it('should handle empty payload', async () => {
      const testFilename = 'empty-file'
      const emptyPayload = {}

      mockRequest.params.filename = testFilename
      mockRequest.query = { schema: 'v2' }
      mockRequest.payload = emptyPayload
      uploadJsonFileToS3.mockResolvedValue({ ETag: '"empty123"' })

      await addFileToS3.handler(mockRequest, mockH)

      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: testFilename, schema: 'v2' },
        JSON.stringify(emptyPayload)
      )
      expect(mockH.response).toHaveBeenCalledWith({
        message: 'File added to S3 successfully'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.CREATED)
    })

    it('should handle null payload', async () => {
      const testFilename = 'null-file'

      mockRequest.params.filename = testFilename
      mockRequest.query = { schema: 'v2' }
      mockRequest.payload = null
      uploadJsonFileToS3.mockResolvedValue({ ETag: '"null123"' })

      await addFileToS3.handler(mockRequest, mockH)

      expect(uploadJsonFileToS3).toHaveBeenCalledWith(
        { filename: testFilename, schema: 'v2' },
        JSON.stringify(null)
      )
      expect(mockH.response).toHaveBeenCalledWith({
        message: 'File added to S3 successfully'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.CREATED)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle concurrent requests properly', async () => {
      const testFilename1 = 'file1'
      const testFilename2 = 'file2'
      const testData1 = 'data1'
      const testData2 = 'data2'

      mockRequest.params.filename = testFilename1
      mockRequest.query = { schema: 'v2' }
      getFileFromS3.mockResolvedValueOnce(testData1)

      const request2 = {
        params: { filename: testFilename2 },
        query: { schema: 'v3' }
      }
      getFileFromS3.mockResolvedValueOnce(testData2)

      await Promise.all([
        getFromS3.handler(mockRequest, mockH),
        getFromS3.handler(request2, mockH)
      ])

      expect(getFileFromS3).toHaveBeenCalledTimes(2)
      expect(getFileFromS3).toHaveBeenNthCalledWith(1, {
        filename: testFilename1,
        schema: 'v2'
      })
      expect(getFileFromS3).toHaveBeenNthCalledWith(2, {
        filename: testFilename2,
        schema: 'v3'
      })
    })
  })
})
