import { describe, it, expect, beforeEach, vi } from 'vitest'
import { connectivityCheck } from './connectivity-check.js'
import { listS3Objects } from '../services/s3-service.js'
import {
  bearerTokenRequest,
  checkDynamicsDispatchLocationConnection
} from '../services/dynamics-service.js'
import { checkApplicationFormsContainerExists } from '../services/ehco-blob-storage-service.js'
import { STATUS_CODES } from './statuscodes.js'

// Mock services before importing the route
vi.mock('../services/s3-service.js', () => ({
  listS3Objects: vi.fn()
}))

vi.mock('../services/dynamics-service.js', () => ({
  bearerTokenRequest: vi.fn(),
  checkDynamicsDispatchLocationConnection: vi.fn()
}))

vi.mock('../services/ehco-blob-storage-service.js', () => ({
  checkApplicationFormsContainerExists: vi.fn()
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
  EHCO_BLOB_STORAGE: 'ehcoBlobStorage'
}

const ROUTE_CONFIG = {
  METHOD: 'GET',
  PATH: '/connectivity-check'
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

    await connectivityCheck.handler({}, mockH)

    expect(listS3Objects).toHaveBeenCalledTimes(1)
    expect(bearerTokenRequest).toHaveBeenCalledTimes(1)
    expect(checkDynamicsDispatchLocationConnection).toHaveBeenCalledTimes(1)
    expect(checkApplicationFormsContainerExists).toHaveBeenCalledTimes(1)
    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.PASSED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: true,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: true,
        [SERVICE_NAMES.DYNAMICS_DATA]: true,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
  })

  it('should return failure with details when s3 fails', async () => {
    const mockError = new Error('S3 down')
    listS3Objects.mockRejectedValue(mockError)
    bearerTokenRequest.mockResolvedValue({})
    checkDynamicsDispatchLocationConnection.mockResolvedValue({})
    checkApplicationFormsContainerExists.mockResolvedValue(true)

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: false,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: true,
        [SERVICE_NAMES.DYNAMICS_DATA]: true,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })

  it('should return failure with details when dynamics login fails', async () => {
    const mockError = new Error('Auth failed')
    listS3Objects.mockResolvedValue([])
    bearerTokenRequest.mockRejectedValue(mockError)
    checkDynamicsDispatchLocationConnection.mockResolvedValue({})
    checkApplicationFormsContainerExists.mockResolvedValue(true)

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: true,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: false,
        [SERVICE_NAMES.DYNAMICS_DATA]: true,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })

  it('should return failure with details when dynamics data fetch fails', async () => {
    const mockError = new Error('Data fetch failed')
    listS3Objects.mockResolvedValue([])
    bearerTokenRequest.mockResolvedValue({})
    checkDynamicsDispatchLocationConnection.mockRejectedValue(mockError)
    checkApplicationFormsContainerExists.mockResolvedValue(true)

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: true,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: true,
        [SERVICE_NAMES.DYNAMICS_DATA]: false,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })

  it('should return failure when multiple services fail', async () => {
    listS3Objects.mockRejectedValue(new Error('S3 down'))
    bearerTokenRequest.mockRejectedValue(new Error('Auth failed'))
    checkDynamicsDispatchLocationConnection.mockResolvedValue({})
    checkApplicationFormsContainerExists.mockResolvedValue(true)

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: false,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: false,
        [SERVICE_NAMES.DYNAMICS_DATA]: true,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })

  it('should return failure when EHCO Blob Storage fails', async () => {
    const mockError = new Error('Blob storage unavailable')
    listS3Objects.mockResolvedValue([])
    bearerTokenRequest.mockResolvedValue({})
    checkDynamicsDispatchLocationConnection.mockResolvedValue({})
    checkApplicationFormsContainerExists.mockRejectedValue(mockError)

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: true,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: true,
        [SERVICE_NAMES.DYNAMICS_DATA]: true,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: false
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })

  it('should return failure when all services fail', async () => {
    listS3Objects.mockRejectedValue(new Error('S3 down'))
    bearerTokenRequest.mockRejectedValue(new Error('Auth failed'))
    checkDynamicsDispatchLocationConnection.mockRejectedValue(
      new Error('Data error')
    )
    checkApplicationFormsContainerExists.mockRejectedValue(
      new Error('Blob error')
    )

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      [RESPONSE_PROPERTIES.MESSAGE]: RESPONSE_MESSAGES.FAILED,
      [RESPONSE_PROPERTIES.DETAILS]: {
        [SERVICE_NAMES.S3]: false,
        [SERVICE_NAMES.DYNAMICS_LOGIN]: false,
        [SERVICE_NAMES.DYNAMICS_DATA]: false,
        [SERVICE_NAMES.EHCO_BLOB_STORAGE]: false
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })
})
