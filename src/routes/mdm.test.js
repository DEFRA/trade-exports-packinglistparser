import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ineligibleItems } from './mdm.js'
import { getIneligibleItems } from '../services/mdm-service.js'
import { STATUS_CODES } from './statuscodes.js'

// Mock the service
vi.mock('../services/mdm-service.js', () => ({
  getIneligibleItems: vi.fn()
}))

// Test constants
const TEST_ITEMS = [
  { id: 1, name: 'Item 1', description: 'First ineligible item' },
  { id: 2, name: 'Item 2', description: 'Second ineligible item' },
  { id: 3, name: 'Item 3', description: 'Third ineligible item' }
]

const ROUTE_CONFIG = {
  METHOD: 'GET',
  PATH: '/mdm/ineligible-items'
}

const ERROR_MESSAGES = {
  DOWNLOAD_FAILED: 'Failed to download ineligible items',
  SERVICE_ERROR: 'Service error occurred'
}

describe('MDM Routes', () => {
  let mockH
  let mockResponse

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup mock response toolkit
    mockResponse = { code: vi.fn().mockReturnThis() }
    mockH = {
      response: vi.fn().mockReturnValue(mockResponse)
    }
  })

  describe('ineligibleItems route', () => {
    /**
     * Test: Verifies correct route configuration (method and path)
     */
    it('should have correct route configuration', () => {
      expect(ineligibleItems.method).toBe(ROUTE_CONFIG.METHOD)
      expect(ineligibleItems.path).toBe(ROUTE_CONFIG.PATH)
      expect(typeof ineligibleItems.handler).toBe('function')
    })

    /**
     * Test: Verifies successful retrieval and response of ineligible items
     */
    it('should return success response with items', async () => {
      getIneligibleItems.mockResolvedValue(TEST_ITEMS)

      await ineligibleItems.handler({}, mockH)

      expect(getIneligibleItems).toHaveBeenCalledTimes(1)
      expect(mockH.response).toHaveBeenCalledWith(
        `Success: ${JSON.stringify(TEST_ITEMS)} `
      )
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })

    /**
     * Test: Verifies handling of empty items array
     */
    it('should handle empty items array', async () => {
      getIneligibleItems.mockResolvedValue([])

      await ineligibleItems.handler({}, mockH)

      expect(getIneligibleItems).toHaveBeenCalledTimes(1)
      expect(mockH.response).toHaveBeenCalledWith('Success: [] ')
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })

    /**
     * Test: Verifies handling of single item response
     */
    it('should handle single item response', async () => {
      const singleItem = [TEST_ITEMS[0]]
      getIneligibleItems.mockResolvedValue(singleItem)

      await ineligibleItems.handler({}, mockH)

      expect(mockH.response).toHaveBeenCalledWith(
        `Success: ${JSON.stringify(singleItem)} `
      )
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })

    /**
     * Test: Verifies error handling when service throws an error
     */
    it('should return error response when service fails', async () => {
      const error = new Error(ERROR_MESSAGES.SERVICE_ERROR)
      getIneligibleItems.mockRejectedValue(error)

      // Spy on console.error
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await ineligibleItems.handler({}, mockH)

      expect(getIneligibleItems).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error downloading ineligible items:',
        error
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.DOWNLOAD_FAILED
      })
      expect(mockResponse.code).toHaveBeenCalledWith(
        STATUS_CODES.INTERNAL_SERVER_ERROR
      )

      consoleErrorSpy.mockRestore()
    })

    /**
     * Test: Verifies error handling for 404 Not Found errors
     */
    it('should handle 404 errors from service', async () => {
      const error = new Error('Not Found')
      error.status = 404
      getIneligibleItems.mockRejectedValue(error)

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await ineligibleItems.handler({}, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.DOWNLOAD_FAILED
      })
      expect(mockResponse.code).toHaveBeenCalledWith(
        STATUS_CODES.INTERNAL_SERVER_ERROR
      )

      consoleErrorSpy.mockRestore()
    })

    /**
     * Test: Verifies error handling for 401 Unauthorized errors
     */
    it('should handle 401 unauthorized errors from service', async () => {
      const error = new Error('Unauthorized')
      error.status = 401
      getIneligibleItems.mockRejectedValue(error)

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await ineligibleItems.handler({}, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.DOWNLOAD_FAILED
      })
      expect(mockResponse.code).toHaveBeenCalledWith(
        STATUS_CODES.INTERNAL_SERVER_ERROR
      )

      consoleErrorSpy.mockRestore()
    })

    /**
     * Test: Verifies error handling for network errors
     */
    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout')
      getIneligibleItems.mockRejectedValue(networkError)

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await ineligibleItems.handler({}, mockH)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error downloading ineligible items:',
        networkError
      )
      expect(mockH.response).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.DOWNLOAD_FAILED
      })
      expect(mockResponse.code).toHaveBeenCalledWith(
        STATUS_CODES.INTERNAL_SERVER_ERROR
      )

      consoleErrorSpy.mockRestore()
    })

    /**
     * Test: Verifies that request parameter is not used (handler uses _request)
     */
    it('should not use request parameter', async () => {
      getIneligibleItems.mockResolvedValue(TEST_ITEMS)

      const mockRequest = { query: { someParam: 'value' } }
      await ineligibleItems.handler(mockRequest, mockH)

      // Should still work regardless of request content
      expect(getIneligibleItems).toHaveBeenCalledTimes(1)
      expect(mockH.response).toHaveBeenCalled()
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })

    /**
     * Test: Verifies successful response includes properly formatted JSON string
     */
    it('should return properly formatted JSON string in success response', async () => {
      const complexItems = [
        {
          id: 1,
          name: 'Complex Item',
          nested: { prop: 'value' },
          array: [1, 2, 3]
        }
      ]
      getIneligibleItems.mockResolvedValue(complexItems)

      await ineligibleItems.handler({}, mockH)

      const expectedResponse = `Success: ${JSON.stringify(complexItems)} `
      expect(mockH.response).toHaveBeenCalledWith(expectedResponse)
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })

    /**
     * Test: Verifies handler always returns response (doesn't hang)
     */
    it('should always return a response', async () => {
      getIneligibleItems.mockResolvedValue(TEST_ITEMS)

      const result = await ineligibleItems.handler({}, mockH)

      // Should return the response with code method
      expect(result).toBe(mockResponse)
      expect(mockResponse.code).toHaveBeenCalled()
    })

    /**
     * Test: Verifies error response structure matches expected format
     */
    it('should return error response with correct structure', async () => {
      getIneligibleItems.mockRejectedValue(new Error('Test error'))

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await ineligibleItems.handler({}, mockH)

      expect(mockH.response).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String)
        })
      )

      consoleErrorSpy.mockRestore()
    })
  })
})
