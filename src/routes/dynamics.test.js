import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createServer } from '../server.js'
import { getDispatchLocation } from '../services/dynamics-service.js'
import { config } from '../config.js'
import { STATUS_CODES } from './statuscodes.js'

// Mock config before imports
vi.mock('../config.js', () => ({
  config: {
    get: vi.fn((key) => {
      const mockConfig = {
        host: '0.0.0.0',
        port: 3001,
        serviceName: 'trade-exports-packinglistparser',
        cdpEnvironment: 'local',
        log: {
          isEnabled: false,
          level: 'silent',
          format: 'pino-pretty',
          redact: ['req', 'res', 'responseTime']
        },
        httpProxy: null,
        isMetricsEnabled: false,
        tracing: { header: 'x-cdp-request-id' },
        aws: {
          region: 'eu-west-2',
          endpoint: null,
          accessKeyId: null,
          secretAccessKey: null,
          s3Bucket: 'test-bucket'
        },
        packingList: {
          schemaVersion: 'v1'
        },
        dynamics: {
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
      return mockConfig[key]
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

// Mock Dynamics service
vi.mock('../services/dynamics-service.js', () => ({
  getDispatchLocation: vi.fn()
}))

// Helper to get base mock config
const getBaseMockConfig = (overrides = {}) => ({
  host: '0.0.0.0',
  port: 3001,
  serviceName: 'trade-exports-packinglistparser',
  cdpEnvironment: 'local',
  log: {
    isEnabled: false,
    level: 'silent',
    format: 'pino-pretty',
    redact: ['req', 'res', 'responseTime']
  },
  httpProxy: null,
  isMetricsEnabled: false,
  tracing: { header: 'x-cdp-request-id' },
  aws: {
    region: 'eu-west-2',
    endpoint: null,
    accessKeyId: null,
    secretAccessKey: null,
    s3Bucket: 'test-bucket'
  },
  dynamics: {
    url: 'https://test.crm11.dynamics.com',
    tokenUrl: 'https://login.microsoftonline.com/tenant-id/oauth2/token',
    grantType: 'client_credentials',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    resource: 'https://test.crm11.dynamics.com',
    maxRetries: 3,
    retryDelayMs: 100
  },
  ...overrides
})

describe('Dynamics Routes', () => {
  let server

  beforeEach(async () => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    if (server) {
      await server.stop()
      server = null
    }
  })

  describe('GET /dynamics/health', () => {
    beforeEach(async () => {
      server = await createServer()
      await server.initialize()
    })

    it('should return 200 when Dynamics is fully configured', async () => {
      const options = {
        method: 'GET',
        url: '/dynamics/health'
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(STATUS_CODES.OK)
      expect(payload.service).toBe('dynamics')
      expect(payload.configured).toBe(true)
      expect(payload.environment).toBe('local')
      expect(payload.checks.url).toBe('configured')
      expect(payload.checks.tokenUrl).toBe('configured')
      expect(payload.checks.clientId).toBe('configured')
      expect(payload.checks.clientSecret).toBe('configured')
      expect(payload.checks.resource).toBe('configured')
      expect(payload.timestamp).toBeDefined()
    })

    it('should return 503 when Dynamics is not configured', async () => {
      // Stop and recreate server with different config
      await server.stop()

      config.get.mockImplementation((key) => {
        const mockConfig = getBaseMockConfig({
          dynamics: {
            url: null,
            tokenUrl: null,
            clientId: null,
            clientSecret: null,
            resource: null
          }
        })
        return mockConfig[key]
      })

      server = await createServer()
      await server.initialize()

      const options = {
        method: 'GET',
        url: '/dynamics/health'
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(STATUS_CODES.SERVICE_UNAVAILABLE)
      expect(payload.configured).toBe(false)
      expect(payload.checks.url).toBe('missing')
      expect(payload.checks.tokenUrl).toBe('missing')
      expect(payload.checks.clientId).toBe('missing')
      expect(payload.checks.clientSecret).toBe('missing')
      expect(payload.checks.resource).toBe('missing')

      // Reset mock
      config.get.mockImplementation((key) => getBaseMockConfig()[key])
    })

    it('should return 503 when partially configured', async () => {
      await server.stop()

      config.get.mockImplementation((key) => {
        const mockConfig = getBaseMockConfig({
          dynamics: {
            url: 'https://test.crm11.dynamics.com',
            tokenUrl:
              'https://login.microsoftonline.com/tenant-id/oauth2/token',
            clientId: 'test-client-id',
            clientSecret: null,
            resource: null
          }
        })
        return mockConfig[key]
      })

      server = await createServer()
      await server.initialize()

      const options = {
        method: 'GET',
        url: '/dynamics/health'
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(STATUS_CODES.SERVICE_UNAVAILABLE)
      expect(payload.configured).toBe(false)
      expect(payload.checks.url).toBe('configured')
      expect(payload.checks.clientSecret).toBe('missing')
      expect(payload.checks.resource).toBe('missing')

      // Reset mock
      config.get.mockImplementation((key) => getBaseMockConfig()[key])
    })
  })

  describe('GET /dynamics/dispatch-location/{applicationId}', () => {
    beforeEach(async () => {
      server = await createServer()
      await server.initialize()
    })

    it('should return REMOS ID when found', async () => {
      getDispatchLocation.mockResolvedValue('REMOS-12345')

      const options = {
        method: 'GET',
        url: '/dynamics/dispatch-location/TEST-APP-123'
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(STATUS_CODES.OK)
      expect(payload.applicationId).toBe('TEST-APP-123')
      expect(payload.remosId).toBe('REMOS-12345')
      expect(payload.success).toBe(true)
      expect(payload.environment).toBe('local')
      expect(payload.timestamp).toBeDefined()
      expect(getDispatchLocation).toHaveBeenCalledWith('TEST-APP-123')
    })

    it('should return 404 when REMOS ID not found', async () => {
      getDispatchLocation.mockResolvedValue(null)

      const options = {
        method: 'GET',
        url: '/dynamics/dispatch-location/UNKNOWN-ID'
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(STATUS_CODES.NOT_FOUND)
      expect(payload.applicationId).toBe('UNKNOWN-ID')
      expect(payload.remosId).toBeNull()
      expect(payload.success).toBe(false)
      expect(payload.environment).toBe('local')
    })

    it('should return 500 when service throws error', async () => {
      getDispatchLocation.mockRejectedValue(new Error('Network error'))

      const options = {
        method: 'GET',
        url: '/dynamics/dispatch-location/TEST-APP-123'
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(STATUS_CODES.INTERNAL_SERVER_ERROR)
      expect(payload.applicationId).toBe('TEST-APP-123')
      expect(payload.remosId).toBeNull()
      expect(payload.success).toBe(false)
      expect(payload.error).toBe('Internal server error')
    })

    it('should validate application ID format', async () => {
      const options = {
        method: 'GET',
        url: '/dynamics/dispatch-location/invalid@id#here'
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(400)
    })

    it('should reject empty application ID', async () => {
      const options = {
        method: 'GET',
        url: '/dynamics/dispatch-location/'
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(STATUS_CODES.NOT_FOUND)
    })

    it('should handle application IDs with hyphens', async () => {
      getDispatchLocation.mockResolvedValue('REMOS-67890')

      const options = {
        method: 'GET',
        url: '/dynamics/dispatch-location/TEST-APP-123-ABC'
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(STATUS_CODES.OK)
      expect(payload.applicationId).toBe('TEST-APP-123-ABC')
      expect(payload.remosId).toBe('REMOS-67890')
    })

    it('should handle application IDs with underscores', async () => {
      getDispatchLocation.mockResolvedValue('REMOS-99999')

      const options = {
        method: 'GET',
        url: '/dynamics/dispatch-location/TEST_APP_456'
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(STATUS_CODES.OK)
      expect(payload.applicationId).toBe('TEST_APP_456')
      expect(payload.remosId).toBe('REMOS-99999')
    })

    it('should reject application IDs longer than 100 characters', async () => {
      const longId = 'A'.repeat(101)

      const options = {
        method: 'GET',
        url: `/dynamics/dispatch-location/${longId}`
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(400)
    })

    it('should work in dev environment', async () => {
      await server.stop()

      config.get.mockImplementation((key) => {
        const mockConfig = getBaseMockConfig({ cdpEnvironment: 'dev' })
        return mockConfig[key]
      })

      server = await createServer()
      await server.initialize()

      getDispatchLocation.mockResolvedValue('REMOS-DEV-123')

      const options = {
        method: 'GET',
        url: '/dynamics/dispatch-location/DEV-TEST-APP'
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(STATUS_CODES.OK)
      expect(payload.environment).toBe('dev')
      expect(payload.remosId).toBe('REMOS-DEV-123')

      // Reset mock
      config.get.mockImplementation((key) => getBaseMockConfig()[key])
    })

    it('should work in test environment', async () => {
      await server.stop()

      config.get.mockImplementation((key) => {
        const mockConfig = getBaseMockConfig({ cdpEnvironment: 'test' })
        return mockConfig[key]
      })

      server = await createServer()
      await server.initialize()

      getDispatchLocation.mockResolvedValue('REMOS-TEST-456')

      const options = {
        method: 'GET',
        url: '/dynamics/dispatch-location/TEST-ENV-APP'
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(STATUS_CODES.OK)
      expect(payload.environment).toBe('test')
      expect(payload.remosId).toBe('REMOS-TEST-456')

      // Reset mock
      config.get.mockImplementation((key) => getBaseMockConfig()[key])
    })
  })
})
