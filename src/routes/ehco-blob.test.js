import { describe, it, expect, beforeEach, vi } from 'vitest'
import { STATUS_CODES } from './statuscodes.js'

// Mock functions - must be declared before vi.mock
const mockDownloadBlobFromApplicationForms = vi.fn()
const mockCheckApplicationFormsContainerExists = vi.fn()

vi.mock('../services/blob-storage/ehco-blob-storage-service.js', () => ({
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

// Test constants
const ERROR_MESSAGES = {
  FAILED_DOWNLOAD: 'Failed to download blob',
  ERROR_DOWNLOADING: 'Error downloading blob:'
}

// Helper functions to reduce code duplication
const setupSuccessfulDownload = (buffer) => {
  mockDownloadBlobFromApplicationForms.mockResolvedValue(buffer)
}

const setupFailedDownload = (error) => {
  mockDownloadBlobFromApplicationForms.mockRejectedValue(error)
}

const setupContainerCheck = (exists) => {
  mockCheckApplicationFormsContainerExists.mockResolvedValue(exists)
}

const setupFailedContainerCheck = (error) => {
  mockCheckApplicationFormsContainerExists.mockRejectedValue(error)
}

const expectSuccessResponse = (mockH, message = 'Success') => {
  expect(mockH.response).toHaveBeenCalledWith(message)
  expect(mockH.code).toHaveBeenCalledWith(STATUS_CODES.OK)
}

const expectErrorResponse = (
  mockH,
  errorMessage = ERROR_MESSAGES.FAILED_DOWNLOAD
) => {
  expect(mockH.response).toHaveBeenCalledWith({ error: errorMessage })
  expect(mockH.code).toHaveBeenCalledWith(STATUS_CODES.INTERNAL_SERVER_ERROR)
}

const expectErrorLogged = (mockRequest, error, blobName = null) => {
  const errorData = {
    error: {
      message: error.message,
      stack_trace: error.stack,
      type: error.name
    }
  }

  const expectedMessage = blobName
    ? `Error downloading blob from application forms (blobName: ${blobName})`
    : 'Error checking if application forms container exists'

  expect(mockRequest.logger.error).toHaveBeenCalledWith(
    errorData,
    expectedMessage
  )
}

const createErrorWithCode = (message, code) => {
  const error = new Error(message)
  error.code = code
  return error
}

const createErrorWithStatus = (message, statusCode) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

describe('EHCO Blob Routes', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    vi.clearAllMocks()

    mockRequest = {
      query: {
        blobname: 'test-file.pdf'
      },
      logger: {
        error: vi.fn()
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
      setupSuccessfulDownload(testBuffer)

      await getFileFromBlob.handler(mockRequest, mockH)

      expect(mockDownloadBlobFromApplicationForms).toHaveBeenCalledWith(
        'test-file.pdf'
      )
      expectSuccessResponse(mockH)
    })

    it('should handle blob name from query parameter', async () => {
      mockRequest.query.blobname = 'documents/report.xlsx'
      setupSuccessfulDownload(Buffer.from('excel content'))

      await getFileFromBlob.handler(mockRequest, mockH)

      expect(mockDownloadBlobFromApplicationForms).toHaveBeenCalledWith(
        'documents/report.xlsx'
      )
    })

    it('should return 500 when download fails', async () => {
      const error = new Error(ERROR_MESSAGES.FAILED_DOWNLOAD)
      setupFailedDownload(error)

      await getFileFromBlob.handler(mockRequest, mockH)

      expectErrorLogged(mockRequest, error, mockRequest.query.blobname)
      expectErrorResponse(mockH)
    })

    it('should handle network timeout errors', async () => {
      const timeoutError = createErrorWithCode('Request timeout', 'ETIMEDOUT')
      setupFailedDownload(timeoutError)

      await getFileFromBlob.handler(mockRequest, mockH)

      expectErrorLogged(mockRequest, timeoutError, mockRequest.query.blobname)
      expectErrorResponse(mockH)
    })

    it('should handle authentication errors', async () => {
      const authError = createErrorWithStatus(
        'Authentication failed',
        STATUS_CODES.UNAUTHORIZED
      )
      setupFailedDownload(authError)

      await getFileFromBlob.handler(mockRequest, mockH)

      expectErrorLogged(mockRequest, authError, mockRequest.query.blobname)
      expectErrorResponse(mockH)
    })

    it('should handle blob not found errors', async () => {
      const notFoundError = createErrorWithStatus(
        'BlobNotFound',
        STATUS_CODES.NOT_FOUND
      )
      setupFailedDownload(notFoundError)

      await getFileFromBlob.handler(mockRequest, mockH)

      expectErrorLogged(mockRequest, notFoundError, mockRequest.query.blobname)
      expectErrorResponse(mockH)
    })

    it('should handle different blob names with special characters', async () => {
      mockRequest.query.blobname = 'folder/sub-folder/file_name-123.pdf'
      setupSuccessfulDownload(Buffer.from('content'))

      await getFileFromBlob.handler(mockRequest, mockH)

      expect(mockDownloadBlobFromApplicationForms).toHaveBeenCalledWith(
        'folder/sub-folder/file_name-123.pdf'
      )
      expect(mockH.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })

    it('should handle empty blob name', async () => {
      mockRequest.query.blobname = ''
      setupSuccessfulDownload(Buffer.from(''))

      await getFileFromBlob.handler(mockRequest, mockH)

      expect(mockDownloadBlobFromApplicationForms).toHaveBeenCalledWith('')
    })

    it('should handle undefined blob name', async () => {
      mockRequest.query.blobname = undefined
      const error = new Error('Blob name is required')
      setupFailedDownload(error)

      await getFileFromBlob.handler(mockRequest, mockH)

      expect(mockDownloadBlobFromApplicationForms).toHaveBeenCalledWith(
        undefined
      )
      expect(mockH.code).toHaveBeenCalledWith(
        STATUS_CODES.INTERNAL_SERVER_ERROR
      )
    })
  })

  describe('GET /ehco-blob-forms-container', () => {
    it('should return 200 when container exists', async () => {
      setupContainerCheck(true)

      await formsContainerExists.handler(mockRequest, mockH)

      expect(mockCheckApplicationFormsContainerExists).toHaveBeenCalled()
      expectSuccessResponse(mockH, 'Success: true')
    })

    it('should return 200 when container does not exist', async () => {
      setupContainerCheck(false)

      await formsContainerExists.handler(mockRequest, mockH)

      expect(mockCheckApplicationFormsContainerExists).toHaveBeenCalled()
      expectSuccessResponse(mockH, 'Success: false')
    })

    it('should return 500 when check fails', async () => {
      const error = new Error('Failed to check container')
      setupFailedContainerCheck(error)

      await formsContainerExists.handler(mockRequest, mockH)

      expectErrorLogged(mockRequest, error)
      expectErrorResponse(mockH)
    })

    it('should handle network timeout errors', async () => {
      const timeoutError = createErrorWithCode('Request timeout', 'ETIMEDOUT')
      setupFailedContainerCheck(timeoutError)

      await formsContainerExists.handler(mockRequest, mockH)

      expectErrorLogged(mockRequest, timeoutError)
      expectErrorResponse(mockH)
    })

    it('should handle authentication errors', async () => {
      const authError = createErrorWithStatus(
        'Authentication failed',
        STATUS_CODES.UNAUTHORIZED
      )
      setupFailedContainerCheck(authError)

      await formsContainerExists.handler(mockRequest, mockH)

      expectErrorLogged(mockRequest, authError)
      expectErrorResponse(mockH)
    })
  })
})
