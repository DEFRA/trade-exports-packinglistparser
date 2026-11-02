import { describe, test, expect } from 'vitest'
import { matches } from './model2.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/fowlerwelch/model2.js'

const filename = 'packinglist.xlsx'

describe('matchesFowlerwelch2', () => {
  test.each([
    ['empty json', {}],
    [
      'workbook containing only invalid sheets',
      {
        'GC REFERENCE': [{ A: 'INVALID' }],
        'GC REF': [{ A: 'INVALID' }]
      }
    ]
  ])("returns 'Empty File' matcher result for %s", (_, packingListJson) => {
    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test.each([
    ['one sheet', model.invalid_Model_IncorrectEstablishmentNumber],
    [
      'multiple sheets',
      model.invalid_Model_IncorrectEstablishmentNumberMultiple
    ]
  ])(
    "returns 'Wrong Establishment Number' matcher result for %s",
    (_, packingListJson) => {
      const result = matches(packingListJson, filename)

      expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
    }
  )

  test.each([
    ['one sheet', model.invalid_Model_IncorrectHeader],
    ['multiple sheets', model.invalid_Model_IncorrectHeaderMultiple]
  ])("returns 'Wrong Header' matcher result for %s", (_, packingListJson) => {
    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test.each([
    ['one sheet', model.validModel],
    ['multiple sheets', model.validModel_Multiple]
  ])('returns correct for correct headers for %s', (_, packingListJson) => {
    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test("return 'Generic Error' matcher result when an error occurs", () => {
    const result = matches(null, null)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
