import { describe, test, expect } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/bartonredman/model1.js'

const FILENAME = 'packinglist.xlsx'

describe('Barton and Redman Model 1 Matcher', () => {
  test('returns Correct', () => {
    const result = matches(model.validModel, FILENAME)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns EMPTY_FILE for empty json', () => {
    const result = matches({}, FILENAME)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test('returns WRONG_ESTABLISHMENT_NUMBER for incorrect establishment number', () => {
    const result = matches(model.wrongEstablishment, FILENAME)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test('returns WRONG_HEADER for incorrect headers', () => {
    const result = matches(model.incorrectHeader, FILENAME)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test('returns Correct when invalid sheets are present and a valid sheet exists', () => {
    const packingListJson = {
      References: [
        {
          A: 'INVALID SHEET CONTENT'
        }
      ],
      'Input Packing Sheet': model.validModel['Input Packing Sheet']
    }

    const result = matches(packingListJson, FILENAME)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns EMPTY_FILE when workbook contains only invalid sheets', () => {
    const packingListJson = {
      References: [
        {
          A: 'INVALID SHEET CONTENT'
        }
      ],
      Lookups: [
        {
          A: 'MORE INVALID SHEET CONTENT'
        }
      ]
    }

    const result = matches(packingListJson, FILENAME)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test('returns GENERIC_ERROR when an error is thrown during processing', () => {
    const malformedPackingList = {
      get sheet1() {
        throw new Error('Test error')
      }
    }

    const result = matches(malformedPackingList, FILENAME)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
