import { describe, test, expect } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/manfreight/model1.js'

const filename = 'packinglist-manfreight-model1.xlsx'

describe('matchesManfreightModel1', () => {
  test('returns Correct', () => {
    const result = matches(model.validModel, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test("returns 'Empty File' matcher result for empty json", () => {
    const packingListJson = {}

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test.each([
    ['missing establishment number', model.wrongEstablishment],
    [
      'missing establishment numbers of multiple sheets',
      model.wrongEstablishmentMultiple
    ]
  ])(
    "returns 'Wrong Establishment Number' matcher result for %s",
    (_, packingListJson) => {
      const result = matches(packingListJson, filename)

      expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
    }
  )

  test.each([
    ['incorrect header values', model.incorrectHeader],
    [
      'incorrect header values of multiple sheets',
      model.incorrectHeaderMultiple
    ]
  ])("return 'Wrong Header' matcher result for %s", (_, packingListJson) => {
    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test("return 'Generic Error' matcher result when an error occurs", () => {
    const result = matches(null, null)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
