import { describe, it, expect, beforeEach, vi } from 'vitest'
import { health } from './health.js'

describe('Health Route', () => {
  let mockH
  let mockResponse

  beforeEach(() => {
    mockResponse = {}
    mockH = {
      response: vi.fn().mockReturnValue(mockResponse)
    }

    vi.clearAllMocks()
  })

  it('should have correct route configuration', () => {
    expect(health.method).toBe('GET')
    expect(health.path).toBe('/health')
    expect(typeof health.handler).toBe('function')
  })

  it('should return success message', () => {
    const result = health.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({ message: 'success' })
    expect(result).toBe(mockResponse)
  })
})
