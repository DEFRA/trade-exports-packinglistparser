import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  callAzureApiWithToken,
  callAzureApiJson,
  getIneligibleItems,
  getIsoCodes,
  postToAzureApi
} from './mdm-service.js'
import { STATUS_CODES } from '../routes/statuscodes.js'

// Mock dependencies
vi.mock('./utilities/get-azure-credentials.js', () => ({
  getAzureCredentials: vi.fn()
}))

vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }))
}))

vi.mock('../config.js', () => ({
  config: {
    get: vi.fn()
  }
}))

// Test constants
const TEST_CONFIG = {
  TENANT_ID: 'test-tenant-id',
  CLIENT_ID: 'test-client-id',
  SUBSCRIPTION_KEY: 'test-subscription-key',
  SCOPE: 'api://test-app-id/.default',
  ENDPOINT: 'https://test-apim.azure-api.net',
  INELIGIBLE_ITEMS_PATH: '/api/ineligible-items',
  ISO_CODES_PATH: '/api/iso-codes'
}

const TEST_TOKEN = 'test-access-token-12345'

const TEST_RESPONSE_DATA = {
  items: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ]
}

const ERROR_MESSAGES = {
  MISSING_CONFIG: 'Missing Azure configuration (defraCloudTenantId, clientId)',
  NO_TOKEN: 'Failed to obtain access token',
  API_FAILED: 'API call failed'
}

const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST'
}

const HEADER_NAMES = {
  AUTHORIZATION: 'Authorization',
  SUBSCRIPTION_KEY: 'Ocp-Apim-Subscription-Key',
  CONTENT_TYPE: 'Content-Type',
  CUSTOM_HEADER: 'X-Custom-Header',
  REQUEST_ID: 'X-Request-Id'
}

const CONTENT_TYPES = {
  JSON: 'application/json'
}

const TEST_VALUES = {
  CUSTOM_HEADER_VALUE: 'custom-value',
  REQUEST_ID_VALUE: 'test-123',
  NETWORK_ERROR: 'Network error',
  RESOURCE_NOT_FOUND: 'Resource not found',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  UNAUTHORIZED: 'Unauthorized',
  SERVICE_UNAVAILABLE: 'Service unavailable',
  BAD_REQUEST: 'Bad Request'
}

const TEST_PATHS = {
  TEST: '/test',
  API_ITEMS: '/api/items'
}

