import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the blob-storage-service module
const mockCheckContainerExists = vi.fn()
const mockCreateBlobStorageService = vi.fn(() => ({
  checkContainerExists: mockCheckContainerExists
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
const { checkTdsContainerExists } = await import(
  './tds-blob-storage-service.js'
)

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
})
