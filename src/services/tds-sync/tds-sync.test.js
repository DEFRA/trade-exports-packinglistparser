import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { syncToTds } from './tds-sync.js'

// Mock all dependencies before they're imported
vi.mock('../../common/helpers/stream-helpers.js', () => ({
  streamToBuffer: vi.fn()
}))

vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }))
}))

vi.mock('../blob-storage/tds-blob-storage-service.js', () => ({
  uploadToTdsBlob: vi.fn()
}))

vi.mock('../s3-service.js', () => ({
  listS3Objects: vi.fn(),
  getStreamFromS3: vi.fn(),
  deleteFileFromS3: vi.fn()
}))

vi.mock('../../config.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'tdsSync') {
        return {
          enabled: true,
          batchSize: 5
        }
      }
      if (key === 'packingList') {
        return {
          schemaVersion: 'v0.0'
        }
      }
      return {}
    })
  }
}))

// Import mocked functions after mocks are set up
const { streamToBuffer } = await import(
  '../../common/helpers/stream-helpers.js'
)
const { uploadToTdsBlob } = await import(
  '../blob-storage/tds-blob-storage-service.js'
)
const { listS3Objects, getStreamFromS3, deleteFileFromS3 } = await import(
  '../s3-service.js'
)
const { config } = await import('../../config.js')

// Helper to create a mock readable stream
function createMockStream(content) {
  const stream = {
    on: vi.fn((event, handler) => {
      if (event === 'data') {
        handler(Buffer.from(content))
      }
      if (event === 'end') {
        handler()
      }
      return stream
    })
  }
  return stream
}

// Test constants
const TEST_CONTENT = 'test content'
const EXPECTED_FILE_COUNT_THREE = 3
const EXPECTED_FILE_COUNT_SEVEN = 7
const BATCH_SIZE_TWO = 2

