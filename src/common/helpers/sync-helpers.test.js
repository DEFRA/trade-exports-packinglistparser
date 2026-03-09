import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createEnabledCheck } from './sync-helpers.js'

const TEST_FEATURE_KEY = 'testFeature'
const TEST_FEATURE_NAME = 'Test Feature'
const MDM_INTEGRATION_KEY = 'mdmIntegration'
const MDM_INTEGRATION_NAME = 'MDM integration'
const ONE_SECOND_MS = 1000

function createTestContext() {
  return {
    mockLogger: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    },
    mockConfig: {
      get: vi.fn()
    }
  }
}

function defineEnabledFeatureTests(getContext) {
  describe('when feature is enabled', () => {
    it('returns null and does not log', () => {
      const { mockConfig, mockLogger } = getContext()
      mockConfig.get.mockReturnValue({ enabled: true })

      const checkEnabled = createEnabledCheck(
        TEST_FEATURE_KEY,
        TEST_FEATURE_NAME,
        mockLogger
      )

      const result = checkEnabled(Date.now(), mockConfig)

      expect(result).toBeNull()
      expect(mockConfig.get).toHaveBeenCalledWith(TEST_FEATURE_KEY)
      expect(mockLogger.info).not.toHaveBeenCalled()
    })
  })
}

function defineDisabledFeatureTests(getContext) {
  describe('when feature is disabled', () => {
    it('returns skipped result and logs reason', () => {
      const { mockConfig, mockLogger } = getContext()
      mockConfig.get.mockReturnValue({ enabled: false })

      const checkEnabled = createEnabledCheck(
        TEST_FEATURE_KEY,
        TEST_FEATURE_NAME,
        mockLogger
      )

      const result = checkEnabled(Date.now(), mockConfig)

      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.skipped).toBe(true)
      expect(result.reason).toBe(`${TEST_FEATURE_NAME} is disabled`)
      expect(mockLogger.info).toHaveBeenCalledWith(
        result,
        `${TEST_FEATURE_NAME} synchronization skipped - ${TEST_FEATURE_NAME} is disabled`
      )
    })

    it('includes elapsed duration in skipped result', () => {
      const { mockConfig, mockLogger } = getContext()
      mockConfig.get.mockReturnValue({ enabled: false })

      const checkEnabled = createEnabledCheck(
        TEST_FEATURE_KEY,
        TEST_FEATURE_NAME,
        mockLogger
      )

      const result = checkEnabled(Date.now() - ONE_SECOND_MS, mockConfig)

      expect(result.duration).toBeGreaterThanOrEqual(ONE_SECOND_MS)
    })
  })
}

function defineConfigShapeTests(getContext) {
  describe('with different config keys and names', () => {
    it('uses the provided key and feature name in output', () => {
      const { mockConfig, mockLogger } = getContext()
      mockConfig.get.mockReturnValue({ enabled: false })

      const checkEnabled = createEnabledCheck(
        MDM_INTEGRATION_KEY,
        MDM_INTEGRATION_NAME,
        mockLogger
      )

      const result = checkEnabled(Date.now(), mockConfig)

      expect(mockConfig.get).toHaveBeenCalledWith(MDM_INTEGRATION_KEY)
      expect(result.reason).toBe(`${MDM_INTEGRATION_NAME} is disabled`)
      expect(mockLogger.info).toHaveBeenCalledWith(
        result,
        `${MDM_INTEGRATION_NAME} synchronization skipped - ${MDM_INTEGRATION_NAME} is disabled`
      )
    })

    it('creates reusable check functions', () => {
      const { mockConfig, mockLogger } = getContext()
      const checkEnabled = createEnabledCheck(
        TEST_FEATURE_KEY,
        TEST_FEATURE_NAME,
        mockLogger
      )

      mockConfig.get.mockReturnValueOnce({ enabled: true })
      const resultEnabled = checkEnabled(Date.now(), mockConfig)
      expect(resultEnabled).toBeNull()

      mockConfig.get.mockReturnValueOnce({ enabled: false })
      const resultDisabled = checkEnabled(Date.now(), mockConfig)
      expect(resultDisabled).toBeDefined()
      expect(resultDisabled.skipped).toBe(true)
    })
  })
}

describe('sync-helpers', () => {
  let mockLogger
  let mockConfig

  beforeEach(() => {
    const context = createTestContext()
    mockLogger = context.mockLogger
    mockConfig = context.mockConfig
  })

  describe('createEnabledCheck', () => {
    const getContext = () => ({ mockLogger, mockConfig })
    defineEnabledFeatureTests(getContext)
    defineDisabledFeatureTests(getContext)
    defineConfigShapeTests(getContext)
  })
})
