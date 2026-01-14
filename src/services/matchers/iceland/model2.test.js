import { describe, test, expect } from 'vitest'
import { matches } from './model2.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models-csv/iceland/model2.js'

const filename = 'iceland-packinglist.csv'

describe('Iceland Model 2 CSV Matcher', () => {
  test('matches valid Iceland Model 2 CSV file', () => {
    const result = matches(model.validModel, filename)
    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns EMPTY_FILE for empty csv', () => {
    const result = matches(model.emptyModel, filename)
    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test('returns EMPTY_FILE for null input', () => {
    const result = matches(null, filename)
    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test('returns WRONG_ESTABLISHMENT_NUMBER for invalid establishment', () => {
    const result = matches(model.wrongEstablishmentNumber, filename)
    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test('returns WRONG_HEADER for incorrect headers', () => {
    const result = matches(model.wrongHeaders, filename)
    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test('returns CORRECT for valid CoO model', () => {
    const result = matches(model.validCooModel, filename)
    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns GENERIC_ERROR when exception occurs', () => {
    // Pass invalid data structure to trigger error
    const invalidData = {
      toString: () => {
        throw new Error('Test error')
      }
    }
    const result = matches(invalidData, filename)
    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
