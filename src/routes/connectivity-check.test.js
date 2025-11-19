import { describe, it, expect, beforeEach, vi } from 'vitest'
import { connectivityCheck } from './connectivity-check.js'
import { listS3Objects } from '../services/s3-service.js'
import {
  bearerTokenRequest,
  checkDynamicsDispatchLocationConnection
} from '../services/dynamics-service.js'
import { STATUS_CODES } from './statuscodes.js'

// Mock services before importing the route
vi.mock('../services/s3-service.js', () => ({
  listS3Objects: vi.fn()
}))

vi.mock('../services/dynamics-service.js', () => ({
  bearerTokenRequest: vi.fn(),
  checkDynamicsDispatchLocationConnection: vi.fn()
}))

vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    error: vi.fn()
  }))
}))

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
    expect(connectivityCheck.method).toBe('GET')
    expect(connectivityCheck.path).toBe('/connectivity-check')
    expect(typeof connectivityCheck.handler).toBe('function')
  })

  it('should return success when all services are connected', async () => {
    listS3Objects.mockResolvedValue([])
    bearerTokenRequest.mockResolvedValue({})
    checkDynamicsDispatchLocationConnection.mockResolvedValue({})

    await connectivityCheck.handler({}, mockH)

    expect(listS3Objects).toHaveBeenCalledTimes(1)
    expect(bearerTokenRequest).toHaveBeenCalledTimes(1)
    expect(checkDynamicsDispatchLocationConnection).toHaveBeenCalledTimes(1)
    expect(mockH.response).toHaveBeenCalledWith({
      Message: 'Connectivity Check Passed',
      Details: {
        s3: true,
        dynamicsLogin: true,
        dynamicsData: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
  })

  it('should return failure with details when s3 fails', async () => {
    const mockError = new Error('S3 down')
    listS3Objects.mockRejectedValue(mockError)
    bearerTokenRequest.mockResolvedValue({})
    checkDynamicsDispatchLocationConnection.mockResolvedValue({})

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      Message: 'Connectivity Check Failed',
      Details: {
        s3: false,
        dynamicsLogin: true,
        dynamicsData: true
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

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      Message: 'Connectivity Check Failed',
      Details: {
        s3: true,
        dynamicsLogin: false,
        dynamicsData: true
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

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      Message: 'Connectivity Check Failed',
      Details: {
        s3: true,
        dynamicsLogin: true,
        dynamicsData: false
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

    await connectivityCheck.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      Message: 'Connectivity Check Failed',
      Details: {
        s3: false,
        dynamicsLogin: false,
        dynamicsData: true
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.SERVICE_UNAVAILABLE
    )
  })
})
