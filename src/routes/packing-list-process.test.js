import { describe, it, expect, beforeEach, vi } from 'vitest'
import { STATUS_CODES } from './statuscodes.js'
import { packingListProcessRoute } from './packing-list-process.js'
import { processPackingList } from '../services/packing-list-process-service.js'

// Mock the service - must be before imports
vi.mock('../services/packing-list-process-service.js', () => ({
  processPackingList: vi.fn()
}))

let mockRequest
let mockH
let mockResponse

function initialiseRouteTestContext() {
  mockResponse = {
    code: vi.fn().mockReturnThis()
  }
  mockH = {
    response: vi.fn().mockReturnValue(mockResponse)
  }
  mockRequest = {
    payload: {},
    query: {}
  }
}

function defineHandlerTests() {
  it('should return success response when processing succeeds', async () => {
    const mockMessage = {
      filename: 'test-packing-list.pdf',
      data: 'test-data'
    }
    const mockResult = {
      result: 'success',
      data: {
        parserModel: 'MODEL1',
        approvalStatus: 'approved',
        reasonsForFailure: []
      }
    }

    mockRequest.payload = mockMessage
    processPackingList.mockResolvedValue(mockResult)

    await packingListProcessRoute.handler(mockRequest, mockH)

    expect(processPackingList).toHaveBeenCalledWith(mockMessage, {
      stopDataExit: false
    })
    expect(mockH.response).toHaveBeenCalledWith({
      result: 'success',
      data: {
        parserModel: 'MODEL1',
        approvalStatus: 'approved',
        reasonsForFailure: []
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
  })

  it('should return error response when processing fails', async () => {
    const mockResult = {
      result: 'failure',
      error: 'Failed to process packing list'
    }

    processPackingList.mockResolvedValue(mockResult)

    await packingListProcessRoute.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      result: 'failure',
      error: 'Failed to process packing list'
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.INTERNAL_SERVER_ERROR
    )
  })

  it('should return bad request response when processing fails with client error', async () => {
    const mockResult = {
      result: 'failure',
      error: 'Validation failed: application_id must be a number',
      errorType: 'client'
    }

    processPackingList.mockResolvedValue(mockResult)

    await packingListProcessRoute.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith(mockResult)
    expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST)
  })

  it('should handle empty payload', async () => {
    const mockResult = {
      result: 'success',
      data: {
        parserModel: 'NOMATCH',
        approvalStatus: 'rejected_other',
        reasonsForFailure: []
      }
    }

    mockRequest.payload = {}
    processPackingList.mockResolvedValue(mockResult)

    await packingListProcessRoute.handler(mockRequest, mockH)

    expect(processPackingList).toHaveBeenCalledWith({}, { stopDataExit: false })
    expect(mockH.response).toHaveBeenCalledWith({
      result: 'success',
      data: {
        parserModel: 'NOMATCH',
        approvalStatus: 'rejected_other',
        reasonsForFailure: []
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
  })

  it('should handle service throwing generic error', async () => {
    const mockResult = {
      result: 'failure',
      error: 'Database connection failed'
    }

    processPackingList.mockResolvedValue(mockResult)

    await packingListProcessRoute.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      result: 'failure',
      error: 'Database connection failed'
    })
    expect(mockResponse.code).toHaveBeenCalledWith(
      STATUS_CODES.INTERNAL_SERVER_ERROR
    )
  })

  it('should pass through all payload properties to service', async () => {
    const mockMessage = {
      filename: 'complex-file.xlsx',
      data: 'base64-encoded-data',
      metadata: {
        source: 'test-source',
        timestamp: '2026-01-05T12:00:00Z'
      }
    }
    const mockResult = {
      result: 'success',
      data: {}
    }

    mockRequest.payload = mockMessage
    processPackingList.mockResolvedValue(mockResult)

    await packingListProcessRoute.handler(mockRequest, mockH)

    expect(processPackingList).toHaveBeenCalledWith(mockMessage, {
      stopDataExit: false
    })
    expect(processPackingList).toHaveBeenCalledTimes(1)
  })

  it('should pass stopDataExit=true when query parameter is set', async () => {
    const mockMessage = { filename: 'test.pdf' }
    const mockResult = {
      result: 'success',
      data: {}
    }

    mockRequest.payload = mockMessage
    mockRequest.query.stopDataExit = 'true'
    processPackingList.mockResolvedValue(mockResult)

    await packingListProcessRoute.handler(mockRequest, mockH)

    expect(processPackingList).toHaveBeenCalledWith(mockMessage, {
      stopDataExit: true
    })
    expect(mockH.response).toHaveBeenCalledWith(mockResult)
    expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
  })

  it('should pass stopDataExit=false when query parameter is not true', async () => {
    const mockMessage = { filename: 'test.pdf' }
    const mockResult = {
      result: 'success',
      data: {}
    }

    mockRequest.payload = mockMessage
    mockRequest.query.stopDataExit = 'false'
    processPackingList.mockResolvedValue(mockResult)

    await packingListProcessRoute.handler(mockRequest, mockH)

    expect(processPackingList).toHaveBeenCalledWith(mockMessage, {
      stopDataExit: false
    })
  })

  it('should pass stopDataExit=false when query parameter is not set', async () => {
    const mockMessage = { filename: 'test.pdf' }
    const mockResult = {
      result: 'success',
      data: {}
    }

    mockRequest.payload = mockMessage
    processPackingList.mockResolvedValue(mockResult)

    await packingListProcessRoute.handler(mockRequest, mockH)

    expect(processPackingList).toHaveBeenCalledWith(mockMessage, {
      stopDataExit: false
    })
  })
}

describe('Packing List Process Route', () => {
  beforeEach(() => {
    initialiseRouteTestContext()

    vi.clearAllMocks()
  })

  it('should have correct route configuration', () => {
    expect(packingListProcessRoute.method).toBe('POST')
    expect(packingListProcessRoute.path).toBe('/process-packing-list')
    expect(typeof packingListProcessRoute.handler).toBe('function')
  })

  describe('handler', () => {
    defineHandlerTests()
  })
})
