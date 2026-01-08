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

  it('should handle null values in objects', () => {
    const input = '{"name": "John", "middleName": null, "age": 30}'
    const expectedOutput = '{"name":"John","middleName":null,"age":30}'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })

  it('should handle undefined values converted to null', () => {
    const input = '{"name": "John", "age": 30}'
    const obj = JSON.parse(input)
    obj.undefined_field = undefined
    const jsonWithUndefined = JSON.stringify(obj)

    // When JSON.stringify encounters undefined, it omits the key
    const expectedOutput = '{"name":"John","age":30}'

    const result = sanitise(jsonWithUndefined)

    expect(result).toBe(expectedOutput)
  })

  it('should handle arrays with null values', () => {
    const input = '["value1", null, "value2", ""]'
    const expectedOutput = '["value1",null,"value2",null]'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })

  it('should handle deeply nested structures', () => {
    const input =
      '{"level1": {"level2": {"level3": {"name": "  deep  ", "value": ""}}}}'
    const expectedOutput =
      '{"level1":{"level2":{"level3":{"name":"deep","value":null}}}}'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })

  it('should handle arrays of objects', () => {
    const input =
      '[{"name": " Alice ", "age": ""}, {"name": "Bob", "age": "  25  "}]'
    const expectedOutput =
      '[{"name":"Alice","age":null},{"name":"Bob","age":"25"}]'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })

  it('should handle mixed empty values', () => {
    const input = '{"a": "", "b": "  ", "c": null, "d": "value"}'
    const expectedOutput = '{"a":null,"b":null,"c":null,"d":"value"}'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })

  it('should handle empty objects', () => {
    const input = '{}'
    const expectedOutput = '{}'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })

  it('should handle empty arrays', () => {
    const input = '[]'
    const expectedOutput = '[]'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })

  it('should handle numbers including zero and negative', () => {
    const input =
      '{"zero": 0, "negative": -5, "decimal": 3.14, "positive": 100}'
    const expectedOutput =
      '{"zero":0,"negative":-5,"decimal":3.14,"positive":100}'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })

  it('should handle boolean false values', () => {
    const input = '{"isActive": false, "isDeleted": true, "name": "test"}'
    const expectedOutput = '{"isActive":false,"isDeleted":true,"name":"test"}'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })

  it('should preserve objects with numeric keys', () => {
    const input = '{"0": "first", "1": " second ", "2": ""}'
    const expectedOutput = '{"0":"first","1":"second","2":null}'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })

  it('should handle strings with only whitespace characters', () => {
    const input = '{"tabs": "\\t\\t", "newlines": "\\n\\n", "spaces": "   "}'
    const expectedOutput = '{"tabs":null,"newlines":null,"spaces":null}'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })

  it('should handle special characters in strings', () => {
    const input =
      '{"unicode": " ñ ", "symbols": " @#$ ", "quotes": " \\"test\\" "}'
    const expectedOutput =
      '{"unicode":"ñ","symbols":"@#$","quotes":"\\"test\\""}'

    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })
})
