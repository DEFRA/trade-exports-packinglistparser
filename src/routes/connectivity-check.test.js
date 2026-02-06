import { describe, it, expect, beforeEach, vi } from 'vitest'
import { connectivityCheck } from './connectivity-check.js'
import { listS3Objects } from '../services/s3-service.js'
import {
  bearerTokenRequest,
  checkDynamicsDispatchLocationConnection
} from '../services/dynamics-service.js'
import { checkApplicationFormsContainerExists } from '../services/blob-storage/ehco-blob-storage-service.js'
import { checkTdsContainerExists } from '../services/blob-storage/tds-blob-storage-service.js'
import { getIneligibleItems } from '../services/mdm-service.js'
import { STATUS_CODES } from './statuscodes.js'
import { checkTradeServiceBusConnection } from '../services/trade-service-bus-service.js'

// Mock services before importing the route
vi.mock('../services/s3-service.js', () => ({
  listS3Objects: vi.fn()
}))

vi.mock('../services/trade-service-bus-service.js', () => ({
  checkTradeServiceBusConnection: vi.fn()
}))

vi.mock('../services/dynamics-service.js', () => ({
  bearerTokenRequest: vi.fn(),
  checkDynamicsDispatchLocationConnection: vi.fn()
}))

vi.mock('../services/blob-storage/ehco-blob-storage-service.js', () => ({
  checkApplicationFormsContainerExists: vi.fn()
}))

vi.mock('../services/blob-storage/tds-blob-storage-service.js', () => ({
  checkTdsContainerExists: vi.fn()
}))

vi.mock('../services/mdm-service.js', () => ({
  getIneligibleItems: vi.fn()
}))

vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    error: vi.fn()
  }))
}))

// Test constants
const RESPONSE_MESSAGES = {
  PASSED: 'Connectivity Check Passed',
  FAILED: 'Connectivity Check Failed'
}

const RESPONSE_PROPERTIES = {
  MESSAGE: 'Message',
  DETAILS: 'Details'
}

const SERVICE_NAMES = {
  S3: 's3',
  DYNAMICS_LOGIN: 'dynamicsLogin',
  DYNAMICS_DATA: 'dynamicsData',
  EHCO_BLOB_STORAGE: 'ehcoBlobStorage',
  TDS_BLOB_STORAGE: 'tdsBlobStorage',
  MDM_INELIGIBLE_ITEMS: 'mdmIneligibleItems',
  TRADE_SERVICE_BUS: 'tradeServiceBus'
}

const ROUTE_CONFIG = {
  METHOD: 'GET',
  PATH: '/connectivity-check'
}

const ERROR_MESSAGES = {
  S3_DOWN: 'S3 down',
  AUTH_FAILED: 'Auth failed',
  DATA_FETCH_FAILED: 'Data fetch failed',
  BLOB_STORAGE_UNAVAILABLE: 'Blob storage unavailable',
  DATA_ERROR: 'Data error',
  BLOB_ERROR: 'Blob error',
  MDM_ERROR: 'MDM error',
  MDM_SERVICE_UNAVAILABLE: 'MDM service unavailable',
  TRADE_SERVICE_BUS_ERROR: 'Trade Service Bus error'
}

