import { describe, it, expect, beforeEach, vi } from 'vitest'
import hapiPulse from 'hapi-pulse'
import { pulse } from './pulse.js'

vi.mock('hapi-pulse')
vi.mock('./logging/logger.js', () => ({
  createLogger: vi.fn().mockReturnValue({ info: vi.fn() })
}))

describe('Pulse Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct plugin structure', () => {
    expect(pulse.plugin).toBe(hapiPulse)
    expect(typeof pulse.options).toBe('object')
  })

  it('should have logger and timeout options', () => {
    expect(pulse.options.logger).toBeDefined()
    expect(typeof pulse.options.logger).toBe('object')
    expect(pulse.options.timeout).toBe(10 * 1000)
  })

  it('should set timeout to 10 seconds', () => {
    expect(pulse.options.timeout).toBe(10000)
  })
})
