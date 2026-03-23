import { describe, it, expect } from 'vitest'
import {
  buildSyncSuccessResult,
  buildSyncErrorResult,
  buildSyncSkippedResult
} from './sync-result-builders.js'

const ONE_SECOND_MS = 1000
const MAX_DURATION_MS = 2000

function defineSuccessResultTests() {
  describe('buildSyncSuccessResult', () => {
    it('should build a success result with default data', () => {
      const startTime = Date.now()
      const result = buildSyncSuccessResult(startTime)

      expect(result.success).toBe(true)
      expect(result.timestamp).toBeDefined()
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('should build a success result with additional data', () => {
      const startTime = Date.now()
      const additionalData = {
        itemCount: 10,
        etag: '"abc123"'
      }

      const result = buildSyncSuccessResult(startTime, additionalData)

      expect(result.success).toBe(true)
      expect(result.timestamp).toBeDefined()
      expect(result.duration).toBeGreaterThanOrEqual(0)
      expect(result.itemCount).toBe(10)
      expect(result.etag).toBe('"abc123"')
    })

    it('should calculate duration correctly', () => {
      const startTime = Date.now() - ONE_SECOND_MS
      const result = buildSyncSuccessResult(startTime)

      expect(result.duration).toBeGreaterThanOrEqual(ONE_SECOND_MS)
      expect(result.duration).toBeLessThan(MAX_DURATION_MS)
    })
  })
}

function defineErrorResultTests() {
  describe('buildSyncErrorResult', () => {
    it('should build an error result', () => {
      const startTime = Date.now()
      const error = new Error('Test error')

      const result = buildSyncErrorResult(startTime, error)

      expect(result.success).toBe(false)
      expect(result.timestamp).toBeDefined()
      expect(result.duration).toBeGreaterThanOrEqual(0)
      expect(result.error).toBe('Test error')
      expect(result.errorName).toBe('Error')
    })

    it('should handle custom error types', () => {
      const startTime = Date.now()
      const error = new TypeError('Type error occurred')

      const result = buildSyncErrorResult(startTime, error)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Type error occurred')
      expect(result.errorName).toBe('TypeError')
    })
  })
}

function defineSkippedResultTests() {
  describe('buildSyncSkippedResult', () => {
    it('should build a skipped result', () => {
      const startTime = Date.now()
      const reason = 'Feature is disabled'

      const result = buildSyncSkippedResult(startTime, reason)

      expect(result.success).toBe(false)
      expect(result.skipped).toBe(true)
      expect(result.reason).toBe('Feature is disabled')
      expect(result.timestamp).toBeDefined()
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('should handle different skip reasons', () => {
      const startTime = Date.now()
      const customReason = 'Configuration not found'

      const result = buildSyncSkippedResult(startTime, customReason)

      expect(result.skipped).toBe(true)
      expect(result.reason).toBe('Configuration not found')
    })
  })
}

function defineTimestampFormatTests() {
  describe('result timestamp format', () => {
    it('should produce valid ISO timestamp strings', () => {
      const startTime = Date.now()
      const successResult = buildSyncSuccessResult(startTime)
      const errorResult = buildSyncErrorResult(startTime, new Error('Test'))
      const skippedResult = buildSyncSkippedResult(startTime, 'Test reason')

      expect(() => new Date(successResult.timestamp)).not.toThrow()
      expect(() => new Date(errorResult.timestamp)).not.toThrow()
      expect(() => new Date(skippedResult.timestamp)).not.toThrow()

      expect(new Date(successResult.timestamp).toISOString()).toBe(
        successResult.timestamp
      )
      expect(new Date(errorResult.timestamp).toISOString()).toBe(
        errorResult.timestamp
      )
      expect(new Date(skippedResult.timestamp).toISOString()).toBe(
        skippedResult.timestamp
      )
    })
  })
}

describe('sync-result-builders', () => {
  defineSuccessResultTests()
  defineErrorResultTests()
  defineSkippedResultTests()
  defineTimestampFormatTests()
})
