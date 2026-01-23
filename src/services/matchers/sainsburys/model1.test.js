import { describe, test, expect } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/sainsburys/model1.js'

const filename = 'packinglist.xlsx'

describe('matchesSainsburysModel1', () => {
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
          N: 'Incorrect'
        }
      ]
    }

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test("returns 'Wrong Establishment Number' matcher result for missing establishment numbers of multiple sheets", () => {
    const packingListJson = {
      Sheet1: [
        {
          C: 'Product Type / Category',
          E: 'Product / Part Number Description',
          G: 'Packages',
          H: 'Net\nWeight / Package KG',
          J: 'Type of treatment',
          N: 'RMS Number (based on depot)',
          O: 'Commodity Code',
          P: 'NIRMS or non-NIRMS'
        },
        {
          N: 'RMS-GB-000094-001'
        }
      ],
      Sheet2: [
        {},
        {
          N: 'Incorrect'
        }
      ]
    }

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test("return 'Wrong Header' matcher result for incorrect header values", () => {
    const packingListJson = {
      Sheet1: [
        {
          C: 'NOT_CORRECT',
          E: 'Product / Part Number Description',
          G: 'Packages',
          H: 'Net\nWeight / Package KG',
          J: 'Type of treatment',
          N: 'RMS Number (based on depot)',
          O: 'Commodity Code',
          P: 'NIRMS or non-NIRMS'
        },
        {
          N: 'RMS-GB-000094-001'
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

  test('returns Correct', () => {
    const result = matches(model.validModel, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test("return 'Generic Error' matcher result when an error occurs", () => {
    const result = matches(null, null)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
