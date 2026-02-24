import { describe, test, expect } from 'vitest'
import { matches } from './model2.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/nutricia/model2.js'

const filename = 'packinglist.xlsx'

describe('matchesNutriciaModel2', () => {
  test('matches valid Nutricia Model 2 file', () => {
    const result = matches(model.modelWithNoUnitInHeader, filename)
    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns EMPTY_FILE for empty json', () => {
    const result = matches({}, filename)
    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test('returns WRONG_ESTABLISHMENT_NUMBER for invalid establishment', () => {
    const result = matches(
      model.invalidModel_IncorrectEstablishmentNumber,
      filename
    )
    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test('returns WRONG_ESTABLISHMENT_NUMBER for multiple sheets with one wrong establishment', () => {
    const result = matches(model.wrongEstablishmentMultiple, filename)
    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test('returns WRONG_HEADER for incorrect headers', () => {
    const result = matches(model.invalidModel_IncorrectHeaders, filename)
    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test('returns WRONG_HEADER for multiple sheets with one wrong header', () => {
    const result = matches(model.incorrectHeaderMultiple, filename)
    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test('returns GENERIC_ERROR when an exception occurs', () => {
    const result = matches(null, null)
    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
