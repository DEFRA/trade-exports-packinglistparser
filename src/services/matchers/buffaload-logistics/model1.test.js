import { describe, test, expect } from 'vitest'
import * as matcher from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/buffaload-logistics/model1.js'

const filename = 'PackingList.xlsx'

describe('matchesBuffaloadLogisticsModel1', () => {
  test('returns Correct', () => {
    const result = matcher.matches(model.validModel, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test("returns 'Empty File' matcher result for empty json", () => {
    const packingListJson = {}

    const result = matcher.matches(packingListJson, filename)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test("returns 'Wrong Establishment Number' matcher result for missing establishment number", () => {
    const packingListJson = {
      Tabelle1: [
        {
          B: 'INCORRECT'
        }
      ]
    }

    const result = matcher.matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test("returns 'Wrong Establishment Number' matcher result for missing establishment numbers of multiple sheets", () => {
    const result = matcher.matches(model.wrongEstablishmentMultiple, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test("return 'Wrong Header' matcher result for incorrect header values", () => {
    const packingListJson = {
      Tabelle1: [
        {
          B: 'RMS-GB-000098-001'
        },
        {
          A: 'NOT',
          B: 'CORRECT',
          C: 'HEADER'
        }
      ]
    }

    const result = matcher.matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test("return 'Wrong Header' matcher result for incorrect header values of multiple sheets", () => {
    const result = matcher.matches(model.incorrectHeaderMultiple, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test("return 'Generic Error' matcher result when an error occurs", () => {
    const result = matcher.matches(null, null)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
