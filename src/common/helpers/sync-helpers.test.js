import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createEnabledCheck } from './sync-helpers.js'

describe('sync-helpers', () => {
  let mockLogger
  let mockConfig

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    }

    mockConfig = {
      get: vi.fn()
    }
  })

  describe('createEnabledCheck', () => {
    it('should return null when feature is enabled', () => {
      mockConfig.get.mockReturnValue({ enabled: true })

      const checkEnabled = createEnabledCheck(
        'testFeature',
        'Test Feature',
        mockLogger
      )
      const startTime = Date.now()
      const result = checkEnabled(startTime, mockConfig)

      expect(result).toBeNull()
      expect(mockConfig.get).toHaveBeenCalledWith('testFeature')
      expect(mockLogger.info).not.toHaveBeenCalled()
    })

    it('should return skipped result when feature is disabled', () => {
      mockConfig.get.mockReturnValue({ enabled: false })

      const checkEnabled = createEnabledCheck(
        'testFeature',
        'Test Feature',
        mockLogger
      )
      const startTime = Date.now()
      const result = checkEnabled(startTime, mockConfig)

      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.skipped).toBe(true)
      expect(result.reason).toBe('Test Feature is disabled')
      expect(mockLogger.info).toHaveBeenCalledWith(
        result,
        'Test Feature synchronization skipped - Test Feature is disabled'
      )
    })

    it('should include duration in skipped result', () => {
      mockConfig.get.mockReturnValue({ enabled: false })

      const checkEnabled = createEnabledCheck(
        'testFeature',
        'Test Feature',
        mockLogger
      )
      const startTime = Date.now() - 1000
      const result = checkEnabled(startTime, mockConfig)

      expect(result.duration).toBeGreaterThanOrEqual(1000)
    })

    it('should work with different config keys and feature names', () => {
      mockConfig.get.mockReturnValue({ enabled: false })

      const checkEnabled = createEnabledCheck(
        'mdmIntegration',
        'MDM integration',
        mockLogger
      )
      const startTime = Date.now()
      const result = checkEnabled(startTime, mockConfig)

      expect(mockConfig.get).toHaveBeenCalledWith('mdmIntegration')
      expect(result.reason).toBe('MDM integration is disabled')
      expect(mockLogger.info).toHaveBeenCalledWith(
        result,
        'MDM integration synchronization skipped - MDM integration is disabled'
      )
    })

    it('should create reusable check functions', () => {
      const checkEnabled = createEnabledCheck(
        'testFeature',
        'Test Feature',
        mockLogger
      )

      // Call it multiple times with different configs
      mockConfig.get.mockReturnValueOnce({ enabled: true })
      const result1 = checkEnabled(Date.now(), mockConfig)
      expect(result1).toBeNull()

      mockConfig.get.mockReturnValueOnce({ enabled: false })
      const result2 = checkEnabled(Date.now(), mockConfig)
      expect(result2).toBeDefined()
      expect(result2.skipped).toBe(true)
    })
  })
})
