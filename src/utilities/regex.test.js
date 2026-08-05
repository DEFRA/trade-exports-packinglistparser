import { describe, it, expect } from 'vitest'
import {
  test,
  findMatch,
  testAllPatterns,
  findAllMatches,
  positionFinder
} from './regex.js'

describe('test function', () => {
  it('should return true when the regex matches a value in the object', () => {
    const array = [
      { name: 'John Doe', age: 30, city: 'London' },
      { name: 'Jane Smith', age: 25, city: 'Paris' }
    ]

    expect(test('John', array)).toBe(true) // Matches 'John Doe'
    expect(test('Doe', array)).toBe(true) // Matches 'John Doe'
    expect(test('Smith', array)).toBe(true) // Matches 'Jane Smith'
  })

  it('should return false when the regex does not match any value in the object', () => {
    const array = [
      { name: 'John Doe', age: 30, city: 'London' },
      { name: 'Jane Smith', age: 25, city: 'Paris' }
    ]

    expect(test('Berlin', array)).toBe(false) // No match
    expect(test('Michael', array)).toBe(false) // No match
  })

  it('should skip non-string values and still find matches in string values', () => {
    const array = [
      { name: 'John Doe', age: 30, city: 'London' },
      { name: 'Jane Smith', age: 25, city: 'Paris' },
      { job: 'Engineer', salary: 50000, active: true }
    ]

    expect(test('John', array)).toBe(true) // Matches 'John Doe'
    expect(test('Engineer', array)).toBe(true) // Matches 'Engineer'
    expect(test('50000', array)).toBe(false) // Should not match number values
    expect(test('true', array)).toBe(false) // Should not match boolean values
  })

  it('should return true when regex matches the beginning or end of a string', () => {
    const array = [
      { name: 'John Doe', age: 30, city: 'London' },
      { name: 'Jane Smith', age: 25, city: 'Paris' }
    ]

    expect(test('^John', array)).toBe(true) // Matches 'John' at the start
    expect(test('Doe$', array)).toBe(true) // Matches 'Doe' at the end
  })

  it('should return false if the array is empty', () => {
    const array = []
    expect(test('John', array)).toBe(false) // Empty array
  })

  it('should return false if no objects have matching properties', () => {
    const array = [
      { age: 30, active: true },
      { age: 25, city: 'Paris' }
    ]

    expect(test('John', array)).toBe(false) // No string properties to match
  })

  it('should skip inherited properties', () => {
    const parentObject = { name: 'Parent Name' }
    const array = [
      Object.create(parentObject), // Inherited property
      { name: 'John Doe', age: 30, city: 'London' }
    ]

    expect(test('Parent Name', array)).toBe(false) // Should not match inherited property
    expect(test('John', array)).toBe(true) // Matches 'John Doe'
  })
})

describe('findMatch function', () => {
  it('should return the matching value when the regex matches a value in the object', () => {
    const array = [
      { name: 'John Doe', age: 30, city: 'London' },
      { name: 'Jane Smith', age: 25, city: 'Paris' }
    ]

    expect(findMatch('John', array)).toBe('John') // Matches 'John'
    expect(findMatch('Doe', array)).toBe('Doe') // Matches 'Doe'
    expect(findMatch('Smith', array)).toBe('Smith') // Matches 'Jane Smith'
  })

  it('should return the matching substring from a complex string', () => {
    const array = [
      { description: 'THE RANGE / RMS-GB-000252-002 / DN8 4HT' },
      { description: 'OTHER PRODUCT / RMS-GB-000999 / LOCATION' }
    ]

    expect(findMatch(/RMS-GB-000252(-\d{3})?/, array)).toBe('RMS-GB-000252-002') // Extracts and matches 'RMS-GB-000252-002'
    expect(findMatch(/RMS-GB-000999/, array)).toBe('RMS-GB-000999') // Extracts and matches 'RMS-GB-000999'
  })

  it('should return null when the regex does not match any value in the object', () => {
    const array = [
      { name: 'John Doe', age: 30, city: 'London' },
      { name: 'Jane Smith', age: 25, city: 'Paris' }
    ]

    expect(findMatch('Berlin', array)).toBeNull() // No match
    expect(findMatch('Michael', array)).toBeNull() // No match
  })

  it('should skip non-string values and return matching string values', () => {
    const array = [
      { name: 'John Doe', age: 30, city: 'London' },
      { name: 'Jane Smith', age: 25, city: 'Paris' },
      { job: 'Engineer', salary: 50000, active: true }
    ]

    expect(findMatch('John', array)).toBe('John') // Matches 'John'
    expect(findMatch('Engineer', array)).toBe('Engineer') // Matches 'Engineer'
    expect(findMatch('50000', array)).toBeNull() // Should not match number values
    expect(findMatch('true', array)).toBeNull() // Should not match boolean values
  })

  it('should return the first match it finds in the object', () => {
    const array = [
      { name: 'John Doe', age: 30, city: 'London' },
      { name: 'Jane Smith', age: 25, city: 'Paris' }
    ]

    expect(findMatch('John', array)).toBe('John') // Returns 'John' as the first match
    expect(findMatch('London', array)).toBe('London') // Matches 'London'
  })

  it('should return null if the array is empty', () => {
    const array = []
    expect(findMatch('John', array)).toBeNull() // Empty array
  })

  it('should return null if no objects have matching properties', () => {
    const array = [
      { age: 30, active: true },
      { age: 25, city: 'Paris' }
    ]

    expect(findMatch('John', array)).toBeNull() // No string properties to match
  })

  it('should skip inherited properties and return the correct match', () => {
    const parentObject = { name: 'Parent Name' }
    const array = [
      Object.create(parentObject), // Inherited property
      { name: 'John Doe', age: 30, city: 'London' }
    ]

    expect(findMatch('Parent Name', array)).toBeNull() // Should not match inherited property
    expect(findMatch('John', array)).toBe('John') // Matches 'John'
  })
})

