import { describe, it, expect } from 'vitest'
import { sanitise } from './json-file.js'

describe('json-checks', () => {
  it('should replace empty string values with null', () => {
    const input = '{"name": "", "age": "25", "address": " " }'
    const expectedOutput = '{"name":null,"age":"25","address":null}'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })

  it('should trim trailing and leading whitespaces from non-empty string values', () => {
    const input = '{"name": " John Doe ", "age": " 30 " }'
    const expectedOutput = '{"name":"John Doe","age":"30"}'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })

  it('should handle nested objects and arrays', () => {
    const input =
      '{"user": {"name": " Jane Doe ", "nickname": ""}, "tags": ["  tag1 ", "  "]}'
    const expectedOutput =
      '{"user":{"name":"Jane Doe","nickname":null},"tags":["tag1",null]}'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })

  it('should return null for invalid JSON string', () => {
    const input = '{"name": "John Doe", "age": 30' // Invalid JSON

    const result = sanitise(input)

    expect(result).toBeNull()
  })

  it('should leave non-string values unchanged', () => {
    const input = '{"age": 25, "isActive": true, "details": {"height": 180}}'
    const expectedOutput = '{"age":25,"isActive":true,"details":{"height":180}}'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })
})
