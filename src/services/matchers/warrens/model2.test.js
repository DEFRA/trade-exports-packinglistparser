import { describe, test, expect } from 'vitest'
import { matches } from './model2.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/warrens/model2.js'

const filename = 'packinglist.xlsx'

describe('matchesWarrens2', () => {
  test("returns 'Empty File' matcher result for empty json", () => {
    const packingListJson = {}

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test("returns 'Empty File' when workbook contains only invalid sheets", () => {
    const packingListJson = {
      'GC REFERENCE': [{ A: 'INVALID' }],
      'GC REF': [{ A: 'INVALID' }]
    }

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test("returns 'Wrong Establishment Number' matcher result for missing establishment number for one sheet", () => {
    const result = matches(
      model.invalid_Model_IncorrectEstablishmentNumber,
      filename
    )

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test("returns 'Wrong Establishment Number' matcher result for missing establishment numbers of multiple sheets", () => {
    const result = matches(
      model.invalid_Model_IncorrectEstablishmentNumberMultiple,
      filename
    )

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test("returns 'Wrong Header' matcher result for incorrect header values of one sheet", () => {
    const result = matches(model.invalid_Model_IncorrectHeader, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test("returns 'Wrong Header' matcher result for incorrect header values of multiple sheets", () => {
    const result = matches(
      model.invalid_Model_IncorrectHeaderMultiple,
      filename
    )

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test('returns correct for correct headers for one sheet', () => {
    const result = matches(model.validModel, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns correct for correct headers of multiple sheets', () => {
    const result = matches(model.validModel_Multiple, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test("return 'Generic Error' matcher result when an error occurs", () => {
    const result = matches(null, null)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
