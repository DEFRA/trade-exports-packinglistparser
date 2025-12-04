import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock sendMessageToQueue - must declare before vi.mock
const mockSendMessageToQueue = vi.fn()
vi.mock('../services/trade-service-bus-service.js', () => ({
  sendMessageToQueue: mockSendMessageToQueue
}))

// Import after mocks
const { sendtoqueue } = await import('./trade-service-bus.js')

describe('trade-service-bus routes', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    vi.clearAllMocks()

    mockRequest = {}

    mockH = {
      response: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis()
    }

    // Mock console.error to avoid test output pollution
    vi.spyOn(console, 'error').mockImplementation(() => {})
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
      expect(mockH.code).toHaveBeenCalledWith(200)
      expect(result).toBe(mockH)
    })

    it('should return error response when sending fails', async () => {
      const error = new Error('Queue send failed')
      mockSendMessageToQueue.mockRejectedValue(error)

      const result = await sendtoqueue.handler(mockRequest, mockH)

      expect(console.error).toHaveBeenCalledWith(
        'Error sending message:',
        error
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to send message to queue'
      })
      expect(mockH.code).toHaveBeenCalledWith(500)
      expect(result).toBe(mockH)
    })

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Operation timeout')
      mockSendMessageToQueue.mockRejectedValue(timeoutError)

      const result = await sendtoqueue.handler(mockRequest, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to send message to queue'
      })
      expect(mockH.code).toHaveBeenCalledWith(500)
      expect(result).toBe(mockH)
    })

    it('should handle authentication errors', async () => {
      const authError = new Error('Authentication failed')
      mockSendMessageToQueue.mockRejectedValue(authError)

      const result = await sendtoqueue.handler(mockRequest, mockH)

      expect(console.error).toHaveBeenCalledWith(
        'Error sending message:',
        authError
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: 'Failed to send message to queue'
      })
      expect(mockH.code).toHaveBeenCalledWith(500)
      expect(result).toBe(mockH)
    })
  })
})
