import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Readable } from 'node:stream'

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
const mockConfigGet = vi.fn((key) => {
  if (key === 'log') {
    return {
      isEnabled: false,
      level: 'silent',
      format: 'pino-pretty',
      redact: []
    }
  }
  if (key === 'serviceName') {
    return 'test-service'
  }
  if (key === 'serviceVersion') {
    return '1.0.0'
  }
  return {}
})
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

// Test constants for repeated literals
const TEST_CREDENTIALS = {
  TENANT_ID: 'test-tenant-id',
  CLIENT_ID: 'test-client-id'
}

const TEST_BLOB_CONFIG = {
  STORAGE_ACCOUNT: 'testaccount',
  CONTAINER_NAME: 'test-forms-container'
}

const TEST_URLS = {
  BLOB_SERVICE: 'https://testaccount.blob.core.windows.net'
}

const ERROR_CODES = {
  TIMEOUT: 'ETIMEDOUT',
  UNAUTHORIZED: 401
}

// Helper functions to reduce code duplication and complexity
const setupDefaultConfig = () => {
  mockConfigGet.mockImplementation((key) => {
    if (key === 'log') {
      return {
        isEnabled: false,
        level: 'silent',
        format: 'pino-pretty',
        redact: []
      }
    }
    if (key === 'serviceName') {
      return 'test-service'
    }
    if (key === 'serviceVersion') {
      return '1.0.0'
    }
    if (key === 'azure') {
      return {
        defraTenantId: TEST_CREDENTIALS.TENANT_ID
      }
    }
    if (key === 'ehcoBlob') {
      return {
        clientId: TEST_CREDENTIALS.CLIENT_ID,
        blobStorageAccount: TEST_BLOB_CONFIG.STORAGE_ACCOUNT,
        formsContainerName: TEST_BLOB_CONFIG.CONTAINER_NAME
      }
    }
    return {}
  })
}

const setupCustomConfig = (
  tenantId,
  clientId,
  storageAccount,
  containerName
) => {
  mockConfigGet.mockImplementation((key) => {
    if (key === 'log') {
      return {
        isEnabled: false,
        level: 'silent',
        format: 'pino-pretty',
        redact: []
      }
    }
    if (key === 'serviceName') {
      return 'test-service'
    }
    if (key === 'serviceVersion') {
      return '1.0.0'
    }
    if (key === 'azure') {
      return {
        defraTenantId: tenantId
      }
    }
    if (key === 'ehcoBlob') {
      return {
        clientId,
        blobStorageAccount: storageAccount,
        formsContainerName: containerName
      }
    }
    return {}
  })
}

const createMockReadableStream = (data) => {
  return Readable.from([data])
}

const setupSuccessfulDownload = (data) => {
  const readableStream = createMockReadableStream(data)
  mockDownload.mockResolvedValue({
    readableStreamBody: readableStream
  })
}

describe('ehco-blob-storage-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetClientProxyOptions.mockReturnValue({})
    setupDefaultConfig()
  })

  describe('downloadBlobFromApplicationForms', () => {
    it('should download a blob successfully', async () => {
      const testData = Buffer.from('test file content')
      setupSuccessfulDownload(testData)

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
      setupSuccessfulDownload(testData)

      const result = await downloadBlobFromApplicationForms('test-blob.pdf')

      expect(BlobServiceClient).toHaveBeenCalledWith(
        TEST_URLS.BLOB_SERVICE,
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
      setupCustomConfig(
        TEST_CREDENTIALS.TENANT_ID,
        TEST_CREDENTIALS.CLIENT_ID,
        null,
        'test-container'
      )

      mockBlobServiceClient.mockImplementationOnce(() => {
        throw new Error('Invalid blob storage account')
      })

      await expect(
        downloadBlobFromApplicationForms('test.txt')
      ).rejects.toThrow('Failed to download blob: Invalid blob storage account')
    })

    it('should construct correct blob service URL', async () => {
      const testData = Buffer.from('url test')
      setupSuccessfulDownload(testData)
      setupCustomConfig('tenant-123', 'client-456', 'myaccount', 'forms')

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
      setupSuccessfulDownload(testData)

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
        TEST_CREDENTIALS.TENANT_ID,
        TEST_CREDENTIALS.CLIENT_ID
      )
      expect(BlobServiceClient).toHaveBeenCalledWith(
        TEST_URLS.BLOB_SERVICE,
        { type: 'credential' },
        {}
      )
      expect(mockGetContainerClient).toHaveBeenCalledWith(
        TEST_BLOB_CONFIG.CONTAINER_NAME
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
        TEST_URLS.BLOB_SERVICE,
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
      authError.statusCode = ERROR_CODES.UNAUTHORIZED
      mockExists.mockRejectedValue(authError)

      await expect(checkApplicationFormsContainerExists()).rejects.toThrow(
        'Failed to download blob: Invalid credentials'
      )
    })

    it('should throw error when network timeout occurs', async () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.code = ERROR_CODES.TIMEOUT
      mockExists.mockRejectedValue(timeoutError)

      await expect(checkApplicationFormsContainerExists()).rejects.toThrow(
        'Failed to download blob: Request timeout'
      )
    })

    it('should use correct Azure credentials', async () => {
      setupCustomConfig(
        'custom-tenant',
        'custom-client',
        'customaccount',
        'custom-container'
      )
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
