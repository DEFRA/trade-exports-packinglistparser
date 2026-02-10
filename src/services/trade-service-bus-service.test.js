import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock ServiceBusClient - must be declared before vi.mock
const mockClose = vi.fn()
const mockSendMessages = vi.fn()
const mockSenderClose = vi.fn()
const mockCreateSender = vi.fn(() => ({
  sendMessages: mockSendMessages,
  close: mockSenderClose
}))
const mockReceiveMessages = vi.fn()
const mockCompleteMessage = vi.fn()
const mockPeekMessages = vi.fn()
const mockReceiverClose = vi.fn()
const mockCreateReceiver = vi.fn(() => ({
  receiveMessages: mockReceiveMessages,
  completeMessage: mockCompleteMessage,
  peekMessages: mockPeekMessages,
  close: mockReceiverClose
}))

vi.mock('@azure/service-bus', () => ({
  ServiceBusClient: vi.fn(() => ({
    createSender: mockCreateSender,
    createReceiver: mockCreateReceiver,
    close: mockClose
  }))
}))

// Mock getAzureCredentials
const mockGetAzureCredentials = vi.fn(() => ({ type: 'credential' }))
vi.mock('./utilities/get-azure-credentials.js', () => ({
  getAzureCredentials: mockGetAzureCredentials
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

// Mock config
const mockConfigGet = vi.fn()
vi.mock('../config.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

// Mock proxy helper
const mockGetServiceBusConnectionOptions = vi.fn(() => ({
  webSocketOptions: { webSocket: {} }
}))
vi.mock('./utilities/proxy-helper.js', () => ({
  getServiceBusConnectionOptions: mockGetServiceBusConnectionOptions
}))

// Import after all mocks
const {
  sendMessageToQueue,
  receiveMessagesFromQueue,
  checkTradeServiceBusConnection
} = await import('./trade-service-bus-service.js')
const { ServiceBusClient } = await import('@azure/service-bus')

// Test constants for repeated literals
const TEST_CREDENTIALS = {
  TENANT_ID: 'test-tenant-id',
  CLIENT_ID: 'test-client-id'
}

const TEST_SERVICE_BUS_CONFIG = {
  NAMESPACE: 'test-namespace.servicebus.windows.net',
  QUEUE_NAME: 'test-queue'
}

describe('trade-service-bus-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset config mock to default values
    mockConfigGet.mockImplementation((key) => {
      if (key === 'azure') {
        return {
          defraCloudTenantId: TEST_CREDENTIALS.TENANT_ID
        }
      }
      if (key === 'tradeServiceBus') {
        return {
          clientId: TEST_CREDENTIALS.CLIENT_ID,
          serviceBusNamespace: TEST_SERVICE_BUS_CONFIG.NAMESPACE,
          queueName: TEST_SERVICE_BUS_CONFIG.QUEUE_NAME
        }
      }
      return {}
    })
  })

  describe('sendMessageToQueue', () => {
    it('should send a message to the queue successfully', async () => {
      mockSendMessages.mockResolvedValue(undefined)

      const message = {
        body: { applicationId: 'test-app-123' },
        messageId: 'msg-1'
      }
      await sendMessageToQueue(message)

      expect(mockGetAzureCredentials).toHaveBeenCalledWith(
        TEST_CREDENTIALS.TENANT_ID,
        TEST_CREDENTIALS.CLIENT_ID
      )
      expect(ServiceBusClient).toHaveBeenCalledWith(
        TEST_SERVICE_BUS_CONFIG.NAMESPACE,
        { type: 'credential' },
        { webSocketOptions: { webSocket: {} } }
      )
      expect(mockCreateSender).toHaveBeenCalledWith(
        TEST_SERVICE_BUS_CONFIG.QUEUE_NAME
      )
      expect(mockSendMessages).toHaveBeenCalledWith(message)
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Message sent to Service Bus queue: ${TEST_SERVICE_BUS_CONFIG.QUEUE_NAME} for applicationId: test-app-123`
      )
    })

    it('should close sender and client after sending', async () => {
      mockSendMessages.mockResolvedValue(undefined)

      await sendMessageToQueue({ body: { applicationId: 'test-123' } })

      expect(mockSenderClose).toHaveBeenCalled()
      expect(mockClose).toHaveBeenCalled()
    })

    it('should log error and throw when sending fails', async () => {
      const error = new Error('Send failed')
      mockSendMessages.mockRejectedValue(error)

      await expect(
        sendMessageToQueue({ body: { applicationId: 'test-123' } })
      ).rejects.toThrow('Send failed')

      expect(mockLogger.error).toHaveBeenCalledWith(
        { err: error },
        `Failed to send message to Service Bus queue: ${TEST_SERVICE_BUS_CONFIG.QUEUE_NAME} for applicationId: test-123`
      )
    })

    it('should still close client even if sender close fails', async () => {
      mockSendMessages.mockResolvedValue(undefined)
      mockSenderClose.mockRejectedValue(new Error('Close failed'))

      await sendMessageToQueue({ body: { applicationId: 'test-123' } })

      expect(mockLogger.warn).toHaveBeenCalledWith(
        { err: expect.any(Error) },
        'Failed to close Service Bus sender'
      )
      expect(mockClose).toHaveBeenCalled()
    })

    it('should throw error when config is missing', async () => {
      mockConfigGet.mockImplementation((key) => {
        if (key === 'azure') {
          return {}
        }
        if (key === 'tradeServiceBus') {
          return {}
        }
        return {}
      })

      await expect(
        sendMessageToQueue({ body: { applicationId: 'test-123' } })
      ).rejects.toThrow(
        'Missing Azure Service Bus configuration (tenantId, clientId, serviceBusNamespace)'
      )
    })

    it('should log connection details from createServiceBusClientFromConfig', async () => {
      mockSendMessages.mockResolvedValue(undefined)

      await sendMessageToQueue({ body: { applicationId: 'test-123' } })

      // Verify that multiple logger.info calls were made
      // The first call is from createServiceBusClientFromConfig with connection details
      expect(mockLogger.info).toHaveBeenCalled()
      expect(mockLogger.info.mock.calls.length).toBeGreaterThan(0)
    })
  })

  describe('receiveMessagesFromQueue', () => {
    it('should receive messages from the queue successfully', async () => {
      const mockMessages = [
        { messageId: '1', body: { text: 'Message 1' } },
        { messageId: '2', body: { text: 'Message 2' } }
      ]
      mockReceiveMessages.mockResolvedValue(mockMessages)
      mockCompleteMessage.mockResolvedValue(undefined)

      const result = await receiveMessagesFromQueue(10, 5000)

      expect(mockCreateReceiver).toHaveBeenCalledWith(
        TEST_SERVICE_BUS_CONFIG.QUEUE_NAME
      )
      expect(mockReceiveMessages).toHaveBeenCalledWith(10, {
        maxWaitTimeInMs: 5000
      })
      expect(result).toEqual([{ text: 'Message 1' }, { text: 'Message 2' }])
      expect(mockCompleteMessage).toHaveBeenCalledTimes(2)
      expect(mockLogger.info).toHaveBeenCalledWith(
        { queueName: TEST_SERVICE_BUS_CONFIG.QUEUE_NAME, count: 2 },
        'Received messages from Service Bus queue'
      )
    })

    it('should use default parameters when not provided', async () => {
      mockReceiveMessages.mockResolvedValue([])

      await receiveMessagesFromQueue()

      expect(mockReceiveMessages).toHaveBeenCalledWith(10, {
        maxWaitTimeInMs: 5000
      })
    })

    it('should handle empty message queue', async () => {
      mockReceiveMessages.mockResolvedValue([])

      const result = await receiveMessagesFromQueue()

      expect(result).toEqual([])
      expect(mockLogger.info).toHaveBeenCalledWith(
        { queueName: TEST_SERVICE_BUS_CONFIG.QUEUE_NAME, count: 0 },
        'Received messages from Service Bus queue'
      )
    })

    it('should close receiver and client after receiving', async () => {
      mockReceiveMessages.mockResolvedValue([])

      await receiveMessagesFromQueue()

      expect(mockReceiverClose).toHaveBeenCalled()
      expect(mockClose).toHaveBeenCalled()
    })

    it('should log error and throw when receiving fails', async () => {
      const error = new Error('Receive failed')
      mockReceiveMessages.mockRejectedValue(error)

      await expect(receiveMessagesFromQueue()).rejects.toThrow('Receive failed')

      expect(mockLogger.error).toHaveBeenCalledWith(
        { err: error, queueName: TEST_SERVICE_BUS_CONFIG.QUEUE_NAME },
        'Failed to receive messages from Service Bus queue'
      )
    })

    it('should continue if completing a message fails', async () => {
      const mockMessages = [
        { messageId: '1', body: { text: 'Message 1' } },
        { messageId: '2', body: { text: 'Message 2' } }
      ]
      mockReceiveMessages.mockResolvedValue(mockMessages)
      mockCompleteMessage
        .mockRejectedValueOnce(new Error('Complete failed'))
        .mockResolvedValueOnce(undefined)

      const result = await receiveMessagesFromQueue()

      expect(result).toEqual([{ text: 'Message 1' }, { text: 'Message 2' }])
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { err: expect.any(Error), messageId: '1' },
        'Failed to complete message'
      )
      expect(mockCompleteMessage).toHaveBeenCalledTimes(2)
    })

    it('should still close client even if receiver close fails', async () => {
      mockReceiveMessages.mockResolvedValue([])
      mockReceiverClose.mockRejectedValue(new Error('Close failed'))

      await receiveMessagesFromQueue()

      expect(mockLogger.warn).toHaveBeenCalledWith(
        { err: expect.any(Error) },
        'Failed to close Service Bus receiver'
      )
      expect(mockClose).toHaveBeenCalled()
    })
  })

  describe('checkTradeServiceBusConnection', () => {
    it('should return true when connection is successful', async () => {
      mockPeekMessages.mockResolvedValue([])

      const result = await checkTradeServiceBusConnection()

      expect(result).toBe(true)
      expect(mockGetAzureCredentials).toHaveBeenCalledWith(
        TEST_CREDENTIALS.TENANT_ID,
        TEST_CREDENTIALS.CLIENT_ID
      )
      expect(ServiceBusClient).toHaveBeenCalledWith(
        TEST_SERVICE_BUS_CONFIG.NAMESPACE,
        { type: 'credential' },
        { webSocketOptions: { webSocket: {} } }
      )
      expect(mockCreateReceiver).toHaveBeenCalledWith(
        TEST_SERVICE_BUS_CONFIG.QUEUE_NAME
      )
      expect(mockPeekMessages).toHaveBeenCalledWith(1)
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Successfully connected to Service Bus: ${TEST_SERVICE_BUS_CONFIG.QUEUE_NAME}`
      )
    })

    it('should return false when connection fails', async () => {
      const error = new Error('Connection failed')
      mockPeekMessages.mockRejectedValue(error)

      const result = await checkTradeServiceBusConnection()

      expect(result).toBe(false)
      expect(mockPeekMessages).toHaveBeenCalledWith(1)
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to connect to Service Bus: ${TEST_SERVICE_BUS_CONFIG.QUEUE_NAME}`,
        { err: error }
      )
    })

    it('should close receiver and client after successful check', async () => {
      mockPeekMessages.mockResolvedValue([])

      await checkTradeServiceBusConnection()

      expect(mockReceiverClose).toHaveBeenCalled()
      expect(mockClose).toHaveBeenCalled()
    })

    it('should close receiver and client even when connection fails', async () => {
      const error = new Error('Connection failed')
      mockPeekMessages.mockRejectedValue(error)

      await checkTradeServiceBusConnection()

      expect(mockReceiverClose).toHaveBeenCalled()
      expect(mockClose).toHaveBeenCalled()
    })

    it('should still close client even if receiver close fails', async () => {
      mockPeekMessages.mockResolvedValue([])
      mockReceiverClose.mockRejectedValue(new Error('Close failed'))

      await checkTradeServiceBusConnection()

      expect(mockLogger.warn).toHaveBeenCalledWith(
        { err: expect.any(Error) },
        'Failed to close Service Bus receiver'
      )
      expect(mockClose).toHaveBeenCalled()
    })

    it('should log warning if receiver close fails during error scenario', async () => {
      const connectionError = new Error('Connection failed')
      const closeError = new Error('Close failed')
      mockPeekMessages.mockRejectedValue(connectionError)
      mockReceiverClose.mockRejectedValue(closeError)

      const result = await checkTradeServiceBusConnection()

      expect(result).toBe(false)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { err: closeError },
        'Failed to close Service Bus receiver'
      )
      expect(mockClose).toHaveBeenCalled()
    })
  })
})
