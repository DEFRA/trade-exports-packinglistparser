import { describe, test, expect } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/coop/model1.js'

const filename = 'packinglist.xlsx'

describe('Co-op Model 1 Matcher', () => {
  test.each([
    ['valid model', model.validModel],
    ['valid model with multiple sheets', model.validModelMultipleSheets]
  ])('returns Correct for %s', (_, packingListJson) => {
    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns EMPTY_FILE for empty json', () => {
    const packingListJson = {}

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test.each([
    [
      'missing establishment number',
      {
        PackingList_Extract: [
          {},
          {},
          {
            E: 'INCORRECT'
          }
        ]
      }
    ],
    ['incorrect establishment number', model.wrongEstablishment],
    [
      'incorrect establishment on multiple sheets',
      model.wrongEstablishmentMultiple
    ]
  ])('returns WRONG_ESTABLISHMENT_NUMBER for %s', (_, packingListJson) => {
    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test.each([
    ['incorrect headers', model.incorrectHeader],
    ['incorrect headers on multiple sheets', model.incorrectHeaderMultiple]
  ])('returns WRONG_HEADER for %s', (_, packingListJson) => {
    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test('returns GENERIC_ERROR when an error is thrown during processing', () => {
    // Create a malformed object that will cause an error when accessed
    const malformedPackingList = {
      get sheet1() {
        throw new Error('Test error')
      }
    }

    const result = matches(malformedPackingList, filename)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
