/**
 * Savers Model 2 CSV Matcher Tests
 */
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { matches } from './model2.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models-csv/savers/model2.js'

const filename = 'test.csv'

describe('Savers Model 2 CSV Matcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should return CORRECT for valid Savers Model 2 CSV', () => {
    const result = matches(model.validModel, filename)
    expect(result).toBe(matcherResult.CORRECT)
  })

  test('should return EMPTY_FILE for empty CSV', () => {
    const result = matches(model.emptyModel, filename)
    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test('should return EMPTY_FILE for null input', () => {
    const result = matches(null, filename)
    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test('should return WRONG_ESTABLISHMENT_NUMBER for CSV with wrong establishment number', () => {
    const result = matches(model.wrongEstablishmentNumber, filename)
    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test('should return WRONG_HEADER for CSV with wrong headers', () => {
    const result = matches(model.wrongHeaders, filename)
    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test('should return GENERIC_ERROR when an exception is thrown during matching', () => {
    const problematicData = new Proxy([], {
      get() {
        throw new Error('Test error')
      }
    })

    const result = matches(problematicData, filename)
    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
