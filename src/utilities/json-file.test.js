import { describe, it, expect } from 'vitest'
import { sanitise } from './json-file.js'

describe('json-checks', () => {
  it.each([
    [
      'replace empty string values with null',
      '{"name": "", "age": "25", "address": " " }',
      '{"name":null,"age":"25","address":null}'
    ],
    [
      'trim trailing and leading whitespaces from non-empty string values',
      '{"name": " John Doe ", "age": " 30 " }',
      '{"name":"John Doe","age":"30"}'
    ],
    [
      'handle nested objects and arrays',
      '{"user": {"name": " Jane Doe ", "nickname": ""}, "tags": ["  tag1 ", "  "]}',
      '{"user":{"name":"Jane Doe","nickname":null},"tags":["tag1",null]}'
    ],
    [
      'leave non-string values unchanged',
      '{"age": 25, "isActive": true, "details": {"height": 180}}',
      '{"age":25,"isActive":true,"details":{"height":180}}'
    ],
    [
      'handle null values in objects',
      '{"name": "John", "middleName": null, "age": 30}',
      '{"name":"John","middleName":null,"age":30}'
    ],
    [
      'handle arrays with null values',
      '["value1", null, "value2", ""]',
      '["value1",null,"value2",null]'
    ],
    [
      'handle deeply nested structures',
      '{"level1": {"level2": {"level3": {"name": "  deep  ", "value": ""}}}}',
      '{"level1":{"level2":{"level3":{"name":"deep","value":null}}}}'
    ],
    [
      'handle arrays of objects',
      '[{"name": " Alice ", "age": ""}, {"name": "Bob", "age": "  25  "}]',
      '[{"name":"Alice","age":null},{"name":"Bob","age":"25"}]'
    ],
    [
      'handle mixed empty values',
      '{"a": "", "b": "  ", "c": null, "d": "value"}',
      '{"a":null,"b":null,"c":null,"d":"value"}'
    ],
    ['handle empty objects', '{}', '{}'],
    ['handle empty arrays', '[]', '[]'],
    [
      'handle numbers including zero and negative',
      '{"zero": 0, "negative": -5, "decimal": 3.14, "positive": 100}',
      '{"zero":0,"negative":-5,"decimal":3.14,"positive":100}'
    ],
    [
      'handle boolean false values',
      '{"isActive": false, "isDeleted": true, "name": "test"}',
      '{"isActive":false,"isDeleted":true,"name":"test"}'
    ],
    [
      'preserve objects with numeric keys',
      '{"0": "first", "1": " second ", "2": ""}',
      '{"0":"first","1":"second","2":null}'
    ],
    [
      'handle strings with only whitespace characters',
      '{"tabs": "\\t\\t", "newlines": "\\n\\n", "spaces": "   "}',
      '{"tabs":null,"newlines":null,"spaces":null}'
    ],
    [
      'handle special characters in strings',
      '{"unicode": " ñ ", "symbols": " @#$ ", "quotes": " \\"test\\" "}',
      '{"unicode":"ñ","symbols":"@#$","quotes":"\\"test\\""}'
    ]
  ])('should %s', (_, input, expectedOutput) => {
    const result = sanitise(input)

    expect(result).toBe(expectedOutput)
  })

  it('should return null for invalid JSON string', () => {
    const input = '{"name": "John Doe", "age": 30' // Invalid JSON

    const result = sanitise(input)

    expect(result).toBeNull()
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
})
