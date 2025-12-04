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

// Test constants
const TEST_IDS = {
  TENANT_ID: 'test-tenant-id',
  CLIENT_ID: 'test-client-id',
  TENANT_ID_ALT: 'tenant-id',
  CLIENT_ID_ALT: 'client-id'
}

const TEST_TOKENS = {
  TOKEN_123: 'test-token-123',
  TOKEN_GENERIC: 'test-token'
}

const TEST_AWS_CONFIG = {
  POOL_ID: 'eu-west-2:test-pool-id-1234',
  REGION: 'eu-west-2',
  POOL_ID_CUSTOM: 'us-east-1:custom-pool-id',
  REGION_CUSTOM: 'us-east-1'
}

const TEST_COGNITO = {
  LOGIN_KEY: 'trade-exports-packinglistparser-aad-access',
  LOGIN_VALUE: 'trade-exports-packinglistparser'
}

const ERROR_MESSAGES = {
  COGNITO_AUTH_FAILED: 'Cognito authentication failed'
}

const CONFIG_KEYS = {
  AWS: 'aws'
}

const MOCK_TYPES = {
  CLIENT_ASSERTION_CREDENTIAL: 'ClientAssertionCredential',
  CREDENTIAL: 'credential'
}

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
      if (key === CONFIG_KEYS.AWS) {
        return {
          poolId: TEST_AWS_CONFIG.POOL_ID,
          region: TEST_AWS_CONFIG.REGION
        }
      }
      return {}
    })
  })

  describe('getAzureCredentials', () => {
    it('should create ClientAssertionCredential with correct parameters', () => {
      const tenantId = TEST_IDS.TENANT_ID
      const clientId = TEST_IDS.CLIENT_ID

      getAzureCredentials(tenantId, clientId)

      expect(MockClientAssertionCredential).toHaveBeenCalledWith(
        tenantId,
        clientId,
        expect.any(Function)
      )
    })

    it('should return a ClientAssertionCredential instance', () => {
      const mockCredential = { type: MOCK_TYPES.CLIENT_ASSERTION_CREDENTIAL }
      MockClientAssertionCredential.mockReturnValue(mockCredential)

      const result = getAzureCredentials(TEST_IDS.TENANT_ID_ALT, TEST_IDS.CLIENT_ID_ALT)

      expect(result).toBe(mockCredential)
    })

    it('should use getCognitoToken callback that requests token from Cognito', async () => {
      let capturedCallback
      MockClientAssertionCredential.mockImplementation(
        (_tenantId, _clientId, callback) => {
          capturedCallback = callback
          return { type: MOCK_TYPES.CREDENTIAL }
        }
      )

      mockSend.mockResolvedValue({ Token: TEST_TOKENS.TOKEN_123 })

      getAzureCredentials(TEST_IDS.TENANT_ID_ALT, TEST_IDS.CLIENT_ID_ALT)

      // Call the captured callback (getCognitoToken)
      const token = await capturedCallback()

      expect(token).toBe(TEST_TOKENS.TOKEN_123)
      expect(
        MockGetOpenIdTokenForDeveloperIdentityCommand
      ).toHaveBeenCalledWith({
        IdentityPoolId: TEST_AWS_CONFIG.POOL_ID,
        Logins: {
          [TEST_COGNITO.LOGIN_KEY]: TEST_COGNITO.LOGIN_VALUE
        }
      })
      expect(mockSend).toHaveBeenCalled()
    })

    it('should throw error when Cognito token request fails', async () => {
      let capturedCallback
      MockClientAssertionCredential.mockImplementation(
        (_tenantId, _clientId, callback) => {
          capturedCallback = callback
          return { type: MOCK_TYPES.CREDENTIAL }
        }
      )

      const mockError = new Error(ERROR_MESSAGES.COGNITO_AUTH_FAILED)
      mockSend.mockRejectedValue(mockError)

      getAzureCredentials(TEST_IDS.TENANT_ID_ALT, TEST_IDS.CLIENT_ID_ALT)

      // Call the captured callback should throw
      await expect(capturedCallback()).rejects.toThrow(
        ERROR_MESSAGES.COGNITO_AUTH_FAILED
      )
    })

    it('should read poolId and region from config at module load', async () => {
      // Clear the mock to verify it gets called during module initialization
      mockConfigGet.mockClear()

      mockConfigGet.mockReturnValue({
        poolId: TEST_AWS_CONFIG.POOL_ID_CUSTOM,
        region: TEST_AWS_CONFIG.REGION_CUSTOM
      })

      // Reimport the module to trigger config.get call
      vi.resetModules()
      await import('./get-azure-credentials.js')

      // Verify config.get was called with 'aws' during module initialization
      expect(mockConfigGet).toHaveBeenCalledWith(CONFIG_KEYS.AWS)
    })

    it('should use correct logins mapping for Cognito', async () => {
      let capturedCallback
      MockClientAssertionCredential.mockImplementation(
        (_tenantId, _clientId, callback) => {
          capturedCallback = callback
          return { type: MOCK_TYPES.CREDENTIAL }
        }
      )

      mockSend.mockResolvedValue({ Token: TEST_TOKENS.TOKEN_GENERIC })

      getAzureCredentials(TEST_IDS.TENANT_ID_ALT, TEST_IDS.CLIENT_ID_ALT)

      await capturedCallback()

      expect(
        MockGetOpenIdTokenForDeveloperIdentityCommand
      ).toHaveBeenCalledWith({
        IdentityPoolId: expect.any(String),
        Logins: {
          [TEST_COGNITO.LOGIN_KEY]: TEST_COGNITO.LOGIN_VALUE
        }
      })
    })
  })
})