describe('Connectivity Check Route', () => {
  let mockH
  let mockResponse

  beforeEach(() => {
    mockResponse = { code: vi.fn().mockReturnThis() }
    mockH = {
      response: vi.fn().mockReturnValue(mockResponse)
    }

    vi.clearAllMocks()
  })

  it('should have correct route configuration', () => {
    expect(connectivityCheck.method).toBe(ROUTE_CONFIG.METHOD)
    expect(connectivityCheck.path).toBe(ROUTE_CONFIG.PATH)
    expect(typeof connectivityCheck.handler).toBe('function')
  })

  it('should return success when all services are connected', async () => {
    listS3Objects.mockResolvedValue([])
    bearerTokenRequest.mockResolvedValue({})
    checkDynamicsDispatchLocationConnection.mockResolvedValue({})
    checkApplicationFormsContainerExists.mockResolvedValue(true)
    checkTdsContainerExists.mockResolvedValue(true)
    getIneligibleItems.mockResolvedValue([])
    checkTradeServiceBusConnection.mockResolvedValue(true)

    await connectivityCheck.handler({}, mockH)

    expect(listS3Objects).toHaveBeenCalledTimes(1)
    expect(bearerTokenRequest).toHaveBeenCalledTimes(1)
    expect(checkDynamicsDispatchLocationConnection).toHaveBeenCalledTimes(1)
    expect(checkApplicationFormsContainerExists).toHaveBeenCalledTimes(1)
    expect(checkTdsContainerExists).toHaveBeenCalledTimes(1)
    expect(getIneligibleItems).toHaveBeenCalledTimes(1)
    expect(checkTradeServiceBusConnection).toHaveBeenCalledTimes(1)
    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.PASSED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: true,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: true,
        [SERVICE_NAMES.DYNAMICS_DATA]: true,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true,
        [SERVICE_NAMES.TDS_BLOB_STORAGE]: true,
        [SERVICE_NAMES.MDM_INELIGIBLE_ITEMS]: true,
        [SERVICE_NAMES.TRADE_SERVICE_BUS]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
  })

  it('should return failure with details when s3 fails', async () => {
    const mockError = new Error(ERROR_MESSAGES.S3_DOWN)
    listS3Objects.mockRejectedValue(mockError)
    bearerTokenRequest.mockResolvedValue({})
    checkDynamicsDispatchLocationConnection.mockResolvedValue({})
    checkApplicationFormsContainerExists.mockResolvedValue(true)
    checkTdsContainerExists.mockResolvedValue(true)
    getIneligibleItems.mockResolvedValue([])
    checkTradeServiceBusConnection.mockResolvedValue(true)

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: false,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: true,
        [SERVICE_NAMES.DYNAMICS_DATA]: true,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true,
        [SERVICE_NAMES.TDS_BLOB_STORAGE]: true,
        [SERVICE_NAMES.MDM_INELIGIBLE_ITEMS]: true,
        [SERVICE_NAMES.TRADE_SERVICE_BUS]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })

  it('should return failure with details when dynamics login fails', async () => {
    const mockError = new Error(ERROR_MESSAGES.AUTH_FAILED)
    listS3Objects.mockResolvedValue([])
    bearerTokenRequest.mockRejectedValue(mockError)
    checkDynamicsDispatchLocationConnection.mockResolvedValue({})
    checkApplicationFormsContainerExists.mockResolvedValue(true)
    checkTdsContainerExists.mockResolvedValue(true)
    getIneligibleItems.mockResolvedValue([])
    checkTradeServiceBusConnection.mockResolvedValue(true)

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: true,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: false,
        [SERVICE_NAMES.DYNAMICS_DATA]: true,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true,
        [SERVICE_NAMES.TDS_BLOB_STORAGE]: true,
        [SERVICE_NAMES.MDM_INELIGIBLE_ITEMS]: true,
        [SERVICE_NAMES.TRADE_SERVICE_BUS]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })

  it('should return failure with details when dynamics data fetch fails', async () => {
    const mockError = new Error(ERROR_MESSAGES.DATA_FETCH_FAILED)
    listS3Objects.mockResolvedValue([])
    bearerTokenRequest.mockResolvedValue({})
    checkDynamicsDispatchLocationConnection.mockRejectedValue(mockError)
    checkApplicationFormsContainerExists.mockResolvedValue(true)
    checkTdsContainerExists.mockResolvedValue(true)
    getIneligibleItems.mockResolvedValue([])
    checkTradeServiceBusConnection.mockResolvedValue(true)

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: true,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: true,
        [SERVICE_NAMES.DYNAMICS_DATA]: false,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true,
        [SERVICE_NAMES.TDS_BLOB_STORAGE]: true,
        [SERVICE_NAMES.MDM_INELIGIBLE_ITEMS]: true,
        [SERVICE_NAMES.TRADE_SERVICE_BUS]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })

  it('should return failure when multiple services fail', async () => {
    listS3Objects.mockRejectedValue(new Error(ERROR_MESSAGES.S3_DOWN))
    bearerTokenRequest.mockRejectedValue(new Error(ERROR_MESSAGES.AUTH_FAILED))
    checkDynamicsDispatchLocationConnection.mockResolvedValue({})
    checkApplicationFormsContainerExists.mockResolvedValue(true)
    checkTdsContainerExists.mockResolvedValue(true)
    getIneligibleItems.mockResolvedValue([])
    checkTradeServiceBusConnection.mockResolvedValue(true)

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: false,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: false,
        [SERVICE_NAMES.DYNAMICS_DATA]: true,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true,
        [SERVICE_NAMES.TDS_BLOB_STORAGE]: true,
        [SERVICE_NAMES.MDM_INELIGIBLE_ITEMS]: true,
        [SERVICE_NAMES.TRADE_SERVICE_BUS]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })

  it('should return failure when EHCO Blob Storage fails', async () => {
    const mockError = new Error(ERROR_MESSAGES.BLOB_STORAGE_UNAVAILABLE)
    listS3Objects.mockResolvedValue([])
    bearerTokenRequest.mockResolvedValue({})
    checkDynamicsDispatchLocationConnection.mockResolvedValue({})
    checkApplicationFormsContainerExists.mockRejectedValue(mockError)
    checkTdsContainerExists.mockResolvedValue(true)
    getIneligibleItems.mockResolvedValue([])
    checkTradeServiceBusConnection.mockResolvedValue(true)

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: true,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: true,
        [SERVICE_NAMES.DYNAMICS_DATA]: true,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: false,
        [SERVICE_NAMES.TDS_BLOB_STORAGE]: true,
        [SERVICE_NAMES.MDM_INELIGIBLE_ITEMS]: true,
        [SERVICE_NAMES.TRADE_SERVICE_BUS]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })

  it('should return failure when TDS Blob Storage fails', async () => {
    const mockError = new Error(ERROR_MESSAGES.BLOB_STORAGE_UNAVAILABLE)
    listS3Objects.mockResolvedValue([])
    bearerTokenRequest.mockResolvedValue({})
    checkDynamicsDispatchLocationConnection.mockResolvedValue({})
    checkApplicationFormsContainerExists.mockResolvedValue(true)
    checkTdsContainerExists.mockRejectedValue(mockError)
    getIneligibleItems.mockResolvedValue([])
    checkTradeServiceBusConnection.mockResolvedValue(true)

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: true,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: true,
        [SERVICE_NAMES.DYNAMICS_DATA]: true,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true,
        [SERVICE_NAMES.TDS_BLOB_STORAGE]: false,
        [SERVICE_NAMES.MDM_INELIGIBLE_ITEMS]: true,
        [SERVICE_NAMES.TRADE_SERVICE_BUS]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })

  it('should return failure when Trade Service Bus fails', async () => {
    const mockError = new Error('Service Bus down')
    listS3Objects.mockResolvedValue([])
    bearerTokenRequest.mockResolvedValue({})
    checkDynamicsDispatchLocationConnection.mockResolvedValue({})
    checkApplicationFormsContainerExists.mockResolvedValue(true)
    checkTdsContainerExists.mockResolvedValue(true)
    getIneligibleItems.mockResolvedValue([])
    checkTradeServiceBusConnection.mockRejectedValue(mockError)

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: true,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: true,
        [SERVICE_NAMES.DYNAMICS_DATA]: true,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true,
        [SERVICE_NAMES.TDS_BLOB_STORAGE]: true,
        [SERVICE_NAMES.MDM_INELIGIBLE_ITEMS]: true,
        [SERVICE_NAMES.TRADE_SERVICE_BUS]: false
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })

  it('should return failure when all services fail', async () => {
    listS3Objects.mockRejectedValue(new Error(ERROR_MESSAGES.S3_DOWN))
    bearerTokenRequest.mockRejectedValue(new Error(ERROR_MESSAGES.AUTH_FAILED))
    checkDynamicsDispatchLocationConnection.mockRejectedValue(
      new Error(ERROR_MESSAGES.DATA_ERROR)
    )
    checkApplicationFormsContainerExists.mockRejectedValue(
      new Error(ERROR_MESSAGES.BLOB_ERROR)
    )
    checkTdsContainerExists.mockRejectedValue(
      new Error(ERROR_MESSAGES.BLOB_ERROR)
    )
    getIneligibleItems.mockRejectedValue(new Error(ERROR_MESSAGES.MDM_ERROR))
    checkTradeServiceBusConnection.mockRejectedValue(
      new Error(ERROR_MESSAGES.TRADE_SERVICE_BUS_ERROR)
    )

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: false,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: false,
        [SERVICE_NAMES.DYNAMICS_DATA]: false,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: false,
        [SERVICE_NAMES.TDS_BLOB_STORAGE]: false,
        [SERVICE_NAMES.MDM_INELIGIBLE_ITEMS]: false,
        [SERVICE_NAMES.TRADE_SERVICE_BUS]: false
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })

  it('should return failure when MDM service fails', async () => {
    const mockError = new Error(ERROR_MESSAGES.MDM_SERVICE_UNAVAILABLE)
    listS3Objects.mockResolvedValue([])
    bearerTokenRequest.mockResolvedValue({})
    checkDynamicsDispatchLocationConnection.mockResolvedValue({})
    checkApplicationFormsContainerExists.mockResolvedValue(true)
    checkTdsContainerExists.mockResolvedValue(true)
    getIneligibleItems.mockRejectedValue(mockError)
    checkTradeServiceBusConnection.mockResolvedValue(true)

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: true,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: true,
        [SERVICE_NAMES.DYNAMICS_DATA]: true,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true,
        [SERVICE_NAMES.TDS_BLOB_STORAGE]: true,
        [SERVICE_NAMES.MDM_INELIGIBLE_ITEMS]: false,
        [SERVICE_NAMES.TRADE_SERVICE_BUS]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })

  it('should return failure when a service times out after 10 seconds', async () => {
    vi.useFakeTimers()

    // Mock a service that takes longer than 10 seconds
    listS3Objects.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve([]), 15000)
        })
    )
    bearerTokenRequest.mockResolvedValue({})
    checkDynamicsDispatchLocationConnection.mockResolvedValue({})
    checkApplicationFormsContainerExists.mockResolvedValue(true)
    checkTdsContainerExists.mockResolvedValue(true)
    getIneligibleItems.mockResolvedValue([])
    checkTradeServiceBusConnection.mockResolvedValue(true)

    const handlerPromise = connectivityCheck.handler({}, mockH)

    // Fast-forward time to trigger timeout
    await vi.advanceTimersByTimeAsync(10000)

    await handlerPromise

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: false,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: true,
        [SERVICE_NAMES.DYNAMICS_DATA]: true,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true,
        [SERVICE_NAMES.TDS_BLOB_STORAGE]: true,
        [SERVICE_NAMES.MDM_INELIGIBLE_ITEMS]: true,
        [SERVICE_NAMES.TRADE_SERVICE_BUS]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )

    vi.useRealTimers()
  })

  it('should return failure when multiple services time out', async () => {
    vi.useFakeTimers()

    // Mock multiple services that take longer than 10 seconds
    listS3Objects.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve([]), 15000)
        })
    )
    bearerTokenRequest.mockResolvedValue({})
    checkDynamicsDispatchLocationConnection.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({}), 20000)
        })
    )
    checkApplicationFormsContainerExists.mockResolvedValue(true)
    checkTdsContainerExists.mockResolvedValue(true)
    getIneligibleItems.mockResolvedValue([])
    checkTradeServiceBusConnection.mockResolvedValue(true)

    const handlerPromise = connectivityCheck.handler({}, mockH)

    // Fast-forward time to trigger timeout
    await vi.advanceTimersByTimeAsync(10000)

    await handlerPromise

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: false,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: true,
        [SERVICE_NAMES.DYNAMICS_DATA]: false,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true,
        [SERVICE_NAMES.TDS_BLOB_STORAGE]: true,
        [SERVICE_NAMES.MDM_INELIGIBLE_ITEMS]: true,
        [SERVICE_NAMES.TRADE_SERVICE_BUS]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )

    vi.useRealTimers()
  })

  it('should return success when all services respond within 10 seconds', async () => {
    vi.useFakeTimers()

    // Mock services that respond within the timeout
    listS3Objects.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve([]), 5000)
        })
    )
    bearerTokenRequest.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({}), 3000)
        })
    )
    checkDynamicsDispatchLocationConnection.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({}), 4000)
        })
    )
    checkApplicationFormsContainerExists.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(true), 2000)
        })
    )
    checkTdsContainerExists.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(true), 2500)
        })
    )
    getIneligibleItems.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve([]), 1000)
        })
    )
    checkTradeServiceBusConnection.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(true), 3000)
        })
    )

    const handlerPromise = connectivityCheck.handler({}, mockH)

    // Fast-forward time but not enough to trigger timeout
    await vi.advanceTimersByTimeAsync(5000)

    await handlerPromise

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.PASSED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: true,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: true,
        [SERVICE_NAMES.DYNAMICS_DATA]: true,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true,
        [SERVICE_NAMES.TDS_BLOB_STORAGE]: true,
        [SERVICE_NAMES.MDM_INELIGIBLE_ITEMS]: true,
        [SERVICE_NAMES.TRADE_SERVICE_BUS]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)

    vi.useRealTimers()
  })
})
