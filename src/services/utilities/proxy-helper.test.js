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
      config.get.mockReturnValue('http://proxy.example.com:8080')

      // Need to reimport after mocking config
      vi.resetModules()
      const { getClientProxyOptions } = await import('./proxy-helper.js')
      const result = getClientProxyOptions()

      expect(result).toEqual({
        proxyOptions: {
          host: 'proxy.example.com',
          port: 80
        }
      })
    })

    it('should return proxy options with HTTPS port when HTTPS proxy is configured', async () => {
      const { config } = await import('../../config.js')
      config.get.mockReturnValue('https://proxy.example.com:8443')

      vi.resetModules()
      const { getClientProxyOptions } = await import('./proxy-helper.js')
      const result = getClientProxyOptions()

      expect(result).toEqual({
        proxyOptions: {
          host: 'proxy.example.com',
          port: 443
        }
      })
    })

    it('should handle proxy URL without port', async () => {
      const { config } = await import('../../config.js')
      config.get.mockReturnValue('http://proxy.example.com')

      vi.resetModules()
      const { getClientProxyOptions } = await import('./proxy-helper.js')
      const result = getClientProxyOptions()

      expect(result).toEqual({
        proxyOptions: {
          host: 'proxy.example.com',
          port: 80
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

      expect(result).toHaveProperty('webSocketOptions')
      expect(result.webSocketOptions).toHaveProperty('webSocket', WebSocket)
      expect(result.webSocketOptions).not.toHaveProperty(
        'webSocketConstructorOptions'
      )
    })

    it('should return connection options with proxy agent when proxy is configured', async () => {
      const { config } = await import('../../config.js')
      config.get.mockReturnValue('http://proxy.example.com:8080')

      vi.resetModules()
      const { HttpsProxyAgent } = await import('https-proxy-agent')
      const WebSocket = (await import('ws')).default
      const mockProxyAgent = { isProxyAgent: true }
      HttpsProxyAgent.mockReturnValue(mockProxyAgent)

      const { getServiceBusConnectionOptions } = await import(
        './proxy-helper.js'
      )

      const result = getServiceBusConnectionOptions()

      expect(result).toHaveProperty('webSocketOptions')
      expect(result.webSocketOptions).toHaveProperty('webSocket', WebSocket)
      expect(result.webSocketOptions).toHaveProperty(
        'webSocketConstructorOptions'
      )
      expect(
        result.webSocketOptions.webSocketConstructorOptions
      ).toHaveProperty('agent', mockProxyAgent)
      expect(HttpsProxyAgent).toHaveBeenCalledWith(
        'http://proxy.example.com:8080'
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
      config.get.mockReturnValue('https://proxy.example.com:8443')

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
        { proxyUrl: 'https://proxy.example.com:8443' },
        'Using proxy for Service Bus WebSocket connection'
      )
    })
  })
})
