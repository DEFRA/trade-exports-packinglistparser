import { matches } from './model2.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/booker/model2.js'

const filename = 'packinglist.xls'

describe('matchesBookerModel2', () => {
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
    const packingListJson = {
      Sheet1: [
        {},
        {
          H: 'INCORRECT'
        }
      ]
    }

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test("returns 'Wrong Establishment Number' matcher result for missing establishment numbers of multiple sheets", () => {
    const result = matches(model.wrongEstablishmentMultiple, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test("return 'Wrong Header' matcher result for incorrect header values", () => {
    const packingListJson = {
      Sheet1: [
        {
          B: 'NOT',
          D: 'CORRECT',
          F: 'HEADER'
        },
        {
          H: 'RMS-GB-000077-010'
        }
      ]
    }

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test("return 'Wrong Header' matcher result for incorrect header values of multiple sheets", () => {
    const result = matches(model.incorrectHeaderMultiple, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test("return 'Generic Error' matcher result when an error occurs", () => {
    const result = matches(null, null)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
