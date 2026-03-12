import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Hapi from '@hapi/hapi'
import { health } from './health.js'
import { STATUS_CODES } from './statuscodes.js'

describe('Health Route', () => {
  let server

  beforeEach(async () => {
    server = Hapi.server()
    server.route(health)
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  it('should have correct route configuration', () => {
    expect(health.method).toBe('GET')
    expect(health.path).toBe('/health')
    expect(typeof health.handler).toBe('function')
  })

  it('should return success response', async () => {
    const response = await server.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(STATUS_CODES.OK)
    expect(JSON.parse(response.payload)).toEqual({ message: 'success' })
  })
})
