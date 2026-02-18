import { describe, test, expect } from 'vitest'
import { matches } from './model2.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/nisa/model2.js'

const filename = 'packinglist.xlsx'

describe('NISA Model 2 Matcher', () => {
  test('matches valid NISA Model 2 file', () => {
    const result = matches(model.validModel, filename)
    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns EMPTY_FILE for empty json', () => {
    const result = matches({}, filename)
    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test('returns WRONG_ESTABLISHMENT_NUMBER for invalid establishment', () => {
    const result = matches(model.wrongEstablishment, filename)
    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test('returns WRONG_HEADER for incorrect headers', () => {
    const result = matches(model.incorrectHeader, filename)
    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test('matches valid NISA Model 2 file with multiple sheets', () => {
    const result = matches(model.validModelMultipleSheets, filename)
    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns WRONG_ESTABLISHMENT_NUMBER for multiple sheets with one wrong establishment', () => {
    const result = matches(model.wrongEstablishmentMultiple, filename)
    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test('returns WRONG_HEADER for multiple sheets with one wrong header', () => {
    const result = matches(model.incorrectHeaderMultiple, filename)
    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test('returns GENERIC_ERROR when an exception occurs', () => {
    const result = matches(null, filename)
    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
