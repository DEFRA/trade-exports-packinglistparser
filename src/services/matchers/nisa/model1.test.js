import { describe, test, expect } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/nisa/model1.js'

const filename = 'PackingList.xlsx'

describe('matchesNisa', () => {
  test('returns Correct', () => {
    const result = matches(model.validModel, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns Correct With Footer', () => {
    const result = matches(model.validModelWithFooter, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test("returns 'Empty File' matcher result for empty json", () => {
    const packingListJson = {}

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test("returns 'Wrong Establishment Number' matcher result for missing establishment number", () => {
    const packingListJson = {
      Something: [
        {
          A: 'RMS_ESTABLISHMENT_NO',
          I: 'PRODUCT_TYPE_CATEGORY',
          K: 'PART_NUMBER_DESCRIPTION',
          L: 'TARIFF_CODE_EU',
          M: 'PACKAGES',
          O: 'NET_WEIGHT_TOTAL',
          P: 'NET_WEIGHT_PACKAGE_KG',
          U: 'NIRMS'
        },
        {
          A: 'THIS IS WRONG'
        }
      ]
    }

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test("return 'Wrong Establishment Number' matcher result for missing establishment number of multiple sheets", () => {
    const result = matches(model.wrongEstablishmentMultiple, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test("returns 'Wrong Header' matcher result for incorrect header values", () => {
    const packingListJson = {
      sheet: [
        {
          B: 'CORRECT',
          C: 'HEADER',
          L: 'Description'
        },
        {
          A: 'RMS-GB-000025-009'
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
