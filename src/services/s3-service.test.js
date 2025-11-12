import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3'

// Mock the config module
const mockConfig = {
  s3Bucket: 'test-bucket',
  region: 'us-east-1',
  endpoint: 'http://localhost:4566',
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key'
}

const mockPackingList = { schemaVersion: 'v1' }

const getConfigByName = (name) => {
  if (name === 'aws') return mockConfig
  if (name === 'packingList') return mockPackingList
  return undefined
}

vi.mock('../../src/config.js', () => ({
  config: {
    get: vi.fn().mockImplementation((name) => getConfigByName(name))
  }
}))

// Mock the S3Client
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(),
  ListObjectsV2Command: vi.fn(),
  PutObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn()
}))

describe('S3 Service', () => {
  let mockS3Client
  let mockSend

  // Import the actual functions after mocking
  let listS3Objects, uploadJsonFileToS3, getFileFromS3, getStreamFromS3

  beforeEach(async () => {
    mockSend = vi.fn()
    mockS3Client = {
      send: mockSend
    }

    // Reset mocks
    vi.clearAllMocks()

    // Set up S3Client mock
    S3Client.mockImplementation(() => mockS3Client)

    // Mock command constructors to return objects with input property
    ListObjectsV2Command.mockImplementation((input) => ({ input }))
    PutObjectCommand.mockImplementation((input) => ({ input }))
    GetObjectCommand.mockImplementation((input) => ({ input }))

    // Import the service functions after mocking
    const s3Service = await import('./s3-service.js')
    listS3Objects = s3Service.listS3Objects
    uploadJsonFileToS3 = s3Service.uploadJsonFileToS3
    getFileFromS3 = s3Service.getFileFromS3
    getStreamFromS3 = s3Service.getStreamFromS3
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('listS3Objects', () => {
    it('should list S3 objects successfully', async () => {
      const mockResponse = {
        Contents: [
          { Key: 'file1.txt', Size: 100 },
          { Key: 'file2.txt', Size: 200 }
        ]
      }
      mockSend.mockResolvedValue(mockResponse)

      const result = await listS3Objects()

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Bucket: 'test-bucket',
            Prefix: `${mockPackingList.schemaVersion}/`
          }
        })
      )
      const command = mockSend.mock.calls[0][0]
      expect(command.input.Bucket).toBe('test-bucket')
      expect(command.input.Prefix).toBe(`${mockPackingList.schemaVersion}/`)
      expect(result).toEqual(mockResponse)
    })

    it('should handle errors when listing objects', async () => {
      const mockError = new Error('Failed to list objects')
      mockSend.mockRejectedValue(mockError)

      await expect(listS3Objects()).rejects.toThrow('Failed to list objects')
    })
  })

  describe('uploadJsonFileToS3', () => {
    it('should upload file to S3 successfully', async () => {
      const mockResponse = { ETag: '"abc123"' }
      mockSend.mockResolvedValue(mockResponse)
      const location = { filename: 'test-file' }
      const body = '{"test": "data"}'

      const result = await uploadJsonFileToS3(location, body)

      const expectedKey = `${mockPackingList.schemaVersion}/${location.filename}.json`

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Bucket: 'test-bucket',
            Key: expectedKey,
            Body: body
          }
        })
      )
      const command = mockSend.mock.calls[0][0]
      expect(command.input.Bucket).toBe('test-bucket')
      expect(command.input.Key).toBe(expectedKey)
      expect(command.input.Body).toBe(body)
      expect(result).toEqual(mockResponse)
    })

    it('should handle errors when uploading file', async () => {
      const mockError = new Error('Failed to upload file')
      mockSend.mockRejectedValue(mockError)

      await expect(
        uploadJsonFileToS3({ filename: 'test' }, '{"test": "data"}')
      ).rejects.toThrow('Failed to upload file')
    })
  })

  describe('getFileFromS3', () => {
    it('should get file from S3 successfully', async () => {
      const mockFileContent = '{"test": "data"}'
      const mockResponse = {
        Body: {
          transformToString: vi.fn().mockResolvedValue(mockFileContent)
        }
      }
      mockSend.mockResolvedValue(mockResponse)

      const location = { filename: 'test-file' }

      const result = await getFileFromS3(location)

      const expectedKey = `${mockPackingList.schemaVersion}/${location.filename}.json`

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Bucket: 'test-bucket',
            Key: expectedKey
          }
        })
      )
      const command = mockSend.mock.calls[0][0]
      expect(command.input.Bucket).toBe('test-bucket')
      expect(command.input.Key).toBe(expectedKey)
      expect(result).toBe(mockFileContent)
    })

    it('should handle errors when getting file', async () => {
      const mockError = new Error('File not found')
      mockSend.mockRejectedValue(mockError)

      await expect(getFileFromS3({ filename: 'nonexistent' })).rejects.toThrow(
        'File not found'
      )
    })
  })

  describe('getStreamFromS3', () => {
    it('should get stream from S3 successfully', async () => {
      const mockResponse = {
        Body: {
          transformToString: vi.fn()
        }
      }
      mockSend.mockResolvedValue(mockResponse)

      const location = { filename: 'test-file' }

      const result = await getStreamFromS3(location)

      const expectedKey = `${mockPackingList.schemaVersion}/${location.filename}.json`

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Bucket: 'test-bucket',
            Key: expectedKey
          }
        })
      )
      const command = mockSend.mock.calls[0][0]
      expect(command.input.Bucket).toBe('test-bucket')
      expect(command.input.Key).toBe(expectedKey)
      expect(result).toEqual(mockResponse)
    })

    it('should handle errors when getting stream', async () => {
      const mockError = new Error('Stream error')
      mockSend.mockRejectedValue(mockError)

      await expect(getStreamFromS3({ filename: 'test' })).rejects.toThrow(
        'Stream error'
      )
    })
  })

  describe('getFileFromS3 integration with getStreamFromS3', () => {
    it('should properly transform stream to string', async () => {
      const mockFileContent = '{"data": "test content"}'
      const mockTransformToString = vi.fn().mockResolvedValue(mockFileContent)
      const mockResponse = {
        Body: {
          transformToString: mockTransformToString
        }
      }
      mockSend.mockResolvedValue(mockResponse)

      const result = await getFileFromS3({ filename: 'test-file' })

      expect(mockTransformToString).toHaveBeenCalledTimes(1)
      expect(result).toBe(mockFileContent)
    })

    it('should handle transformToString errors', async () => {
      const mockError = new Error('Transform failed')
      const mockTransformToString = vi.fn().mockRejectedValue(mockError)
      const mockResponse = {
        Body: {
          transformToString: mockTransformToString
        }
      }
      mockSend.mockResolvedValue(mockResponse)

      await expect(getFileFromS3({ filename: 'test-file' })).rejects.toThrow(
        'Transform failed'
      )
    })
  })
})
