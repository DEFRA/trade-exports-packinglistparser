import { describe, test, expect } from 'vitest'
import { matches } from './model3.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/tesco/model3.js'

const filename = 'PackingListTesco3.xlsx'

describe('matchesTescoModel3', () => {
  test('returns Correct', () => {
    const result = matches(model.validModel, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test("returns 'Empty File' matcher result for empty json", () => {
    const packingListJson = {}

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test("returns 'Wrong Establishment Number' matcher result for missing establishment number", () => {
    const result = matches(model.wrongEstablishment, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test("returns 'Wrong Establishment Number' matcher result for missing establishment numbers of multiple sheets", () => {
    const result = matches(model.wrongEstablishmentMultiple, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test("returns 'Wrong Header' matcher result for incorrect header values", () => {
    const result = matches(model.incorrectHeader, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test("returns 'Wrong Header' matcher result for incorrect header values of multiple sheets", () => {
    const result = matches(model.incorrectHeaderMultiple, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test("returns 'Generic Error' matcher result when an error occurs", () => {
    const result = matches(null, null)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
