import { describe, it, expect, beforeEach, vi } from 'vitest'
import { STATUS_CODES } from './statuscodes.js'

// Mock sendMessageToQueue - must declare before vi.mock
const mockSendMessageToQueue = vi.fn()
vi.mock('../services/trade-service-bus-service.js', () => ({
  sendMessageToQueue: mockSendMessageToQueue
}))

// Import after mocks
const { sendtoqueue } = await import('./trade-service-bus.js')

// Test constants
const ERROR_MESSAGES = {
  FAILED_SEND: 'Failed to send message to queue',
  ERROR_SENDING: 'Error sending message:'
}

describe('trade-service-bus routes', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    vi.clearAllMocks()

    mockRequest = {
      logger: {
        error: vi.fn()
      }
    }

    mockH = {
      response: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis()
    }
  })

  describe('sendtoqueue', () => {
    it('should have correct route configuration', () => {
      expect(sendtoqueue.method).toBe('GET')
      expect(sendtoqueue.path).toBe('/trade-service-bus')
      expect(sendtoqueue.handler).toBeDefined()
      expect(typeof sendtoqueue.handler).toBe('function')
    })

    it('should send message to queue and return success', async () => {
      mockSendMessageToQueue.mockResolvedValue(undefined)

      const result = await sendtoqueue.handler(mockRequest, mockH)

      expect(mockSendMessageToQueue).toHaveBeenCalledWith({
        text: 'Hello, Service Bus!'
      })
      expect(mockH.response).toHaveBeenCalledWith('Success')
      expect(mockH.code).toHaveBeenCalledWith(STATUS_CODES.OK)
      expect(result).toBe(mockH)
    })

    it('should return error response when sending fails', async () => {
      const error = new Error('Queue send failed')
      mockSendMessageToQueue.mockRejectedValue(error)

      const result = await sendtoqueue.handler(mockRequest, mockH)

      expect(mockRequest.logger.error).toHaveBeenCalledWith(
        {
          error: {
            message: error.message,
            stack_trace: error.stack,
            type: error.name
          }
        },
        'Error sending message to Service Bus queue'
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.FAILED_SEND
      })
      expect(mockH.code).toHaveBeenCalledWith(
        STATUS_CODES.INTERNAL_SERVER_ERROR
      )
      expect(result).toBe(mockH)
    })

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Operation timeout')
      mockSendMessageToQueue.mockRejectedValue(timeoutError)

      const result = await sendtoqueue.handler(mockRequest, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.FAILED_SEND
      })
      expect(mockH.code).toHaveBeenCalledWith(
        STATUS_CODES.INTERNAL_SERVER_ERROR
      )
      expect(result).toBe(mockH)
    })

    it('should handle authentication errors', async () => {
      const authError = new Error('Authentication failed')
      mockSendMessageToQueue.mockRejectedValue(authError)

      const result = await sendtoqueue.handler(mockRequest, mockH)

      expect(mockRequest.logger.error).toHaveBeenCalledWith(
        {
          error: {
            message: authError.message,
            stack_trace: authError.stack,
            type: authError.name
          }
        },
        'Error sending message to Service Bus queue'
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.FAILED_SEND
      })
      expect(mockH.code).toHaveBeenCalledWith(
        STATUS_CODES.INTERNAL_SERVER_ERROR
      )
      expect(result).toBe(mockH)
    })
  })
})