describe('mdm-service', () => {
  let mockGetAzureCredentials
  let mockConfig
  let mockCredential
  let mockFetch

  beforeEach(async () => {
    vi.clearAllMocks()

    // Setup config mock
    const configModule = await import('../config.js')
    mockConfig = configModule.config
    mockConfig.get.mockImplementation((key) => {
      if (key === 'azure') {
        return { defraCloudTenantId: TEST_CONFIG.TENANT_ID }
      }
      if (key === 'mdm') {
        return {
          clientId: TEST_CONFIG.CLIENT_ID,
          internalAPIMScope: TEST_CONFIG.SCOPE,
          subscriptionKey: TEST_CONFIG.SUBSCRIPTION_KEY,
          internalAPIMEndpoint: TEST_CONFIG.ENDPOINT,
          getIneligibleItemsEndpoint: TEST_CONFIG.INELIGIBLE_ITEMS_PATH,
          getIsoCodesEndpoint: TEST_CONFIG.ISO_CODES_PATH
        }
      }
      return {}
    })

    // Setup credentials mock
    const credentialsModule = await import(
      './utilities/get-azure-credentials.js'
    )
    mockGetAzureCredentials = credentialsModule.getAzureCredentials

    mockCredential = {
      getToken: vi.fn().mockResolvedValue({
        token: TEST_TOKEN,
        expiresOnTimestamp: Date.now() + 3600000
      })
    }
    mockGetAzureCredentials.mockReturnValue(mockCredential)

    // Setup fetch mock
    mockFetch = vi.fn()
    globalThis.fetch = mockFetch
  })

  describe('callAzureApiWithToken', () => {
    /**
     * Test: Verifies successful API call with proper token authentication and headers
     */
    it('should successfully call API with bearer token and subscription key', async () => {
      const mockResponse = {
        ok: true,
        status: STATUS_CODES.OK,
        json: vi.fn().mockResolvedValue(TEST_RESPONSE_DATA)
      }
      mockFetch.mockResolvedValue(mockResponse)

      const url = `${TEST_CONFIG.ENDPOINT}${TEST_PATHS.TEST}`
      const options = { method: HTTP_METHODS.GET }

      const response = await callAzureApiWithToken(url, options)

      expect(mockGetAzureCredentials).toHaveBeenCalledWith(
        TEST_CONFIG.TENANT_ID,
        TEST_CONFIG.CLIENT_ID
      )
      expect(mockCredential.getToken).toHaveBeenCalledWith(TEST_CONFIG.SCOPE)
      expect(mockFetch).toHaveBeenCalledWith(url, {
        method: HTTP_METHODS.GET,
        headers: {
          [HEADER_NAMES.AUTHORIZATION]: `Bearer ${TEST_TOKEN}`,
          [HEADER_NAMES.SUBSCRIPTION_KEY]: TEST_CONFIG.SUBSCRIPTION_KEY,
          [HEADER_NAMES.CONTENT_TYPE]: CONTENT_TYPES.JSON
        }
      })
      expect(response).toBe(mockResponse)
    })

    /**
     * Test: Verifies that custom headers are merged with default headers
     */
    it('should merge custom headers with default headers', async () => {
      const mockResponse = { ok: true, status: STATUS_CODES.OK }
      mockFetch.mockResolvedValue(mockResponse)

      const customHeaders = {
        [HEADER_NAMES.CUSTOM_HEADER]: TEST_VALUES.CUSTOM_HEADER_VALUE
      }
      await callAzureApiWithToken(`${TEST_CONFIG.ENDPOINT}${TEST_PATHS.TEST}`, {
        method: HTTP_METHODS.POST,
        headers: customHeaders
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            [HEADER_NAMES.AUTHORIZATION]: `Bearer ${TEST_TOKEN}`,
            [HEADER_NAMES.SUBSCRIPTION_KEY]: TEST_CONFIG.SUBSCRIPTION_KEY,
            [HEADER_NAMES.CONTENT_TYPE]: CONTENT_TYPES.JSON,
            [HEADER_NAMES.CUSTOM_HEADER]: TEST_VALUES.CUSTOM_HEADER_VALUE
          })
        })
      )
    })

    /**
     * Test: Verifies error handling when Azure configuration is missing
     */
    it('should throw error when Azure config is missing', async () => {
      mockConfig.get.mockImplementation((key) => {
        if (key === 'azure') {
          return {}
        }
        if (key === 'mdm') {
          return {
            clientId: TEST_CONFIG.CLIENT_ID,
            internalAPIMScope: TEST_CONFIG.SCOPE,
            subscriptionKey: TEST_CONFIG.SUBSCRIPTION_KEY
          }
        }
        return {}
      })

      await expect(
        callAzureApiWithToken(`${TEST_CONFIG.ENDPOINT}/test`, {
          method: 'GET'
        })
      ).rejects.toThrow(ERROR_MESSAGES.MISSING_CONFIG)
    })

    /**
     * Test: Verifies error handling when client ID is missing
     */
    it('should throw error when client ID is missing', async () => {
      mockConfig.get.mockImplementation((key) => {
        if (key === 'azure') {
          return { defraCloudTenantId: TEST_CONFIG.TENANT_ID }
        }
        if (key === 'mdm') {
          return {
            internalAPIMScope: TEST_CONFIG.SCOPE,
            subscriptionKey: TEST_CONFIG.SUBSCRIPTION_KEY
          }
        }
        return {}
      })

      await expect(
        callAzureApiWithToken(`${TEST_CONFIG.ENDPOINT}${TEST_PATHS.TEST}`, {
          method: HTTP_METHODS.GET
        })
      ).rejects.toThrow(ERROR_MESSAGES.MISSING_CONFIG)
    })

    /**
     * Test: Verifies error handling when token retrieval fails
     */
    it('should throw error when token retrieval fails', async () => {
      mockCredential.getToken.mockResolvedValue(null)

      await expect(
        callAzureApiWithToken(`${TEST_CONFIG.ENDPOINT}${TEST_PATHS.TEST}`, {
          method: HTTP_METHODS.GET
        })
      ).rejects.toThrow(ERROR_MESSAGES.NO_TOKEN)
    })

    /**
     * Test: Verifies error handling when token object has no token property
     */
    it('should throw error when token response has no token', async () => {
      mockCredential.getToken.mockResolvedValue({})

      await expect(
        callAzureApiWithToken(`${TEST_CONFIG.ENDPOINT}${TEST_PATHS.TEST}`, {
          method: HTTP_METHODS.GET
        })
      ).rejects.toThrow(ERROR_MESSAGES.NO_TOKEN)
    })

    /**
     * Test: Verifies error propagation when fetch fails
     */
    it('should propagate fetch errors', async () => {
      const fetchError = new Error(TEST_VALUES.NETWORK_ERROR)
      mockFetch.mockRejectedValue(fetchError)

      await expect(
        callAzureApiWithToken(`${TEST_CONFIG.ENDPOINT}${TEST_PATHS.TEST}`, {
          method: HTTP_METHODS.GET
        })
      ).rejects.toThrow(TEST_VALUES.NETWORK_ERROR)
    })

    /**
     * Test: Verifies that response is returned even for non-OK HTTP status
     */
    it('should return response even when status is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: STATUS_CODES.NOT_FOUND,
        statusText: 'Not Found'
      }
      mockFetch.mockResolvedValue(mockResponse)

      const response = await callAzureApiWithToken(
        `${TEST_CONFIG.ENDPOINT}${TEST_PATHS.TEST}`,
        { method: HTTP_METHODS.GET }
      )

      expect(response).toBe(mockResponse)
      expect(response.ok).toBe(false)
    })
  })

  describe('callAzureApiJson', () => {
    /**
     * Test: Verifies successful JSON response parsing for OK responses
     */
    it('should return parsed JSON for successful response', async () => {
      const mockResponse = {
        ok: true,
        status: STATUS_CODES.OK,
        json: vi.fn().mockResolvedValue(TEST_RESPONSE_DATA)
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await callAzureApiJson(
        `${TEST_CONFIG.ENDPOINT}${TEST_PATHS.TEST}`,
        {
          method: HTTP_METHODS.GET
        }
      )

      expect(result).toEqual(TEST_RESPONSE_DATA)
      expect(mockResponse.json).toHaveBeenCalled()
    })

    /**
     * Test: Verifies error handling for non-OK responses with error details
     */
    it('should throw error with details for non-OK response', async () => {
      const errorText = TEST_VALUES.RESOURCE_NOT_FOUND
      const mockResponse = {
        ok: false,
        status: STATUS_CODES.NOT_FOUND,
        statusText: 'Not Found',
        text: vi.fn().mockResolvedValue(errorText)
      }
      mockFetch.mockResolvedValue(mockResponse)

      try {
        await callAzureApiJson(`${TEST_CONFIG.ENDPOINT}${TEST_PATHS.TEST}`, {
          method: HTTP_METHODS.GET
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toContain(STATUS_CODES.NOT_FOUND.toString())
        expect(error.message).toContain('Not Found')
        expect(error.message).toContain(errorText)
        expect(error.status).toBe(STATUS_CODES.NOT_FOUND)
        expect(error.statusText).toBe('Not Found')
        expect(error.responseBody).toBe(errorText)
      }
    })

    /**
     * Test: Verifies error handling for 500 Internal Server Error
     */
    it('should handle 500 errors with server error message', async () => {
      const errorText = TEST_VALUES.INTERNAL_SERVER_ERROR
      const mockResponse = {
        ok: false,
        status: STATUS_CODES.INTERNAL_SERVER_ERROR,
        statusText: TEST_VALUES.INTERNAL_SERVER_ERROR,
        text: vi.fn().mockResolvedValue(errorText)
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(
        callAzureApiJson(`${TEST_CONFIG.ENDPOINT}${TEST_PATHS.TEST}`, {
          method: HTTP_METHODS.GET
        })
      ).rejects.toMatchObject({
        status: STATUS_CODES.INTERNAL_SERVER_ERROR,
        statusText: TEST_VALUES.INTERNAL_SERVER_ERROR,
        responseBody: errorText
      })
    })

    /**
     * Test: Verifies error handling for 401 Unauthorized responses
     */
    it('should handle 401 unauthorized errors', async () => {
      const errorText = TEST_VALUES.UNAUTHORIZED
      const mockResponse = {
        ok: false,
        status: STATUS_CODES.UNAUTHORIZED,
        statusText: TEST_VALUES.UNAUTHORIZED,
        text: vi.fn().mockResolvedValue(errorText)
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(
        callAzureApiJson(`${TEST_CONFIG.ENDPOINT}${TEST_PATHS.TEST}`, {
          method: HTTP_METHODS.GET
        })
      ).rejects.toMatchObject({
        status: STATUS_CODES.UNAUTHORIZED,
        statusText: TEST_VALUES.UNAUTHORIZED
      })
    })
  })

  describe('getIneligibleItems', () => {
    /**
     * Test: Verifies successful retrieval of ineligible items from MDM API
     */
    it('should get ineligible items from MDM API', async () => {
      const mockResponse = {
        ok: true,
        status: STATUS_CODES.OK,
        json: vi.fn().mockResolvedValue(TEST_RESPONSE_DATA)
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await getIneligibleItems()

      expect(result).toEqual(TEST_RESPONSE_DATA)
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_CONFIG.ENDPOINT}${TEST_CONFIG.INELIGIBLE_ITEMS_PATH}`,
        expect.objectContaining({
          method: HTTP_METHODS.GET,
          headers: expect.objectContaining({
            [HEADER_NAMES.AUTHORIZATION]: `Bearer ${TEST_TOKEN}`,
            [HEADER_NAMES.SUBSCRIPTION_KEY]: TEST_CONFIG.SUBSCRIPTION_KEY
          })
        })
      )
    })

    /**
     * Test: Verifies error handling when MDM API returns an error
     */
    it('should throw error when MDM API call fails', async () => {
      const errorText = TEST_VALUES.SERVICE_UNAVAILABLE
      const mockResponse = {
        ok: false,
        status: STATUS_CODES.SERVICE_UNAVAILABLE,
        statusText: 'Service Unavailable',
        text: vi.fn().mockResolvedValue(errorText)
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(getIneligibleItems()).rejects.toMatchObject({
        status: STATUS_CODES.SERVICE_UNAVAILABLE,
        responseBody: errorText
      })
    })

    /**
     * Test: Verifies that correct URL is constructed from config
     */
    it('should construct correct URL from config', async () => {
      const mockResponse = {
        ok: true,
        status: STATUS_CODES.OK,
        json: vi.fn().mockResolvedValue({ items: [] })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await getIneligibleItems()

      const expectedUrl = `${TEST_CONFIG.ENDPOINT}${TEST_CONFIG.INELIGIBLE_ITEMS_PATH}`
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
    })
  })

  describe('postToAzureApi', () => {
    /**
     * Test: Verifies successful POST request with JSON body
     */
    it('should make POST request with JSON body', async () => {
      const requestBody = { name: 'Test Item', value: 123 }
      const mockResponse = {
        ok: true,
        status: STATUS_CODES.CREATED,
        json: vi.fn().mockResolvedValue({ id: 1, ...requestBody })
      }
      mockFetch.mockResolvedValue(mockResponse)

      const url = `${TEST_CONFIG.ENDPOINT}${TEST_PATHS.API_ITEMS}`
      const result = await postToAzureApi(url, requestBody, {})

      expect(mockFetch).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          method: HTTP_METHODS.POST,
          body: JSON.stringify(requestBody),
          headers: expect.objectContaining({
            [HEADER_NAMES.AUTHORIZATION]: `Bearer ${TEST_TOKEN}`,
            [HEADER_NAMES.SUBSCRIPTION_KEY]: TEST_CONFIG.SUBSCRIPTION_KEY,
            [HEADER_NAMES.CONTENT_TYPE]: CONTENT_TYPES.JSON
          })
        })
      )
      expect(result).toEqual({ id: 1, ...requestBody })
    })

    /**
     * Test: Verifies that custom headers are included in POST requests
     */
    it('should include custom headers in POST request', async () => {
      const mockResponse = {
        ok: true,
        status: STATUS_CODES.CREATED,
        json: vi.fn().mockResolvedValue({ success: true })
      }
      mockFetch.mockResolvedValue(mockResponse)

      const customHeaders = {
        [HEADER_NAMES.REQUEST_ID]: TEST_VALUES.REQUEST_ID_VALUE
      }
      await postToAzureApi(
        `${TEST_CONFIG.ENDPOINT}${TEST_PATHS.API_ITEMS}`,
        { test: 'data' },
        customHeaders
      )

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            [HEADER_NAMES.REQUEST_ID]: TEST_VALUES.REQUEST_ID_VALUE
          })
        })
      )
    })

    /**
     * Test: Verifies error handling for failed POST requests
     */
    it('should handle POST request errors', async () => {
      const errorText = TEST_VALUES.BAD_REQUEST
      const mockResponse = {
        ok: false,
        status: STATUS_CODES.BAD_REQUEST,
        statusText: TEST_VALUES.BAD_REQUEST,
        text: vi.fn().mockResolvedValue(errorText)
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(
        postToAzureApi(
          `${TEST_CONFIG.ENDPOINT}${TEST_PATHS.API_ITEMS}`,
          { invalid: 'data' },
          {}
        )
      ).rejects.toMatchObject({
        status: STATUS_CODES.BAD_REQUEST,
        statusText: TEST_VALUES.BAD_REQUEST
      })
    })
  })

  describe('getIsoCodes', () => {
    /**
     * Test: Verifies successful retrieval of ISO codes from MDM API
     */
    it('should get ISO codes from MDM API', async () => {
      const mockIsoCodesData = [
        { code: 'GB', name: 'United Kingdom' },
        { code: 'US', name: 'United States' },
        { code: 'FR', name: 'France' }
      ]
      const mockResponse = {
        ok: true,
        status: STATUS_CODES.OK,
        json: vi.fn().mockResolvedValue(mockIsoCodesData)
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await getIsoCodes()

      expect(result).toEqual(mockIsoCodesData)
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_CONFIG.ENDPOINT}${TEST_CONFIG.ISO_CODES_PATH}`,
        expect.objectContaining({
          method: HTTP_METHODS.GET,
          headers: expect.objectContaining({
            [HEADER_NAMES.AUTHORIZATION]: `Bearer ${TEST_TOKEN}`,
            [HEADER_NAMES.SUBSCRIPTION_KEY]: TEST_CONFIG.SUBSCRIPTION_KEY
          })
        })
      )
    })

    /**
     * Test: Verifies error handling when MDM API returns an error
     */
    it('should throw error when MDM API call fails', async () => {
      const errorText = TEST_VALUES.SERVICE_UNAVAILABLE
      const mockResponse = {
        ok: false,
        status: STATUS_CODES.SERVICE_UNAVAILABLE,
        statusText: 'Service Unavailable',
        text: vi.fn().mockResolvedValue(errorText)
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(getIsoCodes()).rejects.toMatchObject({
        status: STATUS_CODES.SERVICE_UNAVAILABLE,
        responseBody: errorText
      })
    })

    /**
     * Test: Verifies that correct URL is constructed from config
     */
    it('should construct correct URL from config', async () => {
      const mockResponse = {
        ok: true,
        status: STATUS_CODES.OK,
        json: vi.fn().mockResolvedValue([])
      }
      mockFetch.mockResolvedValue(mockResponse)

      await getIsoCodes()

      const expectedUrl = `${TEST_CONFIG.ENDPOINT}${TEST_CONFIG.ISO_CODES_PATH}`
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
    })

    /**
     * Test: Verifies handling of empty ISO codes response
     */
    it('should handle empty ISO codes array', async () => {
      const mockResponse = {
        ok: true,
        status: STATUS_CODES.OK,
        json: vi.fn().mockResolvedValue([])
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await getIsoCodes()

      expect(result).toEqual([])
      expect(Array.isArray(result)).toBe(true)
    })

    /**
     * Test: Verifies handling of 404 response
     */
    it('should throw error when ISO codes endpoint returns 404', async () => {
      const errorText = TEST_VALUES.RESOURCE_NOT_FOUND
      const mockResponse = {
        ok: false,
        status: STATUS_CODES.NOT_FOUND,
        statusText: 'Not Found',
        text: vi.fn().mockResolvedValue(errorText)
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(getIsoCodes()).rejects.toMatchObject({
        status: STATUS_CODES.NOT_FOUND,
        responseBody: errorText
      })
    })
  })
})
