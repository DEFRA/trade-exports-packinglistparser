import { describe, test, expect } from 'vitest'
import { noRemosMatchCsv, noRemosMatch, noRemosMatchPdf } from './model1.js'

describe('no-match model1 - noRemosMatchCsv', () => {
  test.each([
    [
      true,
      'standard RMS value present',
      [{ col1: 'RMS-GB-123456-789' }, { col2: 'something' }]
    ],
    [true, 'lower-case rms (case-insensitive)', [{ c: 'rms-gb-000001-001' }]],
    [
      true,
      'Iceland-specific RMS exception',
      [{ col1: 'RMS-GB-000040-001' }, { col2: 'data' }]
    ],
    [
      true,
      'RMS with mixed case',
      [{ col1: 'RmS-gB-000001-001' }, { col2: 'something' }]
    ],
    [false, 'no RMS values present', [{ a: 'hello' }, { b: 'world' }]],
    [false, 'empty array', []],
    [
      false,
      'invalid RMS format - too many digits',
      [{ col1: 'RMS-GB-1234567-789' }]
    ],
    [
      false,
      'invalid RMS format - too few digits',
      [{ col1: 'RMS-GB-12345-789' }]
    ],
    [
      false,
      'invalid RMS format - missing hyphens',
      [{ col1: 'RMSGB123456789' }]
    ],
    [false, 'partial RMS match', [{ col1: 'prefix RMS-GB-123456-789 suffix' }]]
  ])('returns %s when %s', (expected, _desc, csv) => {
    expect(noRemosMatchCsv(csv)).toBe(expected)
  })
})

describe('matchesNoMatch - sheet-based data', () => {
  test.each([
    [true, 'RMS-GB-000000-000', 'valid RMS format'],
    [true, 'RMS-GB-123456-789', 'valid RMS with different numbers'],
    [true, 'rms-gb-000000-000', 'lowercase RMS (case-insensitive)'],
    [false, 'RMS-GB-0000000-000', 'invalid - too many establishment digits'],
    [false, 'RMS-GB-00000-000', 'invalid - too few establishment digits'],
    [false, 'RMS-GB-000000', 'invalid - missing sequence number'],
    [false, 'RMS-GB-000000-0000', 'invalid - too many sequence digits'],
    [false, 'RMS-GB-000000-00', 'invalid - too few sequence digits'],
    [false, '', 'empty string'],
    [false, null, 'null value'],
    [false, 'RMSGB000000000', 'missing hyphens'],
    [false, 'RMS-GB-AAAAAA-000', 'letters instead of numbers']
  ])("returns '%s' for '%s' (%s)", (expected, remos, _description) => {
    const model = {
      pl: [
        {
          remos
        }
      ]
    }
    const result = noRemosMatch(model)
    expect(result).toBe(expected)
  })

  test('returns true when RMS is in nested object values', () => {
    const model = {
      Sheet1: [
        { A: 'header1', B: 'header2' },
        { A: 'data1', B: 'RMS-GB-000000-001' }
      ]
    }
    expect(noRemosMatch(model)).toBe(true)
  })

  test('returns false when no RMS in any sheet', () => {
    const model = {
      Sheet1: [{ A: 'data', B: 'more data' }],
      Sheet2: [{ C: 'other', D: 'values' }]
    }
    expect(noRemosMatch(model)).toBe(false)
  })

  test('returns true when RMS in second sheet', () => {
    const model = {
      Sheet1: [{ A: 'no rms here' }],
      Sheet2: [{ B: 'RMS-GB-000001-001' }]
    }
    expect(noRemosMatch(model)).toBe(true)
  })

  test('recognizes Giovanni exception pattern', () => {
    const model = {
      Sheet1: [{ A: '(NIRMS RMS-GB-000001-001)' }]
    }
    // This should match the exception
    expect(noRemosMatch(model)).toBe(true)
  })

  test('recognizes CDS exception pattern', () => {
    const model = {
      Sheet1: [{ A: '/ RMS-GB-000252-001 /' }]
    }
    expect(noRemosMatch(model)).toBe(true)
  })

  test('recognizes Sainsburys exception pattern', () => {
    const model = {
      Sheet1: [{ A: 'RMS-GB-000094-001​' }] // Note: contains zero-width space
    }
    expect(noRemosMatch(model)).toBe(true)
  })

  test('recognizes Booker exception pattern', () => {
    const model = {
      Sheet1: [{ A: 'RMS-GB-000077-001' }]
    }
    expect(noRemosMatch(model)).toBe(true)
  })
})

describe('noRemosMatchPdf', () => {
  test('returns false when PDF extraction throws an error', async () => {
    // Pass invalid data that will cause extractPdf to throw
    const invalidPdfBuffer = Buffer.from('not a valid PDF')

    const result = await noRemosMatchPdf(invalidPdfBuffer)

    // Should catch error and return false
    expect(result).toBe(false)
  })

  test('handles null or undefined input gracefully', async () => {
    const result = await noRemosMatchPdf(null)

    expect(result).toBe(false)
  })

  test('handles empty buffer', async () => {
    const emptyBuffer = Buffer.alloc(0)

    const result = await noRemosMatchPdf(emptyBuffer)

    expect(result).toBe(false)
  })

  test('handles undefined input', async () => {
    const result = await noRemosMatchPdf(undefined)

    expect(result).toBe(false)
  })
})
