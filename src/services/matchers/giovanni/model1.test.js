/**
 * Unit tests for Giovanni Model 1 matcher
 * Tests the matcher's ability to identify Giovanni Model 1 packing lists
 * by validating establishment numbers and header patterns.
 */
import { describe, test, expect } from 'vitest'
import { matches, matchesModel } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/giovanni/model1.js'

const filename = 'packinglist-giovanni-model1.xlsx'

describe('Giovanni Model 1 Matcher', () => {
  describe('Valid packing lists', () => {
    test('matches valid Giovanni Model 1 file', () => {
      const result = matches(model.validModel, filename)
      expect(result).toBe(matcherResult.CORRECT)
    })

    test('matches valid Giovanni Model 1 with multiple sheets', () => {
      const result = matches(model.validModelMultipleSheets, filename)
      expect(result).toBe(matcherResult.CORRECT)
    })

    test('matches valid headers with no data', () => {
      const result = matches(model.validHeadersNoData, filename)
      expect(result).toBe(matcherResult.CORRECT)
    })
  })

  describe('Invalid packing lists', () => {
    test('returns EMPTY_FILE for empty json', () => {
      const result = matches({}, filename)
      expect(result).toBe(matcherResult.EMPTY_FILE)
    })

    test('returns WRONG_ESTABLISHMENT_NUMBER for invalid establishment', () => {
      const result = matches(model.incorrectEstablishmentNumber, filename)
      expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
    })

    test('returns WRONG_ESTABLISHMENT_NUMBER for invalid establishment in multiple sheets', () => {
      const result = matches(model.wrongEstablishmentMultiple, filename)
      expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
    })

    test('returns WRONG_HEADER for incorrect headers', () => {
      const result = matches(model.incorrectHeader, filename)
      expect(result).toBe(matcherResult.WRONG_HEADER)
    })

    test('returns WRONG_HEADER for incorrect headers in multiple sheets', () => {
      const result = matches(model.incorrectHeaderMultiple, filename)
      expect(result).toBe(matcherResult.WRONG_HEADER)
    })
  })

  describe('Error handling', () => {
    test('returns GENERIC_ERROR when error occurs', () => {
      const result = matches(null, filename)
      expect(result).toBe(matcherResult.GENERIC_ERROR)
    })
  })

  describe('matchesModel helper function', () => {
    test('uses provided regex for establishment number validation', () => {
      const customRegex = /^RMS-GB-000153(-\d{3})?$/i
      const result = matchesModel(model.validModel, filename, customRegex)
      expect(result).toBe(matcherResult.CORRECT)
    })

    test('rejects when custom regex does not match', () => {
      const customRegex = /^RMS-GB-999999(-\d{3})?$/i
      const result = matchesModel(model.validModel, filename, customRegex)
      expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
    })
  })

  describe('Establishment number pattern validation', () => {
    test('accepts establishment number without suffix', () => {
      const testData = {
        RANA: [
          { A: 'RMS-GB-000153' },
          {
            C: 'DESCRIPTION',
            E: 'Commodity Code',
            G: 'Quantity',
            H: 'Net Weight (KG)'
          }
        ]
      }
      const result = matches(testData, filename)
      expect(result).toBe(matcherResult.CORRECT)
    })

    test('accepts establishment number with suffix', () => {
      const testData = {
        RANA: [
          { A: 'RMS-GB-000153-001' },
          {
            C: 'DESCRIPTION',
            E: 'Commodity Code',
            G: 'Quantity',
            H: 'Net Weight (KG)'
          }
        ]
      }
      const result = matches(testData, filename)
      expect(result).toBe(matcherResult.CORRECT)
    })

    test('rejects establishment number with wrong prefix', () => {
      const testData = {
        RANA: [
          { A: 'RMS-GB-999999' },
          {
            C: 'DESCRIPTION',
            E: 'Commodity Code',
            G: 'Quantity',
            H: 'Net Weight (KG)'
          }
        ]
      }
      const result = matches(testData, filename)
      expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
    })
  })

  describe('Header validation', () => {
    test('validates all required headers are present', () => {
      const result = matches(model.validModel, filename)
      expect(result).toBe(matcherResult.CORRECT)
    })

    test('rejects when description header is missing', () => {
      const testData = {
        RANA: [
          { A: 'RMS-GB-000153' },
          {
            E: 'Commodity Code',
            G: 'Quantity',
            H: 'Net Weight (KG)'
          }
        ]
      }
      const result = matches(testData, filename)
      expect(result).toBe(matcherResult.WRONG_HEADER)
    })

    test('rejects when commodity code header is missing', () => {
      const testData = {
        RANA: [
          { A: 'RMS-GB-000153' },
          {
            C: 'DESCRIPTION',
            G: 'Quantity',
            H: 'Net Weight (KG)'
          }
        ]
      }
      const result = matches(testData, filename)
      expect(result).toBe(matcherResult.WRONG_HEADER)
    })

    test('rejects when quantity header is missing', () => {
      const testData = {
        RANA: [
          { A: 'RMS-GB-000153' },
          {
            C: 'DESCRIPTION',
            E: 'Commodity Code',
            H: 'Net Weight (KG)'
          }
        ]
      }
      const result = matches(testData, filename)
      expect(result).toBe(matcherResult.WRONG_HEADER)
    })

    test('rejects when net weight header is missing', () => {
      const testData = {
        RANA: [
          { A: 'RMS-GB-000153' },
          {
            C: 'DESCRIPTION',
            E: 'Commodity Code',
            G: 'Quantity'
          }
        ]
      }
      const result = matches(testData, filename)
      expect(result).toBe(matcherResult.WRONG_HEADER)
    })
  })
})
