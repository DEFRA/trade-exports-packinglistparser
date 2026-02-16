import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatError, logError } from './error-logger.js'

describe('error-logger', () => {
  describe('formatError', () => {
    it('should format error object with message, stack_trace, and type', () => {
      const error = new Error('Test error message')
      const result = formatError(error)

      expect(result).toEqual({
        error: {
          message: 'Test error message',
          stack_trace: error.stack,
          type: 'Error'
        }
      })
    })

    it('should return empty object when error is null', () => {
      const result = formatError(null)
      expect(result).toEqual({})
    })

    it('should return empty object when error is undefined', () => {
      const result = formatError(undefined)
      expect(result).toEqual({})
    })

    it('should handle custom error types', () => {
      const error = new TypeError('Type error message')
      const result = formatError(error)

      expect(result).toEqual({
        error: {
          message: 'Type error message',
          stack_trace: error.stack,
          type: 'TypeError'
        }
      })
    })

    it('should handle errors with custom properties', () => {
      const error = new Error('Custom error')
      error.code = 'CUSTOM_CODE'
      error.customProp = 'ignored'

      const result = formatError(error)

      expect(result).toEqual({
        error: {
          message: 'Custom error',
          stack_trace: error.stack,
          type: 'Error'
        }
      })
      // Custom properties are not included in the formatted output
      expect(result.error).not.toHaveProperty('code')
      expect(result.error).not.toHaveProperty('customProp')
    })
  })

  describe('logError', () => {
    let mockLogger

    beforeEach(() => {
      mockLogger = {
        error: vi.fn()
      }
    })

    it('should call logger.error with formatted error and message', () => {
      const error = new Error('Test error')
      const message = 'Error occurred during operation'

      logError(mockLogger, error, message)

      expect(mockLogger.error).toHaveBeenCalledOnce()
      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          error: {
            message: 'Test error',
            stack_trace: error.stack,
            type: 'Error'
          }
        },
        message
      )
    })

    it('should handle null error', () => {
      const message = 'Null error logged'

      logError(mockLogger, null, message)

      expect(mockLogger.error).toHaveBeenCalledOnce()
      expect(mockLogger.error).toHaveBeenCalledWith({}, message)
    })

    it('should handle undefined error', () => {
      const message = 'Undefined error logged'

      logError(mockLogger, undefined, message)

      expect(mockLogger.error).toHaveBeenCalledOnce()
      expect(mockLogger.error).toHaveBeenCalledWith({}, message)
    })

    it('should work with different error types', () => {
      const error = new RangeError('Out of range')
      const message = 'Range error occurred'

      logError(mockLogger, error, message)

      expect(mockLogger.error).toHaveBeenCalledOnce()
      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          error: {
            message: 'Out of range',
            stack_trace: error.stack,
            type: 'RangeError'
          }
        },
        message
      )
    })
  })
})
