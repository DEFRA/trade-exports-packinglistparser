import { describe, it, expect, beforeEach, vi } from 'vitest'
import { tracing } from '@defra/hapi-tracing'
import { requestTracing } from './request-tracing.js'

vi.mock('@defra/hapi-tracing')
vi.mock('../../config.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'tracing.header') return 'x-cdp-request-id'
      return undefined
    })
  }
}))

describe('Request Tracing Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct plugin structure', () => {
    expect(requestTracing.plugin).toBe(tracing.plugin)
    expect(typeof requestTracing.options).toBe('object')
  })

  it('should have tracingHeader option set from config', () => {
    expect(requestTracing.options.tracingHeader).toBe('x-cdp-request-id')
  })

  it('should not be undefined', () => {
    expect(requestTracing).toBeDefined()
    expect(requestTracing.options).toBeDefined()
  })
})
