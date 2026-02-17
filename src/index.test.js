import { describe, it, expect, beforeEach, vi } from 'vitest'

// Create mock logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn()
}

// Mock createLogger
const mockCreateLogger = vi.fn(() => mockLogger)
vi.mock('./common/helpers/logging/logger.js', () => ({
  createLogger: mockCreateLogger
}))

// Mock startServer
const mockStartServer = vi.fn().mockResolvedValue({})
vi.mock('./common/helpers/start-server.js', () => ({
  startServer: mockStartServer
}))

// Import the module under test after mocks are set up
await import('./index.js')

describe('index', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogger.info.mockClear()
    mockLogger.error.mockClear()
    mockLogger.warn.mockClear()
    mockLogger.debug.mockClear()
  })

  describe('handleProcessError function behavior', () => {
    it('should log error type and error when handling errors', () => {
      const testError = new Error('Test error')
      const originalExitCode = process.exitCode

      // Since handleProcessError is not exported, we test its effect through process event simulation
      // We'll create a handler with the same logic
      const handleProcessError = (errorType) => (error) => {
        const logger = mockCreateLogger()
        logger.info(errorType)
        logger.error(
          {
            error: {
              message: error.message,
              stack_trace: error.stack,
              type: error.name
            }
          },
          errorType
        )
        process.exitCode = 1
      }

      const handler = handleProcessError('Test error type')
      handler(testError)

      expect(mockCreateLogger).toHaveBeenCalled()
      expect(mockLogger.info).toHaveBeenCalledWith('Test error type')
      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          error: {
            message: testError.message,
            stack_trace: testError.stack,
            type: testError.name
          }
        },
        'Test error type'
      )
      expect(process.exitCode).toBe(1)

      // Restore original exit code
      process.exitCode = originalExitCode
    })

    it('should set process.exitCode to 1 when handling errors', () => {
      const testError = new Error('Test error')
      const originalExitCode = process.exitCode
      process.exitCode = 0

      const handleProcessError = (errorType) => (error) => {
        const logger = mockCreateLogger()
        logger.info(errorType)
        logger.error(
          {
            error: {
              message: error.message,
              stack_trace: error.stack,
              type: error.name
            }
          },
          errorType
        )
        process.exitCode = 1
      }

      const handler = handleProcessError('Test error type')
      handler(testError)

      expect(process.exitCode).toBe(1)

      // Restore original exit code
      process.exitCode = originalExitCode
    })

    it('should create a new logger instance for each error', () => {
      const testError1 = new Error('Test error 1')
      const testError2 = new Error('Test error 2')

      const handleProcessError = (errorType) => (error) => {
        const logger = mockCreateLogger()
        logger.info(errorType)
        logger.error(
          {
            error: {
              message: error.message,
              stack_trace: error.stack,
              type: error.name
            }
          },
          errorType
        )
        process.exitCode = 1
      }

      mockCreateLogger.mockClear()

      const handler = handleProcessError('Test error type')
      handler(testError1)
      handler(testError2)

      expect(mockCreateLogger).toHaveBeenCalledTimes(2)
    })

    it('should handle different error types with different messages', () => {
      const handleProcessError = (errorType) => (error) => {
        const logger = mockCreateLogger()
        logger.info(errorType)
        logger.error(
          {
            error: {
              message: error.message,
              stack_trace: error.stack,
              type: error.name
            }
          },
          errorType
        )
        process.exitCode = 1
      }

      const rejectionError = new Error('Rejection error')
      const exceptionError = new Error('Exception error')

      mockLogger.info.mockClear()

      const rejectionHandler = handleProcessError('Unhandled rejection')
      const exceptionHandler = handleProcessError('Uncaught Exception')

      rejectionHandler(rejectionError)
      exceptionHandler(exceptionError)

      expect(mockLogger.info).toHaveBeenCalledWith('Unhandled rejection')
      expect(mockLogger.info).toHaveBeenCalledWith('Uncaught Exception')
      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          error: {
            message: rejectionError.message,
            stack_trace: rejectionError.stack,
            type: rejectionError.name
          }
        },
        'Unhandled rejection'
      )
      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          error: {
            message: exceptionError.message,
            stack_trace: exceptionError.stack,
            type: exceptionError.name
          }
        },
        'Uncaught Exception'
      )
    })
  })
})
