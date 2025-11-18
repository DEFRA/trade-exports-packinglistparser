import { describe, it, expect, beforeEach, vi } from 'vitest'
import { connectivityCheck } from './connectivity-check.js'
import { listS3Objects } from '../services/s3-service.js'
import { STATUS_CODES } from './statuscodes.js'

vi.mock('../services/s3-service.js', () => ({
  listS3Objects: vi.fn()
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
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should have correct route configuration', () => {
    expect(connectivityCheck.method).toBe('GET')
    expect(connectivityCheck.path).toBe('/connectivity-check')
    expect(typeof connectivityCheck.handler).toBe('function')
  })

  it('should return success when listS3Objects resolves', async () => {
    listS3Objects.mockResolvedValue([])

    await connectivityCheck.handler({}, mockH)

    expect(listS3Objects).toHaveBeenCalledTimes(1)
    expect(mockH.response).toHaveBeenCalledWith({
      Message: 'Connectivity Check Passed'
    })
    expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
  })

  it('should return failure when listS3Objects throws', async () => {
    const mockError = new Error('S3 down')
    listS3Objects.mockRejectedValue(mockError)

    await connectivityCheck.handler({}, mockH)

    expect(listS3Objects).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith(
      'Connectivity Check Error:',
      mockError
    )
    expect(mockH.response).toHaveBeenCalledWith({
      Message: 'Connectivity Check Failed',
      Error: mockError.message
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.INTERNAL_SERVER_ERROR
    )
  })
})
