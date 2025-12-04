import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock functions - must be declared before vi.mock
const mockDownloadBlobFromApplicationForms = vi.fn()
const mockCheckApplicationFormsContainerExists = vi.fn()

vi.mock('../services/ehco-blob-storage-service.js', () => ({
  downloadBlobFromApplicationForms: mockDownloadBlobFromApplicationForms,
  checkApplicationFormsContainerExists: mockCheckApplicationFormsContainerExists
}))

// Mock config
const mockConfigGet = vi.fn()
vi.mock('../config.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

// Mock logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn()
}
vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => mockLogger)
}))

// Import after all mocks
const { getFileFromBlob, formsContainerExists } = await import('./ehco-blob.js')

describe('EHCO Blob Routes', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    vi.clearAllMocks()

    // Console.error spy
    vi.spyOn(console, 'error').mockImplementation(() => {})

    mockRequest = {
      query: {
        blobname: 'test-file.pdf'
      }
    }

    mockH = {
      response: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis()
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Route configuration', () => {
    it('should have correct method and path for getFileFromBlob', () => {
      expect(getFileFromBlob.method).toBe('GET')
      expect(getFileFromBlob.path).toBe('/ehco-blob-forms')
      expect(typeof getFileFromBlob.handler).toBe('function')
    })

    it('should have correct method and path for formsContainerExists', () => {
      expect(formsContainerExists.method).toBe('GET')
      expect(formsContainerExists.path).toBe('/ehco-blob-forms-container')
      expect(typeof formsContainerExists.handler).toBe('function')
    })
  })

  describe('GET /ehco-blob-forms', () => {
    it('should download blob successfully and return 200', async () => {
      const testBuffer = Buffer.from('test file content')
      mockDownloadBlobFromApplicationForms.mockResolvedValue(testBuffer)

      await getFileFromBlob.handler(mockRequest, mockH)

      expect(mockDownloadBlobFromApplicationForms).toHaveBeenCalledWith(
        'test-file.pdf'
      )
      expect(mockH.response).toHaveBeenCalledWith('Success')
      expect(mockH.code).toHaveBeenCalledWith(200)
    })

    it('should handle blob name from query parameter', async () => {
      mockRequest.query.blobname = 'documents/report.xlsx'
      mockDownloadBlobFromApplicationForms.mockResolvedValue(
        Buffer.from('excel content')
      )

      await getFileFromBlob.handler(mockRequest, mockH)

      expect(mockDownloadBlobFromApplicationForms).toHaveBeenCalledWith(
        'documents/report.xlsx'
      )
    })

    it('should return 500 when download fails', async () => {
      const error = new Error('Failed to download blob')
      mockDownloadBlobFromApplicationForms.mockRejectedValue(error)

      await getFileFromBlob.handler(mockRequest, mockH)

      expect(console.error).toHaveBeenCalledWith(
        'Error downloading blob:',
        error
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to download blob'
      })
      expect(mockH.code).toHaveBeenCalledWith(500)
    })

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.code = 'ETIMEDOUT'
      mockDownloadBlobFromApplicationForms.mockRejectedValue(timeoutError)

      await getFileFromBlob.handler(mockRequest, mockH)

      expect(console.error).toHaveBeenCalledWith(
        'Error downloading blob:',
        timeoutError
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to download blob'
      })
      expect(mockH.code).toHaveBeenCalledWith(500)
    })

    it('should handle authentication errors', async () => {
      const authError = new Error('Authentication failed')
      authError.statusCode = 401
      mockDownloadBlobFromApplicationForms.mockRejectedValue(authError)

      await getFileFromBlob.handler(mockRequest, mockH)

      expect(console.error).toHaveBeenCalledWith(
        'Error downloading blob:',
        authError
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to download blob'
      })
      expect(mockH.code).toHaveBeenCalledWith(500)
    })

    it('should handle blob not found errors', async () => {
      const notFoundError = new Error('BlobNotFound')
      notFoundError.statusCode = 404
      mockDownloadBlobFromApplicationForms.mockRejectedValue(notFoundError)

      await getFileFromBlob.handler(mockRequest, mockH)

      expect(console.error).toHaveBeenCalledWith(
        'Error downloading blob:',
        notFoundError
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to download blob'
      })
      expect(mockH.code).toHaveBeenCalledWith(500)
    })

    it('should handle different blob names with special characters', async () => {
      mockRequest.query.blobname = 'folder/sub-folder/file_name-123.pdf'
      mockDownloadBlobFromApplicationForms.mockResolvedValue(
        Buffer.from('content')
      )

      await getFileFromBlob.handler(mockRequest, mockH)

      expect(mockDownloadBlobFromApplicationForms).toHaveBeenCalledWith(
        'folder/sub-folder/file_name-123.pdf'
      )
      expect(mockH.code).toHaveBeenCalledWith(200)
    })

    it('should handle empty blob name', async () => {
      mockRequest.query.blobname = ''
      mockDownloadBlobFromApplicationForms.mockResolvedValue(Buffer.from(''))

      await getFileFromBlob.handler(mockRequest, mockH)

      expect(mockDownloadBlobFromApplicationForms).toHaveBeenCalledWith('')
    })

    it('should handle undefined blob name', async () => {
      mockRequest.query.blobname = undefined
      const error = new Error('Blob name is required')
      mockDownloadBlobFromApplicationForms.mockRejectedValue(error)

      await getFileFromBlob.handler(mockRequest, mockH)

      expect(mockDownloadBlobFromApplicationForms).toHaveBeenCalledWith(
        undefined
      )
      expect(mockH.code).toHaveBeenCalledWith(500)
    })
  })

  describe('GET /ehco-blob-forms-container', () => {
    it('should return 200 when container exists', async () => {
      mockCheckApplicationFormsContainerExists.mockResolvedValue(true)

      await formsContainerExists.handler(mockRequest, mockH)

      expect(mockCheckApplicationFormsContainerExists).toHaveBeenCalled()
      expect(mockH.response).toHaveBeenCalledWith('Success: true')
      expect(mockH.code).toHaveBeenCalledWith(200)
    })

    it('should return 200 when container does not exist', async () => {
      mockCheckApplicationFormsContainerExists.mockResolvedValue(false)

      await formsContainerExists.handler(mockRequest, mockH)

      expect(mockCheckApplicationFormsContainerExists).toHaveBeenCalled()
      expect(mockH.response).toHaveBeenCalledWith('Success: false')
      expect(mockH.code).toHaveBeenCalledWith(200)
    })

    it('should return 500 when check fails', async () => {
      const error = new Error('Failed to check container')
      mockCheckApplicationFormsContainerExists.mockRejectedValue(error)

      await formsContainerExists.handler(mockRequest, mockH)

      expect(console.error).toHaveBeenCalledWith(
        'Error downloading blob:',
        error
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to download blob'
      })
      expect(mockH.code).toHaveBeenCalledWith(500)
    })

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.code = 'ETIMEDOUT'
      mockCheckApplicationFormsContainerExists.mockRejectedValue(timeoutError)

      await formsContainerExists.handler(mockRequest, mockH)

      expect(console.error).toHaveBeenCalledWith(
        'Error downloading blob:',
        timeoutError
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to download blob'
      })
      expect(mockH.code).toHaveBeenCalledWith(500)
    })

    it('should handle authentication errors', async () => {
      const authError = new Error('Authentication failed')
      authError.statusCode = 401
      mockCheckApplicationFormsContainerExists.mockRejectedValue(authError)

      await formsContainerExists.handler(mockRequest, mockH)

      expect(console.error).toHaveBeenCalledWith(
        'Error downloading blob:',
        authError
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to download blob'
      })
      expect(mockH.code).toHaveBeenCalledWith(500)
    })
  })
})