describe('testAllPatterns function', () => {
  it.each([
    [
      'return true when all regex patterns match values in the object',
      ['John', 'Doe'],
      { name: 'John Doe', age: 30, city: 'London' }
    ],
    [
      'return true when all regex patterns match across different properties',
      ['John', 'London'],
      { name: 'John Doe', age: 30, city: 'London' }
    ],
    [
      'skip non-string values and still match patterns in string properties',
      ['John', 'London'],
      { name: 'John Doe', age: 30, city: 'London', active: true }
    ]
  ])('should %s', (_description, regexArray, row) => {
    expect(testAllPatterns(regexArray, row)).toBe(true)
  })

  it.each([
    [
      'return false when not all regex patterns match values in the object',
      ['John', 'Smith'],
      { name: 'John Doe', age: 30, city: 'London' }
    ],
    [
      'return false if no regex patterns match',
      ['Michael', 'Berlin'],
      { name: 'John Doe', age: 30, city: 'London' }
    ],
    [
      'return false if no objects have matching properties',
      ['John', 'Doe'],
      { age: 30, active: true }
    ]
  ])('should %s', (_description, regexArray, row) => {
    expect(testAllPatterns(regexArray, row)).toBe(false)
  })
})

describe('findAllMatches function', () => {
  it('should return the matching value when the regex matches a value in the object', () => {
    const array = [
      { name: 'John Doe', age: 30, city: 'London' },
      { name: 'Jane Smith', age: 25, city: 'Paris' }
    ]

    expect(findAllMatches(/John/, array, [])).toStrictEqual(['John']) // Matches 'John'
    expect(findAllMatches(/Doe/, array, [])).toStrictEqual(['Doe']) // Matches 'Doe'
    expect(findAllMatches(/Smith/, array, [])).toStrictEqual(['Smith']) // Matches 'Jane Smith'
  })

  it('should return the matching substring from a complex string', () => {
    const array = [
      { description: 'THE RANGE / RMS-GB-000252-002 / DN8 4HT' },
      { description: 'OTHER PRODUCT / RMS-GB-000999 / LOCATION' }
    ]

    expect(findAllMatches(/RMS-GB-000252-\d{3}/, array, [])).toStrictEqual([
      'RMS-GB-000252-002'
    ]) // Extracts and matches 'RMS-GB-000252-002'
  })

  it('should return empty array when the regex does not match any value in the object', () => {
    const array = [
      { name: 'John Doe', age: 30, city: 'London' },
      { name: 'Jane Smith', age: 25, city: 'Paris' }
    ]

    expect(findAllMatches(/Berlin/, array, [])).toStrictEqual([]) // No match
    expect(findAllMatches(/Michael/, array, [])).toStrictEqual([]) // No match
  })

  it('should skip non-string values and return matching string values', () => {
    const array = [
      { name: 'John Doe', age: 30, city: 'London' },
      { name: 'Jane Smith', age: 25, city: 'Paris' },
      { job: 'Engineer', salary: 50000, active: true }
    ]

    expect(findAllMatches(/John/, array, [])).toStrictEqual(['John']) // Matches 'John'
    expect(findAllMatches(/Engineer/, array, [])).toStrictEqual(['Engineer']) // Matches 'Engineer'
    expect(findAllMatches('50000', array, [])).toStrictEqual([]) // Should not match number values
    expect(findAllMatches('true', array, [])).toStrictEqual([]) // Should not match boolean values
  })

  it('should return null if the array is empty', () => {
    const array = []
    expect(findAllMatches('John', array, [])).toStrictEqual([]) // Empty array
  })

  it('should return null if no objects have matching properties', () => {
    const array = [
      { age: 30, active: true },
      { age: 25, city: 'Paris' }
    ]

    expect(findAllMatches('John', array, [])).toStrictEqual([]) // No string properties to match
  })

  it('should skip inherited properties and return the correct match', () => {
    const parentObject = { name: 'Parent Name' }
    const array = [
      Object.create(parentObject), // Inherited property
      { name: 'John Doe', age: 30, city: 'London' }
    ]

    expect(findAllMatches('Parent Name', array, [])).toStrictEqual([]) // Should not match inherited property
    expect(findAllMatches('John', array, [])).toStrictEqual(['John']) // Matches 'John'
  })

  it('should add multiple matches', () => {
    const array = [
      { description: 'THE RANGE / RMS-GB-000252-002 / DN8 4HT' },
      { description: 'OTHER PRODUCT / RMS-GB-000252-001 / LOCATION' }
    ]

    expect(findAllMatches(/RMS-GB-000252-\d{3}/, array, [])).toStrictEqual([
      'RMS-GB-000252-002',
      'RMS-GB-000252-001'
    ])
  })

  it("shouldn't add the same match twice", () => {
    const array = [
      { description: 'THE RANGE / RMS-GB-000252-002 / DN8 4HT' },
      { description: 'OTHER PRODUCT / RMS-GB-000252-002 / LOCATION' }
    ]

    expect(findAllMatches(/RMS-GB-000252-\d{3}/, array, [])).toStrictEqual([
      'RMS-GB-000252-002'
    ])
  })
})

