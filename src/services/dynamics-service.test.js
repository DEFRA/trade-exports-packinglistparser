import { describe, it, expect, beforeEach, vi } from 'vitest'
import { STATUS_CODES } from '../routes/statuscodes.js'
import {
  getDispatchLocation,
  bearerTokenRequest,
  checkDynamicsDispatchLocationConnection
} from './dynamics-service.js'

// Test constants for repeated literals
const TEST_TOKEN = 'test-token'
const TEST_REMOS_ID = 'REMOS-12345'
const TEST_APPLICATION_ID = 'TEST-APP-123'

const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'Not Found',
  NETWORK_ERROR: 'Network error',
  NETWORK_TIMEOUT: 'Network timeout'
}

// Mock config before imports
vi.mock('../config.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'dynamics') {
        return {
          url: 'https://test.crm11.dynamics.com',
          tokenUrl: 'https://login.microsoftonline.com/tenant-id/oauth2/token',
          grantType: 'client_credentials',
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          resource: 'https://test.crm11.dynamics.com',
          maxRetries: 3,
          retryDelayMs: 100
        }
      }
      return {}
    })
  }
}))

// Mock logger
vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }))
}))

describe('dynamics-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.fetch = vi.fn()
  })

  describe('bearerTokenRequest', () => {
    it('should successfully obtain bearer token', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: TEST_TOKEN })
      }
      globalThis.fetch.mockResolvedValue(mockResponse)

      const token = await bearerTokenRequest()

      expect(token).toBe(TEST_TOKEN)
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://login.microsoftonline.com/tenant-id/oauth2/token',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      )
    })

    it('should throw error if response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: STATUS_CODES.UNAUTHORIZED,
        text: vi.fn().mockResolvedValue(ERROR_MESSAGES.UNAUTHORIZED)
      }
      globalThis.fetch.mockResolvedValue(mockResponse)

      await expect(bearerTokenRequest()).rejects.toThrow(
        `Bearer token request failed - Status: ${STATUS_CODES.UNAUTHORIZED}, Response: ${ERROR_MESSAGES.UNAUTHORIZED}`
      )
    })

    it('should throw error if no access token in response', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ error: 'invalid_request' })
      }
      globalThis.fetch.mockResolvedValue(mockResponse)

      await expect(bearerTokenRequest()).rejects.toThrow(
        'No access token in response'
      )
    })

    it('should throw error on network failure', async () => {
      globalThis.fetch.mockRejectedValue(
        new Error(ERROR_MESSAGES.NETWORK_ERROR)
      )

      await expect(bearerTokenRequest()).rejects.toThrow(
        ERROR_MESSAGES.NETWORK_ERROR
      )
    })
  })

  describe('getDispatchLocation', () => {
    it('should successfully retrieve dispatch location on first attempt', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: TEST_TOKEN })
      }

      const dynamicsResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ rms_remosid: TEST_REMOS_ID })
      }

      globalThis.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      const result = await getDispatchLocation(TEST_APPLICATION_ID)

      expect(result).toBe(TEST_REMOS_ID)
      expect(globalThis.fetch).toHaveBeenCalledTimes(2)
    })

    it('should return null on HTTP error (404)', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: TEST_TOKEN })
      }

      const dynamicsResponse = {
        ok: false,
        status: STATUS_CODES.NOT_FOUND,
        text: vi.fn().mockResolvedValue(ERROR_MESSAGES.NOT_FOUND)
      }

      globalThis.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      const result = await getDispatchLocation(TEST_APPLICATION_ID)

      expect(result).toBeNull()
      expect(globalThis.fetch).toHaveBeenCalledTimes(2) // No retry on HTTP errors
    })

    it('should return null on HTTP error (401)', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: TEST_TOKEN })
      }

      const dynamicsResponse = {
        ok: false,
        status: STATUS_CODES.UNAUTHORIZED,
        text: vi.fn().mockResolvedValue(ERROR_MESSAGES.UNAUTHORIZED)
      }

      globalThis.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      const result = await getDispatchLocation(TEST_APPLICATION_ID)

      expect(result).toBeNull()
      expect(globalThis.fetch).toHaveBeenCalledTimes(2)
    })

    it('should retry on network failure and succeed on second attempt', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: TEST_TOKEN })
      }

      const dynamicsResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ rms_remosid: TEST_REMOS_ID })
      }

      globalThis.fetch
        .mockResolvedValueOnce(tokenResponse) // First attempt token
        .mockRejectedValueOnce(new Error(ERROR_MESSAGES.NETWORK_TIMEOUT)) // First attempt fails
        .mockResolvedValueOnce(tokenResponse) // Second attempt token
        .mockResolvedValueOnce(dynamicsResponse) // Second attempt succeeds

      const result = await getDispatchLocation(TEST_APPLICATION_ID, 3, 10)

      expect(result).toBe(TEST_REMOS_ID)
      expect(globalThis.fetch).toHaveBeenCalledTimes(4)
    })

    it('should return null after max retries on network failures', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: TEST_TOKEN })
      }

      globalThis.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockRejectedValueOnce(new Error(`${ERROR_MESSAGES.NETWORK_ERROR} 1`))
        .mockResolvedValueOnce(tokenResponse)
        .mockRejectedValueOnce(new Error(`${ERROR_MESSAGES.NETWORK_ERROR} 2`))
        .mockResolvedValueOnce(tokenResponse)
        .mockRejectedValueOnce(new Error(`${ERROR_MESSAGES.NETWORK_ERROR} 3`))

      const result = await getDispatchLocation(TEST_APPLICATION_ID, 3, 10)

      expect(result).toBeNull()
      expect(globalThis.fetch).toHaveBeenCalledTimes(6) // 3 attempts × 2 calls each
    })

    it('should return null if bearer token is invalid', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'Error: Invalid' })
      }

      globalThis.fetch.mockResolvedValueOnce(tokenResponse)

      const result = await getDispatchLocation(TEST_APPLICATION_ID)

      expect(result).toBeNull()
      expect(globalThis.fetch).toHaveBeenCalledTimes(1) // Only token request
    })

    it('should return null if bearer token request fails', async () => {
      const tokenResponse = {
        ok: false,
        status: STATUS_CODES.UNAUTHORIZED,
        text: vi.fn().mockResolvedValue('Invalid credentials')
      }

      globalThis.fetch.mockResolvedValueOnce(tokenResponse)

      const result = await getDispatchLocation(TEST_APPLICATION_ID)

      expect(result).toBeNull()
    })

    it('should use correct Dynamics API endpoint', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: TEST_TOKEN })
      }

      const dynamicsResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ rms_remosid: TEST_REMOS_ID })
      }

      globalThis.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      await getDispatchLocation(TEST_APPLICATION_ID)

      expect(globalThis.fetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining(
          'https://test.crm11.dynamics.com/api/data/v9.2/trd_inspectionlocations'
        ),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should include application ID in API URL', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: TEST_TOKEN })
      }

      const dynamicsResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ rms_remosid: TEST_REMOS_ID })
      }

      globalThis.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      await getDispatchLocation('MY-APP-ID')

      expect(globalThis.fetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('trd_inspectionlocations(MY-APP-ID)'),
        expect.any(Object)
      )
    })

    it('should select rms_remosid field in query', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: TEST_TOKEN })
      }

      const dynamicsResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ rms_remosid: TEST_REMOS_ID })
      }

      globalThis.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      await getDispatchLocation(TEST_APPLICATION_ID)

      expect(globalThis.fetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('$select=rms_remosid'),
        expect.any(Object)
      )
    })
  })

  describe('checkDynamicsDispatchLocationConnection', () => {
    it('should successfully check connection to Dynamics dispatch locations', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: TEST_TOKEN })
      }

      const dynamicsResponse = {
        ok: true,
        status: STATUS_CODES.OK,
        json: vi.fn().mockResolvedValue({ value: [] })
      }

      globalThis.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      const result = await checkDynamicsDispatchLocationConnection()

      expect(result).toEqual({
        response: dynamicsResponse,
        status: STATUS_CODES.OK
      })
      expect(globalThis.fetch).toHaveBeenCalledTimes(2)
    })

    it('should return error status on connection failure', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: TEST_TOKEN })
      }

      const dynamicsResponse = {
        ok: false,
        status: STATUS_CODES.SERVICE_UNAVAILABLE,
        json: vi.fn().mockResolvedValue({ error: 'Service Unavailable' })
      }

      globalThis.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      const result = await checkDynamicsDispatchLocationConnection()

      expect(result).toEqual({
        response: dynamicsResponse,
        status: STATUS_CODES.SERVICE_UNAVAILABLE
      })
    })

    it('should use correct endpoint for connection check', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: TEST_TOKEN })
      }

      const dynamicsResponse = {
        ok: true,
        status: STATUS_CODES.OK
      }

      globalThis.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      await checkDynamicsDispatchLocationConnection()

      expect(globalThis.fetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('trd_inspectionlocations?$top=1'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should throw error if bearer token request fails during connection check', async () => {
      const tokenResponse = {
        ok: false,
        status: STATUS_CODES.UNAUTHORIZED,
        text: vi.fn().mockResolvedValue(ERROR_MESSAGES.UNAUTHORIZED)
      }

      globalThis.fetch.mockResolvedValueOnce(tokenResponse)

      await expect(checkDynamicsDispatchLocationConnection()).rejects.toThrow(
        'Bearer token request failed'
      )
    })

    it('should throw error on network failure during connection check', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: TEST_TOKEN })
      }

      globalThis.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockRejectedValueOnce(new Error(ERROR_MESSAGES.NETWORK_TIMEOUT))

      await expect(checkDynamicsDispatchLocationConnection()).rejects.toThrow(
        ERROR_MESSAGES.NETWORK_TIMEOUT
      )
    })
  })
})
