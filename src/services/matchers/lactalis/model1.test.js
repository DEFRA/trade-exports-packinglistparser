import { describe, test, expect } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/lactalis/model1.js'

const filename = 'packinglist-lactalis-model1.xlsx'

describe('matchesLactalisModel1', () => {
  test('returns Correct for MCL (Q8) format', () => {
    const result = matches(model.validModel, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns Correct for LNCD (Q7) format', () => {
    const result = matches(model.validModelLncd, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test("returns 'Empty File' matcher result for empty json", () => {
    const packingListJson = {}

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test("returns 'Wrong Establishment Number' matcher result for non-matching establishment number", () => {
    const result = matches(model.wrongEstablishment, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test("returns 'Wrong Header' matcher result for incorrect header values", () => {
    const result = matches(model.incorrectHeader, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test("returns 'Generic Error' matcher result when an error occurs", () => {
    const result = matches(null, null)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
