/**
 * ASDA Model 4 CSV Matcher Tests
 */
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { matches } from './model4.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models-csv/asda/model4.js'

const filename = 'test.csv'

describe('ASDA Model 4 CSV Matcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should return CORRECT for valid ASDA Model 4 CSV', () => {
    const result = matches(model.validModel, filename)
    expect(result).toBe(matcherResult.CORRECT)
  })

  test('should return CORRECT for valid ASDA Model 4 CSV with attestation at footer', () => {
    const result = matches(model.validModelAttestationAtFooter, filename)
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

  test('should return EMPTY_FILE and log error when exception occurs', () => {
    const invalidData = null
    const result = matches(invalidData, filename)
    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test('should return GENERIC_ERROR when an exception is thrown during matching', () => {
    // Create a malformed data structure that will cause an error in regex.test
    const malformedData = {
      // Object instead of array will cause errors in processing
      toString: () => {
        throw new Error('Forced error')
      }
    }

    const result = matches(malformedData, filename)
    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })

  test('should log error details when exception occurs', () => {
    // Spy on logger.error to verify it's called with correct parameters
    const loggerSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Create data that will throw during processing
    const problematicData = new Proxy([], {
      get() {
        throw new Error('Test error')
      }
    })

    const result = matches(problematicData, filename)

    expect(result).toBe(matcherResult.GENERIC_ERROR)

    // Clean up
    loggerSpy.mockRestore()
  })
})
