import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock AWS SDK
const mockSend = vi.fn()
const MockCognitoIdentityClient = vi.fn(() => ({
  send: mockSend
}))
const MockGetOpenIdTokenForDeveloperIdentityCommand = vi.fn((params) => params)

vi.mock('@aws-sdk/client-cognito-identity', () => ({
  CognitoIdentityClient: MockCognitoIdentityClient,
  GetOpenIdTokenForDeveloperIdentityCommand:
    MockGetOpenIdTokenForDeveloperIdentityCommand
}))

// Mock Azure Identity
const MockClientAssertionCredential = vi.fn()
vi.mock('@azure/identity', () => ({
  ClientAssertionCredential: MockClientAssertionCredential
}))

// Mock config
const mockConfigGet = vi.fn((key) => {
  if (key === 'aws') {
    return {
      poolId: 'eu-west-2:test-pool-id-1234',
      region: 'eu-west-2'
    }
  }
  return {}
})

vi.mock('../../config.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

// Import after mocks are set up
const { getAzureCredentials } = await import('./get-azure-credentials.js')

describe('get-azure-credentials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSend.mockClear()
    MockCognitoIdentityClient.mockClear()
    MockGetOpenIdTokenForDeveloperIdentityCommand.mockClear()
    MockClientAssertionCredential.mockClear()
    mockConfigGet.mockClear()

    // Reset default mock behavior
    mockConfigGet.mockImplementation((key) => {
      if (key === 'aws') {
        return {
          poolId: 'eu-west-2:test-pool-id-1234',
          region: 'eu-west-2'
        }
      }
      return {}
    })
  })

  describe('getAzureCredentials', () => {
    it('should create ClientAssertionCredential with correct parameters', () => {
      const tenantId = 'test-tenant-id'
      const clientId = 'test-client-id'

      getAzureCredentials(tenantId, clientId)

      expect(MockClientAssertionCredential).toHaveBeenCalledWith(
        tenantId,
        clientId,
        expect.any(Function)
      )
    })

    it('should return a ClientAssertionCredential instance', () => {
      const mockCredential = { type: 'ClientAssertionCredential' }
      MockClientAssertionCredential.mockReturnValue(mockCredential)

      const result = getAzureCredentials('tenant-id', 'client-id')

      expect(result).toBe(mockCredential)
    })

    it('should use getCognitoToken callback that requests token from Cognito', async () => {
      let capturedCallback
      MockClientAssertionCredential.mockImplementation(
        (tenantId, clientId, callback) => {
          capturedCallback = callback
          return { type: 'credential' }
        }
      )

      mockSend.mockResolvedValue({ Token: 'test-token-123' })

      getAzureCredentials('tenant-id', 'client-id')

      // Call the captured callback (getCognitoToken)
      const token = await capturedCallback()

      expect(token).toBe('test-token-123')
      expect(
        MockGetOpenIdTokenForDeveloperIdentityCommand
      ).toHaveBeenCalledWith({
        IdentityPoolId: 'eu-west-2:test-pool-id-1234',
        Logins: {
          'trade-exports-packinglistparser-aad-access':
            'trade-exports-packinglistparser'
        }
      })
      expect(mockSend).toHaveBeenCalled()
    })

    it('should throw error when Cognito token request fails', async () => {
      let capturedCallback
      MockClientAssertionCredential.mockImplementation(
        (tenantId, clientId, callback) => {
          capturedCallback = callback
          return { type: 'credential' }
        }
      )

      const mockError = new Error('Cognito authentication failed')
      mockSend.mockRejectedValue(mockError)

      getAzureCredentials('tenant-id', 'client-id')

      // Call the captured callback should throw
      await expect(capturedCallback()).rejects.toThrow(
        'Cognito authentication failed'
      )
    })

    it('should read poolId and region from config at module load', async () => {
      // Clear the mock to verify it gets called during module initialization
      mockConfigGet.mockClear()

      mockConfigGet.mockReturnValue({
        poolId: 'us-east-1:custom-pool-id',
        region: 'us-east-1'
      })

      // Reimport the module to trigger config.get call
      vi.resetModules()
      await import('./get-azure-credentials.js')

      // Verify config.get was called with 'aws' during module initialization
      expect(mockConfigGet).toHaveBeenCalledWith('aws')
    })

    it('should use correct logins mapping for Cognito', async () => {
      let capturedCallback
      MockClientAssertionCredential.mockImplementation(
        (tenantId, clientId, callback) => {
          capturedCallback = callback
          return { type: 'credential' }
        }
      )

      mockSend.mockResolvedValue({ Token: 'test-token' })

      getAzureCredentials('tenant-id', 'client-id')

      await capturedCallback()

      expect(
        MockGetOpenIdTokenForDeveloperIdentityCommand
      ).toHaveBeenCalledWith({
        IdentityPoolId: expect.any(String),
        Logins: {
          'trade-exports-packinglistparser-aad-access':
            'trade-exports-packinglistparser'
        }
      })
    })
  })
})
