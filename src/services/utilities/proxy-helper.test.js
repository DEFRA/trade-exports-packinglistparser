import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Mock config before imports
vi.mock('../../config.js', () => ({
  config: {
    get: vi.fn()
  }
}))

// Mock logger
vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }))
}))

// Mock HttpsProxyAgent
vi.mock('https-proxy-agent', () => ({
  HttpsProxyAgent: vi.fn()
}))

// Mock WebSocket
vi.mock('ws', () => ({
  default: vi.fn()
}))

// Test constants
const TEST_PROXY_URLS = {
  HTTP_WITH_PORT: 'http://proxy.example.com:8080',
  HTTPS_WITH_PORT: 'https://proxy.example.com:8443',
  HTTP_WITHOUT_PORT: 'http://proxy.example.com'
}

const TEST_PROXY_HOSTS = {
  HTTP_WITH_PORT: 'http://proxy.example.com:8080/',
  HTTPS_WITH_PORT: 'https://proxy.example.com:8443/',
  HTTP_WITHOUT_PORT: 'http://proxy.example.com/'
}

const TEST_PORTS = {
  HTTP: 80,
  HTTPS: 443
}

const PROPERTY_NAMES = {
  WEB_SOCKET_OPTIONS: 'webSocketOptions',
  WEB_SOCKET: 'webSocket',
  WEB_SOCKET_CONSTRUCTOR_OPTIONS: 'webSocketConstructorOptions',
  AGENT: 'agent',
  PROXY_OPTIONS: 'proxyOptions',
  HOST: 'host',
  PORT: 'port'
}

const LOG_MESSAGES = {
  USING_PROXY: 'Using proxy for Service Bus WebSocket connection'
}

describe('proxy-helper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getClientProxyOptions', () => {
    it('should return empty object when no proxy is configured', async () => {
      const { config } = await import('../../config.js')
      config.get.mockReturnValue(null)

      const { getClientProxyOptions } = await import('./proxy-helper.js')
      const result = getClientProxyOptions()

      expect(result).toEqual({})
    })

    it('should return proxy options with HTTP port when HTTP proxy is configured', async () => {
      const { config } = await import('../../config.js')
      config.get.mockReturnValue(TEST_PROXY_URLS.HTTP_WITH_PORT)

      // Need to reimport after mocking config
      vi.resetModules()
      const { getClientProxyOptions } = await import('./proxy-helper.js')
      const result = getClientProxyOptions()

      expect(result).toEqual({
        [PROPERTY_NAMES.PROXY_OPTIONS]: {
          [PROPERTY_NAMES.HOST]: TEST_PROXY_HOSTS.HTTP_WITH_PORT,
          [PROPERTY_NAMES.PORT]: TEST_PORTS.HTTP
        }
      })
    })

    it('should return proxy options with HTTPS port when HTTPS proxy is configured', async () => {
      const { config } = await import('../../config.js')
      config.get.mockReturnValue(TEST_PROXY_URLS.HTTPS_WITH_PORT)

      vi.resetModules()
      const { getClientProxyOptions } = await import('./proxy-helper.js')
      const result = getClientProxyOptions()

      expect(result).toEqual({
        [PROPERTY_NAMES.PROXY_OPTIONS]: {
          [PROPERTY_NAMES.HOST]: TEST_PROXY_HOSTS.HTTPS_WITH_PORT,
          [PROPERTY_NAMES.PORT]: TEST_PORTS.HTTPS
        }
      })
    })

    it('should handle proxy URL without port', async () => {
      const { config } = await import('../../config.js')
      config.get.mockReturnValue(TEST_PROXY_URLS.HTTP_WITHOUT_PORT)

      vi.resetModules()
      const { getClientProxyOptions } = await import('./proxy-helper.js')
      const result = getClientProxyOptions()

      expect(result).toEqual({
        [PROPERTY_NAMES.PROXY_OPTIONS]: {
          [PROPERTY_NAMES.HOST]: TEST_PROXY_HOSTS.HTTP_WITHOUT_PORT,
          [PROPERTY_NAMES.PORT]: TEST_PORTS.HTTP
        }
      })
    })
  })

  describe('getServiceBusConnectionOptions', () => {
    it('should return connection options without proxy when no proxy is configured', async () => {
      const { config } = await import('../../config.js')
      config.get.mockReturnValue(null)

      vi.resetModules()
      const WebSocket = (await import('ws')).default
      const { getServiceBusConnectionOptions } = await import(
        './proxy-helper.js'
      )

      const result = getServiceBusConnectionOptions()

      expect(result).toHaveProperty(PROPERTY_NAMES.WEB_SOCKET_OPTIONS)
      expect(result.webSocketOptions).toHaveProperty(PROPERTY_NAMES.WEB_SOCKET, WebSocket)
      expect(result.webSocketOptions).not.toHaveProperty(
        PROPERTY_NAMES.WEB_SOCKET_CONSTRUCTOR_OPTIONS
      )
    })

    it('should return connection options with proxy agent when proxy is configured', async () => {
      const { config } = await import('../../config.js')
      config.get.mockReturnValue(TEST_PROXY_URLS.HTTP_WITH_PORT)

      vi.resetModules()
      const { HttpsProxyAgent } = await import('https-proxy-agent')
      const WebSocket = (await import('ws')).default
      const mockProxyAgent = { isProxyAgent: true }
      HttpsProxyAgent.mockReturnValue(mockProxyAgent)

      const { getServiceBusConnectionOptions } = await import(
        './proxy-helper.js'
      )

      const result = getServiceBusConnectionOptions()

      expect(result).toHaveProperty(PROPERTY_NAMES.WEB_SOCKET_OPTIONS)
      expect(result.webSocketOptions).toHaveProperty(PROPERTY_NAMES.WEB_SOCKET, WebSocket)
      expect(result.webSocketOptions).toHaveProperty(
        PROPERTY_NAMES.WEB_SOCKET_CONSTRUCTOR_OPTIONS
      )
      expect(
        result.webSocketOptions.webSocketConstructorOptions
      ).toHaveProperty(PROPERTY_NAMES.AGENT, mockProxyAgent)
      expect(HttpsProxyAgent).toHaveBeenCalledWith(
        TEST_PROXY_URLS.HTTP_WITH_PORT
      )
    })

    it('should log proxy usage when proxy is configured', async () => {
      const { config } = await import('../../config.js')
      const mockLogger = {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn()
      }
      config.get.mockReturnValue(TEST_PROXY_URLS.HTTPS_WITH_PORT)

      vi.resetModules()

      const { createLogger } = await import(
        '../../common/helpers/logging/logger.js'
      )
      createLogger.mockReturnValue(mockLogger)

      const { getServiceBusConnectionOptions } = await import(
        './proxy-helper.js'
      )

      getServiceBusConnectionOptions()

      expect(mockLogger.info).toHaveBeenCalledWith(
        { proxyUrl: TEST_PROXY_URLS.HTTPS_WITH_PORT },
        LOG_MESSAGES.USING_PROXY
      )
    })
  })
})
