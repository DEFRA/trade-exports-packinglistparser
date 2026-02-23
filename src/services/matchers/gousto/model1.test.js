import { describe, it, expect } from 'vitest'
import matcherResult from '../../matcher-result.js'
import { matches } from './model1.js'
import model from '../../../../test/test-data-and-results/models/gousto/model1.js'

const filename = 'packinglist.xlsx'

describe('matchesGousto', () => {
  it('returns "Empty File" matcher result for empty json', () => {
    const result = matches({}, filename)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  it('returns Correct', () => {
    const result = matches(model.validModel, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  it('returns "Wrong Establishment Number" matcher result for missing establishment number', () => {
    const result = matches(model.incorrectEstablishmentNumber, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  it('returns "Wrong Establishment Number" matcher result for missing establishment numbers of multiple sheets', () => {
    const result = matches(model.wrongEstablishmentMultiple, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  it('return "Wrong Header" matcher result for incorrect header values', () => {
    const result = matches(model.incorrectHeader, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  it('return "Wrong Header" matcher result for incorrect header values of multiple sheets', () => {
    const result = matches(model.incorrectHeaderMultiple, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  it('return "Generic Error" matcher result when an error occurs', () => {
    const result = matches(null, null)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