describe('tds-sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset config mock to default state
    config.get.mockImplementation((key) => {
      if (key === 'tdsSync') {
        return {
          enabled: true,
          batchSize: 5
        }
      }
      if (key === 'packingList') {
        return {
          schemaVersion: 'v0.0'
        }
      }
      return {}
    })

    // Mock streamToBuffer to convert stream content to buffer
    streamToBuffer.mockImplementation(async (stream) => {
      return new Promise((resolve) => {
        const chunks = []
        stream.on('data', (chunk) => chunks.push(chunk))
        stream.on('end', () => resolve(Buffer.concat(chunks)))
      })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('syncToTds - disabled state', () => {
    it('should skip sync when TDS sync is disabled', async () => {
      config.get.mockImplementation((key) => {
        if (key === 'tdsSync') {
          return { enabled: false }
        }
        if (key === 'packingList') {
          return { schemaVersion: 'v0.0' }
        }
        return {}
      })

      const result = await syncToTds()

      expect(result.success).toBe(false)
      expect(result.skipped).toBe(true)
      expect(result.reason).toBe('TDS synchronization is disabled')
      expect(listS3Objects).not.toHaveBeenCalled()
    })
  })

  describe('syncToTds - no files', () => {
    it('should handle empty S3 folder gracefully', async () => {
      listS3Objects.mockResolvedValueOnce({ Contents: [] })

      const result = await syncToTds()

      expect(result.success).toBe(true)
      expect(result.totalFiles).toBe(0)
      expect(result.successfulTransfers).toBe(0)
      expect(result.message).toBe('No files found to transfer')
      expect(uploadToTdsBlob).not.toHaveBeenCalled()
      expect(deleteFileFromS3).not.toHaveBeenCalled()
    })

    it('should handle S3 response with no Contents property', async () => {
      listS3Objects.mockResolvedValueOnce({})

      const result = await syncToTds()

      expect(result.success).toBe(true)
      expect(result.totalFiles).toBe(0)
      expect(result.message).toBe('No files found to transfer')
    })
  })

  describe('syncToTds - successful transfers', () => {
    it('should successfully transfer a single file from S3 to TDS', async () => {
      const testContent = JSON.stringify({ test: 'data' })
      const mockS3Response = {
        Body: createMockStream(testContent)
      }

      listS3Objects.mockResolvedValueOnce({
        Contents: [{ Key: 'tds-transfer/document1.json' }]
      })
      getStreamFromS3.mockResolvedValueOnce(mockS3Response)
      uploadToTdsBlob.mockResolvedValueOnce({
        ETag: '"abc123"',
        lastModified: new Date()
      })
      deleteFileFromS3.mockResolvedValueOnce({})

      const result = await syncToTds()

      expect(result.success).toBe(true)
      expect(result.totalFiles).toBe(1)
      expect(result.successfulTransfers).toBe(1)
      expect(result.failedTransfers).toBe(0)
      expect(result.transfers.successful).toHaveLength(1)
      expect(result.transfers.successful[0].blobName).toBe('document1.json')
      expect(uploadToTdsBlob).toHaveBeenCalledWith(
        'document1.json',
        expect.any(Buffer),
        { contentType: 'application/json' }
      )
      expect(deleteFileFromS3).toHaveBeenCalledWith(
        'tds-transfer/document1.json'
      )
    })

    it('should transfer multiple files in batches', async () => {
      const mockS3Response = {
        Body: createMockStream(TEST_CONTENT)
      }

      listS3Objects.mockResolvedValueOnce({
        Contents: [
          { Key: 'tds-transfer/file1.json' },
          { Key: 'tds-transfer/file2.json' },
          { Key: 'tds-transfer/file3.pdf' }
        ]
      })
      getStreamFromS3.mockResolvedValue(mockS3Response)
      uploadToTdsBlob.mockResolvedValue({ ETag: '"abc"' })
      deleteFileFromS3.mockResolvedValue({})

      const result = await syncToTds()

      expect(result.success).toBe(true)
      expect(result.totalFiles).toBe(EXPECTED_FILE_COUNT_THREE)
      expect(result.successfulTransfers).toBe(EXPECTED_FILE_COUNT_THREE)
      expect(result.failedTransfers).toBe(0)
      expect(uploadToTdsBlob).toHaveBeenCalledTimes(EXPECTED_FILE_COUNT_THREE)
      expect(deleteFileFromS3).toHaveBeenCalledTimes(EXPECTED_FILE_COUNT_THREE)
    })

    it('should process large volumes in batches to prevent resource exhaustion', async () => {
      const mockS3Response = {
        Body: createMockStream(TEST_CONTENT)
      }

      // Mock config with batchSize of 2
      config.get.mockImplementation((key) => {
        if (key === 'tdsSync') {
          return {
            enabled: true,
            batchSize: BATCH_SIZE_TWO
          }
        }
        if (key === 'packingList') {
          return {
            schemaVersion: 'v0.0'
          }
        }
        return {}
      })

      // Create 7 files (will need 4 batches: 2, 2, 2, 1)
      const files = Array.from(
        { length: EXPECTED_FILE_COUNT_SEVEN },
        (_, i) => ({
          Key: `tds-transfer/file${i + 1}.json`
        })
      )

      listS3Objects.mockResolvedValueOnce({ Contents: files })
      getStreamFromS3.mockResolvedValue(mockS3Response)
      uploadToTdsBlob.mockResolvedValue({ ETag: '"abc"' })
      deleteFileFromS3.mockResolvedValue({})

      const result = await syncToTds()

      expect(result.success).toBe(true)
      expect(result.totalFiles).toBe(EXPECTED_FILE_COUNT_SEVEN)
      expect(result.successfulTransfers).toBe(EXPECTED_FILE_COUNT_SEVEN)
      expect(result.failedTransfers).toBe(0)
      expect(uploadToTdsBlob).toHaveBeenCalledTimes(EXPECTED_FILE_COUNT_SEVEN)
      expect(deleteFileFromS3).toHaveBeenCalledTimes(EXPECTED_FILE_COUNT_SEVEN)
    })
  })

  describe('syncToTds - partial failures', () => {
    it('should handle individual file transfer failures', async () => {
      const mockS3Response = {
        Body: createMockStream('test content')
      }

      listS3Objects.mockResolvedValueOnce({
        Contents: [
          { Key: 'tds-transfer/success.json' },
          { Key: 'tds-transfer/failure.json' }
        ]
      })

      getStreamFromS3.mockResolvedValue(mockS3Response)
      uploadToTdsBlob
        .mockResolvedValueOnce({ ETag: '"abc"' })
        .mockRejectedValueOnce(new Error('Upload failed'))
      deleteFileFromS3.mockResolvedValue({})

      const result = await syncToTds()

      expect(result.success).toBe(false)
      expect(result.totalFiles).toBe(2)
      expect(result.successfulTransfers).toBe(1)
      expect(result.failedTransfers).toBe(1)
      expect(result.transfers.successful).toHaveLength(1)
      expect(result.transfers.failed).toHaveLength(1)
      expect(result.transfers.failed[0].error).toBe('Upload failed')
      expect(deleteFileFromS3).toHaveBeenCalledTimes(1) // Only for successful transfer
    })
  })

  describe('syncToTds - complete failures', () => {
    it('should handle S3 listing failure', async () => {
      listS3Objects.mockRejectedValueOnce(new Error('S3 connection failed'))

      const result = await syncToTds()

      expect(result.success).toBe(false)
      expect(result.error).toBe('S3 connection failed')
      expect(result.errorName).toBe('Error')
      expect(uploadToTdsBlob).not.toHaveBeenCalled()
    })
  })
})
