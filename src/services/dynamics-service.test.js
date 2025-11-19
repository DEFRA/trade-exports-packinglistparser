import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getDispatchLocation,
  bearerTokenRequest,
  checkDynamicsDispatchLocationConnection
} from './dynamics-service.js'

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
    global.fetch = vi.fn()
  })

  describe('bearerTokenRequest', () => {
    it('should successfully obtain bearer token', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'test-token' })
      }
      global.fetch.mockResolvedValue(mockResponse)

      const token = await bearerTokenRequest()

      expect(token).toBe('test-token')
      expect(global.fetch).toHaveBeenCalledWith(
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
        status: 401,
        text: vi.fn().mockResolvedValue('Unauthorized')
      }
      global.fetch.mockResolvedValue(mockResponse)

      await expect(bearerTokenRequest()).rejects.toThrow(
        'Bearer token request failed - Status: 401, Response: Unauthorized'
      )
    })

    it('should throw error if no access token in response', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ error: 'invalid_request' })
      }
      global.fetch.mockResolvedValue(mockResponse)

      await expect(bearerTokenRequest()).rejects.toThrow(
        'No access token in response'
      )
    })

    it('should throw error on network failure', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'))

      await expect(bearerTokenRequest()).rejects.toThrow('Network error')
    })
  })

  describe('getDispatchLocation', () => {
    const mockApplicationId = 'TEST-APP-123'

    it('should successfully retrieve dispatch location on first attempt', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'test-token' })
      }

      const dynamicsResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ rms_remosid: 'REMOS-12345' })
      }

      global.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      const result = await getDispatchLocation(mockApplicationId)

      expect(result).toBe('REMOS-12345')
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should return null on HTTP error (404)', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'test-token' })
      }

      const dynamicsResponse = {
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue('Not Found')
      }

      global.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      const result = await getDispatchLocation(mockApplicationId)

      expect(result).toBeNull()
      expect(global.fetch).toHaveBeenCalledTimes(2) // No retry on HTTP errors
    })

    it('should return null on HTTP error (401)', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'test-token' })
      }

      const dynamicsResponse = {
        ok: false,
        status: 401,
        text: vi.fn().mockResolvedValue('Unauthorized')
      }

      global.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      const result = await getDispatchLocation(mockApplicationId)

      expect(result).toBeNull()
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should retry on network failure and succeed on second attempt', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'test-token' })
      }

      const dynamicsResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ rms_remosid: 'REMOS-12345' })
      }

      global.fetch
        .mockResolvedValueOnce(tokenResponse) // First attempt token
        .mockRejectedValueOnce(new Error('Network timeout')) // First attempt fails
        .mockResolvedValueOnce(tokenResponse) // Second attempt token
        .mockResolvedValueOnce(dynamicsResponse) // Second attempt succeeds

      const result = await getDispatchLocation(mockApplicationId, 3, 10)

      expect(result).toBe('REMOS-12345')
      expect(global.fetch).toHaveBeenCalledTimes(4)
    })

    it('should return null after max retries on network failures', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'test-token' })
      }

      global.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockRejectedValueOnce(new Error('Network error 1'))
        .mockResolvedValueOnce(tokenResponse)
        .mockRejectedValueOnce(new Error('Network error 2'))
        .mockResolvedValueOnce(tokenResponse)
        .mockRejectedValueOnce(new Error('Network error 3'))

      const result = await getDispatchLocation(mockApplicationId, 3, 10)

      expect(result).toBeNull()
      expect(global.fetch).toHaveBeenCalledTimes(6) // 3 attempts × 2 calls each
    })

    it('should return null if bearer token is invalid', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'Error: Invalid' })
      }

      global.fetch.mockResolvedValueOnce(tokenResponse)

      const result = await getDispatchLocation(mockApplicationId)

      expect(result).toBeNull()
      expect(global.fetch).toHaveBeenCalledTimes(1) // Only token request
    })

    it('should return null if bearer token request fails', async () => {
      const tokenResponse = {
        ok: false,
        status: 401,
        text: vi.fn().mockResolvedValue('Invalid credentials')
      }

      global.fetch.mockResolvedValueOnce(tokenResponse)

      const result = await getDispatchLocation(mockApplicationId)

      expect(result).toBeNull()
    })

    it('should use correct Dynamics API endpoint', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'test-token' })
      }

      const dynamicsResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ rms_remosid: 'REMOS-12345' })
      }

      global.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      await getDispatchLocation(mockApplicationId)

      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining(
          'https://test.crm11.dynamics.com/api/data/v9.2/trd_inspectionlocations'
        ),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should include application ID in API URL', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'test-token' })
      }

      const dynamicsResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ rms_remosid: 'REMOS-12345' })
      }

      global.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      await getDispatchLocation('MY-APP-ID')

      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('trd_inspectionlocations(MY-APP-ID)'),
        expect.any(Object)
      )
    })

    it('should select rms_remosid field in query', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'test-token' })
      }

      const dynamicsResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ rms_remosid: 'REMOS-12345' })
      }

      global.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      await getDispatchLocation(mockApplicationId)

      expect(global.fetch).toHaveBeenNthCalledWith(
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
        json: vi.fn().mockResolvedValue({ access_token: 'test-token' })
      }

      const dynamicsResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ value: [] })
      }

      global.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      const result = await checkDynamicsDispatchLocationConnection()

      expect(result).toEqual({ response: dynamicsResponse, status: 200 })
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should return error status on connection failure', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'test-token' })
      }

      const dynamicsResponse = {
        ok: false,
        status: 503,
        json: vi.fn().mockResolvedValue({ error: 'Service Unavailable' })
      }

      global.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      const result = await checkDynamicsDispatchLocationConnection()

      expect(result).toEqual({ response: dynamicsResponse, status: 503 })
    })

    it('should use correct endpoint for connection check', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'test-token' })
      }

      const dynamicsResponse = {
        ok: true,
        status: 200
      }

      global.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(dynamicsResponse)

      await checkDynamicsDispatchLocationConnection()

      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('trd_inspectionlocations?$top=1'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should throw error if bearer token request fails during connection check', async () => {
      const tokenResponse = {
        ok: false,
        status: 401,
        text: vi.fn().mockResolvedValue('Unauthorized')
      }

      global.fetch.mockResolvedValueOnce(tokenResponse)

      await expect(checkDynamicsDispatchLocationConnection()).rejects.toThrow(
        'Bearer token request failed'
      )
    })

    it('should throw error on network failure during connection check', async () => {
      const tokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'test-token' })
      }

      global.fetch
        .mockResolvedValueOnce(tokenResponse)
        .mockRejectedValueOnce(new Error('Network timeout'))

      await expect(checkDynamicsDispatchLocationConnection()).rejects.toThrow(
        'Network timeout'
      )
    })
  })
})
