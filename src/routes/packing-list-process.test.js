import { describe, it, expect, beforeEach, vi } from 'vitest'
import { STATUS_CODES } from './statuscodes.js'
import { packingListProcessRoute } from './packing-list-process.js'
import { processPackingList } from '../services/packing-list-process-service.js'

// Mock the service - must be before imports
vi.mock('../services/packing-list-process-service.js', () => ({
  processPackingList: vi.fn()
}))

describe('Packing List Process Route', () => {
  let mockRequest
  let mockH
  let mockResponse

  beforeEach(() => {
    mockResponse = {
      code: vi.fn().mockReturnThis()
    }
    mockH = {
      response: vi.fn().mockReturnValue(mockResponse)
    }
    mockRequest = {
      payload: {}
    }

    vi.clearAllMocks()
  })

  it('should have correct route configuration', () => {
    expect(packingListProcessRoute.method).toBe('POST')
    expect(packingListProcessRoute.path).toBe('/process-packing-list')
    expect(typeof packingListProcessRoute.handler).toBe('function')
  })

  describe('handler', () => {
    it('should return success response when processing succeeds', async () => {
      const mockMessage = {
        filename: 'test-packing-list.pdf',
        data: 'test-data'
      }
      const mockResult = {
        parserModel: 'MODEL1',
        items: [{ description: 'Item 1' }],
        business_checks: {
          all_required_fields_present: true
        }
      }

      mockRequest.payload = mockMessage
      processPackingList.mockResolvedValue(mockResult)

      await packingListProcessRoute.handler(mockRequest, mockH)

      expect(processPackingList).toHaveBeenCalledWith(mockMessage)
      expect(mockH.response).toHaveBeenCalledWith(mockResult)
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })

    it('should return error response when processing fails', async () => {
      const errorMessage = 'Failed to process packing list'
      const error = new Error(errorMessage)

      processPackingList.mockRejectedValue(error)

      await packingListProcessRoute.handler(mockRequest, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        result: 'failure',
        error: errorMessage
      })
      expect(mockResponse.code).toHaveBeenCalledWith(
        STATUS_CODES.INTERNAL_SERVER_ERROR
      )
    })

    it('should handle empty payload', async () => {
      const mockResult = {
        parserModel: 'NOMATCH',
        items: [],
        business_checks: {
          all_required_fields_present: false
        }
      }

      mockRequest.payload = {}
      processPackingList.mockResolvedValue(mockResult)

      await packingListProcessRoute.handler(mockRequest, mockH)

      expect(processPackingList).toHaveBeenCalledWith({})
      expect(mockH.response).toHaveBeenCalledWith(mockResult)
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })

    it('should handle service throwing generic error', async () => {
      const error = new Error('Database connection failed')

      processPackingList.mockRejectedValue(error)

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
      const mockResult = { success: true }

      mockRequest.payload = mockMessage
      processPackingList.mockResolvedValue(mockResult)

      await packingListProcessRoute.handler(mockRequest, mockH)

      expect(processPackingList).toHaveBeenCalledWith(mockMessage)
      expect(processPackingList).toHaveBeenCalledTimes(1)
    })
  })
})
