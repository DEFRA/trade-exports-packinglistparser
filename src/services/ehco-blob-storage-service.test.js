import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Readable } from 'stream'

// Mock BlobServiceClient - must be declared before vi.mock
const mockDownload = vi.fn()
const mockExists = vi.fn()
const mockGetBlobClient = vi.fn(() => ({
  download: mockDownload
}))
const mockGetContainerClient = vi.fn(() => ({
  getBlobClient: mockGetBlobClient,
  exists: mockExists
}))
const mockBlobServiceClient = vi.fn(() => ({
  getContainerClient: mockGetContainerClient
}))

vi.mock('@azure/storage-blob', () => ({
  BlobServiceClient: mockBlobServiceClient
}))

// Mock getAzureCredentials
const mockGetAzureCredentials = vi.fn(() => ({ type: 'credential' }))
vi.mock('./utilities/get-azure-credentials.js', () => ({
  getAzureCredentials: mockGetAzureCredentials
}))

// Mock proxy helper
const mockGetClientProxyOptions = vi.fn(() => ({}))
vi.mock('./utilities/proxy-helper.js', () => ({
  getClientProxyOptions: mockGetClientProxyOptions
}))

// Mock config
const mockConfigGet = vi.fn()
vi.mock('../config.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

// Import after all mocks
const {
  downloadBlobFromApplicationForms,
  checkApplicationFormsContainerExists
} = await import('./ehco-blob-storage-service.js')
const { BlobServiceClient } = await import('@azure/storage-blob')

describe('ehco-blob-storage-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset proxy helper mock
    mockGetClientProxyOptions.mockReturnValue({})

    // Reset config mock to default values
    mockConfigGet.mockImplementation((key) => {
      if (key === 'azure') {
        return {
          defraTenantId: 'test-tenant-id'
        }
      }
      if (key === 'ehcoBlob') {
        return {
          clientId: 'test-client-id',
          blobStorageAccount: 'testaccount',
          formsContainerName: 'test-forms-container'
        }
      }
      return {}
    })
  })

  describe('downloadBlobFromApplicationForms', () => {
    it('should download a blob successfully', async () => {
      const testData = Buffer.from('test file content')
      const readableStream = Readable.from([testData])

      mockDownload.mockResolvedValue({
        readableStreamBody: readableStream
      })

      const result = await downloadBlobFromApplicationForms('test-blob.txt')

      expect(mockGetAzureCredentials).toHaveBeenCalledWith(
        'test-tenant-id',
        'test-client-id'
      )
      expect(BlobServiceClient).toHaveBeenCalledWith(
        'https://testaccount.blob.core.windows.net',
        { type: 'credential' },
        {}
      )
      expect(mockGetContainerClient).toHaveBeenCalledWith(
        'test-forms-container'
      )
      expect(mockGetBlobClient).toHaveBeenCalledWith('test-blob.txt')
      expect(mockDownload).toHaveBeenCalled()
      expect(result).toEqual(testData)
    })

    it('should download a blob with proxy configuration', async () => {
      const proxyOptions = { proxySettings: { host: 'proxy.example.com' } }
      mockGetClientProxyOptions.mockReturnValue(proxyOptions)

      const testData = Buffer.from('test content with proxy')
      const readableStream = Readable.from([testData])

      mockDownload.mockResolvedValue({
        readableStreamBody: readableStream
      })

      const result = await downloadBlobFromApplicationForms('test-blob.pdf')

      expect(BlobServiceClient).toHaveBeenCalledWith(
        'https://testaccount.blob.core.windows.net',
        { type: 'credential' },
        proxyOptions
      )
      expect(result).toEqual(testData)
    })

    it('should handle stream with multiple chunks', async () => {
      const chunk1 = Buffer.from('first ')
      const chunk2 = Buffer.from('second ')
      const chunk3 = Buffer.from('third')
      const readableStream = Readable.from([chunk1, chunk2, chunk3])

      mockDownload.mockResolvedValue({
        readableStreamBody: readableStream
      })

      const result = await downloadBlobFromApplicationForms('multi-chunk.txt')

      const expected = Buffer.concat([chunk1, chunk2, chunk3])
      expect(result).toEqual(expected)
    })

    it('should handle stream with non-Buffer data', async () => {
      const stringData = 'string data'
      const readableStream = Readable.from([stringData])

      mockDownload.mockResolvedValue({
        readableStreamBody: readableStream
      })

      const result = await downloadBlobFromApplicationForms('string-data.txt')

      expect(result).toEqual(Buffer.from(stringData))
    })

    it('should throw error when blob download fails', async () => {
      mockDownload.mockRejectedValue(new Error('Blob not found'))

      await expect(
        downloadBlobFromApplicationForms('nonexistent.txt')
      ).rejects.toThrow('Failed to download blob: Blob not found')
    })

    it('should throw error when stream fails', async () => {
      const errorStream = new Readable({
        read() {
          this.emit('error', new Error('Stream error'))
        }
      })

      mockDownload.mockResolvedValue({
        readableStreamBody: errorStream
      })

      await expect(
        downloadBlobFromApplicationForms('error-stream.txt')
      ).rejects.toThrow('Stream error')
    })

    it('should throw error when BlobServiceClient creation fails', async () => {
      mockConfigGet.mockImplementation((key) => {
        if (key === 'azure') {
          return {
            defraTenantId: 'test-tenant-id'
          }
        }
        if (key === 'ehcoBlob') {
          return {
            clientId: 'test-client-id',
            blobStorageAccount: null, // Missing required config
            formsContainerName: 'test-container'
          }
        }
        return {}
      })

      mockBlobServiceClient.mockImplementationOnce(() => {
        throw new Error('Invalid blob storage account')
      })

      await expect(
        downloadBlobFromApplicationForms('test.txt')
      ).rejects.toThrow('Failed to download blob: Invalid blob storage account')
    })

    it('should construct correct blob service URL', async () => {
      const testData = Buffer.from('url test')
      const readableStream = Readable.from([testData])

      mockDownload.mockResolvedValue({
        readableStreamBody: readableStream
      })

      // Reset proxy options to empty for this test
      mockGetClientProxyOptions.mockReturnValue({})

      mockConfigGet.mockImplementation((key) => {
        if (key === 'azure') {
          return {
            defraTenantId: 'tenant-123'
          }
        }
        if (key === 'ehcoBlob') {
          return {
            clientId: 'client-456',
            blobStorageAccount: 'myaccount',
            formsContainerName: 'forms'
          }
        }
        return {}
      })

      await downloadBlobFromApplicationForms('file.txt')

      expect(BlobServiceClient).toHaveBeenCalledWith(
        'https://myaccount.blob.core.windows.net',
        { type: 'credential' },
        {}
      )
    })

    it('should handle empty blob content', async () => {
      const emptyStream = Readable.from([])

      mockDownload.mockResolvedValue({
        readableStreamBody: emptyStream
      })

      const result = await downloadBlobFromApplicationForms('empty.txt')

      expect(result).toEqual(Buffer.from([]))
    })

    it('should call config.get with correct keys', async () => {
      const testData = Buffer.from('config test')
      const readableStream = Readable.from([testData])

      mockDownload.mockResolvedValue({
        readableStreamBody: readableStream
      })

      await downloadBlobFromApplicationForms('config-test.txt')

      expect(mockConfigGet).toHaveBeenCalledWith('azure')
      expect(mockConfigGet).toHaveBeenCalledWith('ehcoBlob')
      expect(mockConfigGet).toHaveBeenCalledTimes(3) // Called once for 'azure', twice for 'ehcoBlob' (in createBlobServiceClient and createApplicationFormsBlobClient)
    })
  })

  describe('checkApplicationFormsContainerExists', () => {
    it('should return true when container exists', async () => {
      mockExists.mockResolvedValue(true)

      const result = await checkApplicationFormsContainerExists()

      expect(mockGetAzureCredentials).toHaveBeenCalledWith(
        'test-tenant-id',
        'test-client-id'
      )
      expect(BlobServiceClient).toHaveBeenCalledWith(
        'https://testaccount.blob.core.windows.net',
        { type: 'credential' },
        {}
      )
      expect(mockGetContainerClient).toHaveBeenCalledWith(
        'test-forms-container'
      )
      expect(mockExists).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should return false when container does not exist', async () => {
      mockExists.mockResolvedValue(false)

      const result = await checkApplicationFormsContainerExists()

      expect(mockExists).toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it('should work with proxy configuration', async () => {
      const proxyOptions = { proxySettings: { host: 'proxy.example.com' } }
      mockGetClientProxyOptions.mockReturnValue(proxyOptions)
      mockExists.mockResolvedValue(true)

      const result = await checkApplicationFormsContainerExists()

      expect(BlobServiceClient).toHaveBeenCalledWith(
        'https://testaccount.blob.core.windows.net',
        { type: 'credential' },
        proxyOptions
      )
      expect(result).toBe(true)
    })

    it('should throw error when exists check fails', async () => {
      mockExists.mockRejectedValue(new Error('Connection failed'))

      await expect(checkApplicationFormsContainerExists()).rejects.toThrow(
        'Failed to download blob: Connection failed'
      )
    })

    it('should throw error when authentication fails', async () => {
      const authError = new Error('Invalid credentials')
      authError.statusCode = 401
      mockExists.mockRejectedValue(authError)

      await expect(checkApplicationFormsContainerExists()).rejects.toThrow(
        'Failed to download blob: Invalid credentials'
      )
    })

    it('should throw error when network timeout occurs', async () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.code = 'ETIMEDOUT'
      mockExists.mockRejectedValue(timeoutError)

      await expect(checkApplicationFormsContainerExists()).rejects.toThrow(
        'Failed to download blob: Request timeout'
      )
    })

    it('should use correct Azure credentials', async () => {
      mockConfigGet.mockImplementation((key) => {
        if (key === 'azure') {
          return {
            defraTenantId: 'custom-tenant'
          }
        }
        if (key === 'ehcoBlob') {
          return {
            clientId: 'custom-client',
            blobStorageAccount: 'customaccount',
            formsContainerName: 'custom-container'
          }
        }
        return {}
      })
      mockExists.mockResolvedValue(true)

      await checkApplicationFormsContainerExists()

      expect(mockGetAzureCredentials).toHaveBeenCalledWith(
        'custom-tenant',
        'custom-client'
      )
      expect(BlobServiceClient).toHaveBeenCalledWith(
        'https://customaccount.blob.core.windows.net',
        { type: 'credential' },
        {}
      )
      expect(mockGetContainerClient).toHaveBeenCalledWith('custom-container')
    })

    it('should call config.get with correct keys', async () => {
      mockExists.mockResolvedValue(true)

      await checkApplicationFormsContainerExists()

      expect(mockConfigGet).toHaveBeenCalledWith('azure')
      expect(mockConfigGet).toHaveBeenCalledWith('ehcoBlob')
    })
  })
})
