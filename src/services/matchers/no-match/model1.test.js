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
    [false, 'no RMS values present', [{ a: 'hello' }, { b: 'world' }]],
    [false, 'empty array', []]
  ])('returns %s when %s', (expected, _desc, csv) => {
    expect(noRemosMatchCsv(csv)).toBe(expected)
  })
})

describe('matchesNoMatch', () => {
  test.each([
    [true, 'RMS-GB-000000-000'],
    [false, 'RMS-GB-0000000-000'],
    [false, 'RMS-GB-000000']
  ])("returns '%s' for '%s'", (expected, remos) => {
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
})
