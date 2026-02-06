/**
 * Mars matcher unit tests
 */
import { describe, it, expect } from 'vitest'
import { matches } from './model1.js'
import MatcherResult from '../../matcher-result.js'
import testData from '../../../../test/test-data-and-results/models/mars/model1.js'

const filename = 'packinglist.xlsx'

describe('matchesMarsModel1', () => {
  it("returns 'Empty File' matcher result for empty json", () => {
    const result = matches({}, filename)

    expect(result).toBe(MatcherResult.EMPTY_FILE)
  })

  it('returns Correct', () => {
    const result = matches(testData.validModel, filename)

    expect(result).toBe(MatcherResult.CORRECT)
  })

  it("returns 'Wrong Establishment Number' matcher result for missing establishment number", () => {
    const result = matches(testData.incorrectEstablishmentNumber, filename)

    expect(result).toBe(MatcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  it("returns 'Wrong Establishment Number' matcher result for missing establishment numbers of multiple sheets", () => {
    const result = matches(testData.wrongEstablishmentMultiple, filename)

    expect(result).toBe(MatcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  it("returns 'Wrong Header' matcher result for incorrect header values", () => {
    const result = matches(testData.incorrectHeader, filename)

    expect(result).toBe(MatcherResult.WRONG_HEADER)
  })

  it("return 'Wrong Header' matcher result for incorrect header values of multiple sheets", () => {
    const result = matches(testData.incorrectHeaderMultiple, filename)

    expect(result).toBe(MatcherResult.WRONG_HEADER)
  })
  it("return 'Generic Error' matcher result when an error occurs", () => {
    const result = matches(null, null)

    expect(result).toBe(MatcherResult.GENERIC_ERROR)
  })
})
