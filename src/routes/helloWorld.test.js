import { describe, it, expect, beforeEach, vi } from 'vitest'
import { helloWorld } from './helloWorld.js'

describe('Hello World Route', () => {
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
    expect(helloWorld.method).toBe('GET')
    expect(helloWorld.path).toBe('/helloWorld')
    expect(typeof helloWorld.handler).toBe('function')
  })

  it('should return Hello World message with status 200', () => {
    const result = helloWorld.handler({}, mockH)

    expect(mockH.response).toHaveBeenCalledWith({ Message: 'Hello World' })
    expect(mockResponse.code).toHaveBeenCalledWith(200)
    expect(result).toBe(mockResponse)
  })
})
