import { describe, it, expect, beforeEach, vi } from 'vitest'
import { home } from './home.js'
import { STATUS_CODES } from './statuscodes.js'

describe('Home Route', () => {
  let mockH
  let mockResponse

  beforeEach(() => {
    mockResponse = { code: vi.fn().mockReturnThis() }
    mockH = {
      response: vi.fn().mockReturnValue(mockResponse)
    }

    vi.clearAllMocks()
  })

  it('should have correct route configuration', () => {
    expect(home.method).toBe('GET')
    expect(home.path).toBe('/')
    expect(typeof home.handler).toBe('function')
  })

  it('should return HTML body with status 200', () => {
    const result = home.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith(
      expect.stringContaining('<h1>PLP Application</h1>')
    )
    expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    expect(result).toBe(mockResponse)
  })
})
