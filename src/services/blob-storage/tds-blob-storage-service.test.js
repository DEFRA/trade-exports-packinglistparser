import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the blob-storage-service module
const mockCheckContainerExists = vi.fn()
const mockUploadBlob = vi.fn()
const mockCreateBlobStorageService = vi.fn(() => ({
  checkContainerExists: mockCheckContainerExists,
  uploadBlob: mockUploadBlob
}))

vi.mock('./blob-storage-service.js', () => ({
  createBlobStorageService: mockCreateBlobStorageService
}))

// Mock config
const mockTdsConfig = {
  clientId: 'tds-client-id',
  blobStorageAccount: 'tdsaccount',
  containerName: 'tds-container'
}

const mockAzureConfig = {
  defraCloudTenantId: 'tds-cloud-tenant-id'
}

const mockConfigGet = vi.fn((key) => {
  if (key === 'tdsBlob') {
    return mockTdsConfig
  }
  if (key === 'azure') {
    return mockAzureConfig
  }
  return {}
})

vi.mock('../../config.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

// Import after all mocks
const { checkTdsContainerExists, uploadJsonToTdsBlob, uploadToTdsBlob } =
  await import('./tds-blob-storage-service.js')

describe('tds-blob-storage-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkTdsContainerExists', () => {
    it('should return true when container exists', async () => {
      mockCheckContainerExists.mockResolvedValue(true)

      const result = await checkTdsContainerExists()

      expect(mockCreateBlobStorageService).toHaveBeenCalledWith({
        tenantId: 'tds-cloud-tenant-id',
        clientId: mockTdsConfig.clientId,
        blobStorageAccount: mockTdsConfig.blobStorageAccount,
        containerName: mockTdsConfig.containerName
      })
      expect(mockCheckContainerExists).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should return false when container does not exist', async () => {
      mockCheckContainerExists.mockResolvedValue(false)

      const result = await checkTdsContainerExists()

      expect(result).toBe(false)
    })

    it('should propagate errors from the underlying service', async () => {
      mockCheckContainerExists.mockRejectedValue(new Error('Connection failed'))

      await expect(checkTdsContainerExists()).rejects.toThrow(
        'Connection failed'
      )
    })
  })

  describe('uploadJsonToTdsBlob', () => {
    it('should upload JSON data successfully', async () => {
      const blobName = 'test-data.json'
      const jsonData = { key: 'value', items: [1, 2, 3] }
      const mockUploadResponse = {
        ETag: '"0x8D9A1B2C3D4E5F6"',
        lastModified: new Date('2026-02-10T10:00:00Z'),
        requestId: 'abc-123-def'
      }

      mockUploadBlob.mockResolvedValue(mockUploadResponse)

      const result = await uploadJsonToTdsBlob(blobName, jsonData)

      expect(mockCreateBlobStorageService).toHaveBeenCalledWith({
        tenantId: 'tds-cloud-tenant-id',
        clientId: mockTdsConfig.clientId,
        blobStorageAccount: mockTdsConfig.blobStorageAccount,
        containerName: mockTdsConfig.containerName
      })
      expect(mockUploadBlob).toHaveBeenCalledWith(
        blobName,
        JSON.stringify(jsonData, null, 2),
        { contentType: 'application/json' }
      )
      expect(result).toEqual(mockUploadResponse)
    })

    it('should upload JSON array successfully', async () => {
      const blobName = 'array-data.json'
      const jsonData = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const mockUploadResponse = {
        ETag: '"0x8D9A1B2C3D4E5F7"',
        lastModified: new Date('2026-02-10T11:00:00Z'),
        requestId: 'def-456-ghi'
      }

      mockUploadBlob.mockResolvedValue(mockUploadResponse)

      const result = await uploadJsonToTdsBlob(blobName, jsonData)

      expect(mockUploadBlob).toHaveBeenCalledWith(
        blobName,
        JSON.stringify(jsonData, null, 2),
        { contentType: 'application/json' }
      )
      expect(result).toEqual(mockUploadResponse)
    })

    it('should upload nested JSON object with proper formatting', async () => {
      const blobName = 'nested.json'
      const jsonData = {
        level1: {
          level2: {
            level3: 'value'
          }
        }
      }
      const mockUploadResponse = {
        ETag: '"0x8D9A1B2C3D4E5F8"',
        lastModified: new Date('2026-02-10T12:00:00Z'),
        requestId: 'ghi-789-jkl'
      }

      mockUploadBlob.mockResolvedValue(mockUploadResponse)

      await uploadJsonToTdsBlob(blobName, jsonData)

      // Verify JSON is stringified with 2-space indentation
      expect(mockUploadBlob).toHaveBeenCalledWith(
        blobName,
        JSON.stringify(jsonData, null, 2),
        { contentType: 'application/json' }
      )
    })

    it('should upload empty JSON object', async () => {
      const blobName = 'empty.json'
      const jsonData = {}
      const mockUploadResponse = {
        ETag: '"0x8D9A1B2C3D4E5F9"',
        lastModified: new Date('2026-02-10T13:00:00Z'),
        requestId: 'jkl-012-mno'
      }

      mockUploadBlob.mockResolvedValue(mockUploadResponse)

      const result = await uploadJsonToTdsBlob(blobName, jsonData)

      expect(result).toEqual(mockUploadResponse)
    })

    it('should propagate errors from upload operation', async () => {
      const blobName = 'error.json'
      const jsonData = { test: 'data' }

      mockUploadBlob.mockRejectedValue(new Error('Upload failed'))

      await expect(uploadJsonToTdsBlob(blobName, jsonData)).rejects.toThrow(
        'Upload failed'
      )
    })
  })

  describe('uploadToTdsBlob', () => {
    it('should upload string data with default options', async () => {
      const blobName = 'test-file.txt'
      const data = 'test data content'
      const mockUploadResponse = {
        ETag: '"0x8D9A1B2C3D4E5FA"',
        lastModified: new Date('2026-02-10T14:00:00Z'),
        requestId: 'mno-345-pqr'
      }

      mockUploadBlob.mockResolvedValue(mockUploadResponse)

      const result = await uploadToTdsBlob(blobName, data)

      expect(mockCreateBlobStorageService).toHaveBeenCalledWith({
        tenantId: 'tds-cloud-tenant-id',
        clientId: mockTdsConfig.clientId,
        blobStorageAccount: mockTdsConfig.blobStorageAccount,
        containerName: mockTdsConfig.containerName
      })
      expect(mockUploadBlob).toHaveBeenCalledWith(blobName, data, {})
      expect(result).toEqual(mockUploadResponse)
    })

    it('should upload buffer data with custom content type', async () => {
      const blobName = 'binary-file.bin'
      const data = Buffer.from([0x01, 0x02, 0x03, 0x04])
      const options = { contentType: 'application/octet-stream' }
      const mockUploadResponse = {
        ETag: '"0x8D9A1B2C3D4E5FB"',
        lastModified: new Date('2026-02-10T15:00:00Z'),
        requestId: 'pqr-678-stu'
      }

      mockUploadBlob.mockResolvedValue(mockUploadResponse)

      const result = await uploadToTdsBlob(blobName, data, options)

      expect(mockUploadBlob).toHaveBeenCalledWith(blobName, data, options)
      expect(result).toEqual(mockUploadResponse)
    })

    it('should upload data with custom options', async () => {
      const blobName = 'document.pdf'
      const data = Buffer.from('pdf content')
      const options = {
        contentType: 'application/pdf',
        customMetadata: 'test'
      }
      const mockUploadResponse = {
        ETag: '"0x8D9A1B2C3D4E5FC"',
        lastModified: new Date('2026-02-10T16:00:00Z'),
        requestId: 'stu-901-vwx'
      }

      mockUploadBlob.mockResolvedValue(mockUploadResponse)

      const result = await uploadToTdsBlob(blobName, data, options)

      expect(mockUploadBlob).toHaveBeenCalledWith(blobName, data, options)
      expect(result).toEqual(mockUploadResponse)
    })

    it('should upload CSV data with text/csv content type', async () => {
      const blobName = 'data.csv'
      const data = 'header1,header2\nvalue1,value2'
      const options = { contentType: 'text/csv' }
      const mockUploadResponse = {
        ETag: '"0x8D9A1B2C3D4E5FD"',
        lastModified: new Date('2026-02-10T17:00:00Z'),
        requestId: 'vwx-234-yza'
      }

      mockUploadBlob.mockResolvedValue(mockUploadResponse)

      const result = await uploadToTdsBlob(blobName, data, options)

      expect(mockUploadBlob).toHaveBeenCalledWith(blobName, data, options)
      expect(result).toEqual(mockUploadResponse)
    })

    it('should propagate errors from upload operation', async () => {
      const blobName = 'error-file.txt'
      const data = 'test data'

      mockUploadBlob.mockRejectedValue(new Error('Storage account unavailable'))

      await expect(uploadToTdsBlob(blobName, data)).rejects.toThrow(
        'Storage account unavailable'
      )
    })

    it('should handle authentication errors', async () => {
      const blobName = 'auth-error.txt'
      const data = 'test data'

      mockUploadBlob.mockRejectedValue(new Error('Authentication failed'))

      await expect(uploadToTdsBlob(blobName, data)).rejects.toThrow(
        'Authentication failed'
      )
    })
  })
})
