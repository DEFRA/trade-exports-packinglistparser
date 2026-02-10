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
vi.mock('../utilities/get-azure-credentials.js', () => ({
  getAzureCredentials: mockGetAzureCredentials
}))

// Mock proxy helper
const mockGetClientProxyOptions = vi.fn(() => ({}))
vi.mock('../utilities/proxy-helper.js', () => ({
  getClientProxyOptions: mockGetClientProxyOptions
}))

// Mock logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn()
}
vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => mockLogger)
}))

// Mock excel-helper
const mockIsExcel = vi.fn()
const mockConvertExcelToJson = vi.fn()
vi.mock('../../utilities/excel-helper.js', () => ({
  isExcel: mockIsExcel,
  convertExcelToJson: mockConvertExcelToJson
}))

// Mock csv-helper
const mockIsCsv = vi.fn()
const mockConvertCsvToJson = vi.fn()
vi.mock('../../utilities/csv-helper.js', () => ({
  isCsv: mockIsCsv,
  convertCsvToJson: mockConvertCsvToJson
}))

// Mock stream-helpers
vi.mock('../../common/helpers/stream-helpers.js', () => ({
  streamToBuffer: vi.fn()
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
  if (key === 'azure') {
    return {
      defraTenantId: 'test-tenant-id'
    }
  }
  return {}
})
vi.mock('../../config.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

// Import after all mocks
const { createBlobStorageService } = await import('./blob-storage-service.js')
const { BlobServiceClient } = await import('@azure/storage-blob')
const { streamToBuffer } = await import(
  '../../common/helpers/stream-helpers.js'
)

// Test constants
const TEST_CREDENTIALS = {
  TENANT_ID: 'test-tenant-id',
  CLIENT_ID: 'test-client-id'
}

const TEST_BLOB_CONFIG = {
  tenantId: TEST_CREDENTIALS.TENANT_ID,
  clientId: TEST_CREDENTIALS.CLIENT_ID,
  blobStorageAccount: 'testaccount',
  containerName: 'test-container'
}

const TEST_URLS = {
  BLOB_SERVICE: 'https://testaccount.blob.core.windows.net'
}

// Helper function to create readable stream from buffer
const createMockStream = (data) => {
  const stream = new Readable()
  stream.push(data)
  stream.push(null)
  return stream
}

describe('blob-storage-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock streamToBuffer to convert stream content to buffer
    streamToBuffer.mockImplementation(async (stream) => {
      return new Promise((resolve) => {
        const chunks = []
        stream.on('data', (chunk) => chunks.push(chunk))
        stream.on('end', () => resolve(Buffer.concat(chunks)))
      })
    })
  })

  describe('createBlobStorageService', () => {
    it('should create a service with all expected methods', () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)

      expect(service).toHaveProperty('downloadBlob')
      expect(service).toHaveProperty('downloadBlobAsJson')
      expect(service).toHaveProperty('checkContainerExists')
      expect(service).toHaveProperty('getBlobNameFromUrl')
      expect(typeof service.downloadBlob).toBe('function')
      expect(typeof service.downloadBlobAsJson).toBe('function')
      expect(typeof service.checkContainerExists).toBe('function')
      expect(typeof service.getBlobNameFromUrl).toBe('function')
    })
  })

  describe('downloadBlob', () => {
    it('should download blob successfully', async () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)
      const testData = Buffer.from('test content')
      mockDownload.mockResolvedValue({
        readableStreamBody: createMockStream(testData)
      })

      const result = await service.downloadBlob('test-blob.xlsx')

      expect(result).toEqual(testData)
      expect(mockGetContainerClient).toHaveBeenCalledWith('test-container')
      expect(mockGetBlobClient).toHaveBeenCalledWith('test-blob.xlsx')
    })

    it('should extract blob name from full URL', async () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)
      const testData = Buffer.from('test content')
      mockDownload.mockResolvedValue({
        readableStreamBody: createMockStream(testData)
      })

      const fullUrl = `${TEST_URLS.BLOB_SERVICE}/test-container/path/to/blob.xlsx`
      await service.downloadBlob(fullUrl)

      expect(mockGetBlobClient).toHaveBeenCalledWith('path/to/blob.xlsx')
    })

    it('should throw error when download fails', async () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)
      mockDownload.mockRejectedValue(new Error('Network error'))

      await expect(service.downloadBlob('test-blob.xlsx')).rejects.toThrow(
        'Failed to download blob: Network error'
      )
    })

    it('should throw error for invalid URL from different account', async () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)

      await expect(
        service.downloadBlob(
          'https://otheraccount.blob.core.windows.net/other-container/blob.xlsx'
        )
      ).rejects.toThrow('Invalid blob URL')
    })
  })

  describe('downloadBlobAsJson', () => {
    it('should convert Excel file to JSON', async () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)
      const testData = Buffer.from('excel content')
      const expectedJson = { data: 'test' }

      mockDownload.mockResolvedValue({
        readableStreamBody: createMockStream(testData)
      })
      mockIsExcel.mockReturnValue(true)
      mockIsCsv.mockReturnValue(false)
      mockConvertExcelToJson.mockReturnValue(expectedJson)

      const result = await service.downloadBlobAsJson('test.xlsx')

      expect(result).toEqual(expectedJson)
      expect(mockConvertExcelToJson).toHaveBeenCalledWith({ source: testData })
    })

    it('should convert CSV file to JSON', async () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)
      const testData = Buffer.from('csv content')
      const expectedJson = [{ row: 1 }]

      mockDownload.mockResolvedValue({
        readableStreamBody: createMockStream(testData)
      })
      mockIsExcel.mockReturnValue(false)
      mockIsCsv.mockReturnValue(true)
      mockConvertCsvToJson.mockResolvedValue(expectedJson)

      const result = await service.downloadBlobAsJson('test.csv')

      expect(result).toEqual(expectedJson)
      expect(mockConvertCsvToJson).toHaveBeenCalledWith(testData)
    })

    it('should return buffer for non-Excel/CSV files', async () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)
      const testData = Buffer.from('pdf content')

      mockDownload.mockResolvedValue({
        readableStreamBody: createMockStream(testData)
      })
      mockIsExcel.mockReturnValue(false)
      mockIsCsv.mockReturnValue(false)

      const result = await service.downloadBlobAsJson('test.pdf')

      expect(result).toEqual(testData)
    })

    it('should throw error when conversion fails', async () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)
      mockDownload.mockRejectedValue(new Error('Download failed'))

      await expect(service.downloadBlobAsJson('test.xlsx')).rejects.toThrow(
        'Failed to download and convert blob: Failed to download blob: Download failed'
      )
    })
  })

  describe('checkContainerExists', () => {
    it('should return true when container exists', async () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)
      mockExists.mockResolvedValue(true)

      const result = await service.checkContainerExists()

      expect(result).toBe(true)
      expect(mockGetContainerClient).toHaveBeenCalledWith('test-container')
    })

    it('should return false when container does not exist', async () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)
      mockExists.mockResolvedValue(false)

      const result = await service.checkContainerExists()

      expect(result).toBe(false)
    })

    it('should throw error when check fails', async () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)
      mockExists.mockRejectedValue(new Error('Connection failed'))

      await expect(service.checkContainerExists()).rejects.toThrow(
        'Failed to check container existence: Connection failed'
      )
    })
  })

  describe('getBlobNameFromUrl', () => {
    it('should extract blob name from full URL', () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)
      const fullUrl = `${TEST_URLS.BLOB_SERVICE}/test-container/folder/blob.xlsx`

      const result = service.getBlobNameFromUrl(fullUrl)

      expect(result).toBe('folder/blob.xlsx')
    })

    it('should return blob name as-is if not a full URL', () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)

      const result = service.getBlobNameFromUrl('simple-blob.xlsx')

      expect(result).toBe('simple-blob.xlsx')
    })

    it('should throw error for URL from different account', () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)

      expect(() =>
        service.getBlobNameFromUrl(
          'https://other.blob.core.windows.net/container/blob.xlsx'
        )
      ).toThrow('Invalid blob URL')
    })
  })

  describe('Azure credentials and proxy configuration', () => {
    it('should create BlobServiceClient with correct configuration', async () => {
      const service = createBlobStorageService(TEST_BLOB_CONFIG)
      mockDownload.mockResolvedValue({
        readableStreamBody: createMockStream(Buffer.from('test'))
      })

      await service.downloadBlob('test.xlsx')

      expect(mockGetAzureCredentials).toHaveBeenCalledWith(
        TEST_CREDENTIALS.TENANT_ID,
        TEST_CREDENTIALS.CLIENT_ID
      )
      expect(mockGetClientProxyOptions).toHaveBeenCalled()
      expect(BlobServiceClient).toHaveBeenCalledWith(
        TEST_URLS.BLOB_SERVICE,
        { type: 'credential' },
        {}
      )
    })
  })
})