describe('positionFinder function', () => {
  it('should return the row and column position of the first match', () => {
    const json = [
      { name: 'Alice', age: 30, city: 'London' },
      { name: 'Bob', age: 25, city: 'Paris' },
      { name: 'John Doe', age: 35, city: 'Berlin' }
    ]

    const result = positionFinder(json, /John/)
    expect(result).toEqual([2, 'name']) // Row 2, column 'name'
  })

  it('should return the first match when multiple matches exist', () => {
    const json = [
      { name: 'John Smith', age: 30, city: 'London' },
      { name: 'Jane Doe', age: 25, city: 'Paris' },
      { name: 'John Williams', age: 35, city: 'Berlin' }
    ]

    const result = positionFinder(json, /John/)
    expect(result).toEqual([0, 'name']) // First match at row 0, column 'name'
  })

  it.each([
    [
      'return null values when no match is found',
      [
        { name: 'Alice', age: 30, city: 'London' },
        { name: 'Bob', age: 25, city: 'Paris' },
        { name: 'Charlie', age: 35, city: 'Berlin' }
      ],
      /Michael/
    ],
    ['handle empty array', [], /John/],
    [
      'handle objects with no string properties',
      [
        { age: 30, active: true, salary: 50000 },
        { age: 25, active: false, salary: 45000 }
      ],
      /John/
    ]
  ])('should %s', (_description, json, pattern) => {
    const result = positionFinder(json, pattern)
    expect(result).toEqual([null, null])
  })

  it('should find matches in different columns', () => {
    const json = [
      { name: 'Alice', age: 30, city: 'London' },
      { name: 'Bob', age: 25, city: 'NewYork' },
      { name: 'Charlie', age: 35, city: 'Berlin' }
    ]

    const result = positionFinder(json, /NewYork/)
    expect(result).toEqual([1, 'city']) // Row 1, column 'city'
  })

  it('should handle case-insensitive matching', () => {
    const json = [
      { name: 'alice', age: 30, city: 'london' },
      { name: 'BOB', age: 25, city: 'PARIS' }
    ]

    const result = positionFinder(json, /ALICE/i)
    expect(result).toEqual([0, 'name']) // Case-insensitive match
  })
})
