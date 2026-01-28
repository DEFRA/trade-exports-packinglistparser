import { describe, test, expect, vi } from 'vitest'
import * as matcher from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/buffaload-logistics/model1.js'
import * as regex from '../../../utilities/regex.js'

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

  test("return 'Generic Error' matcher result when undefined is passed", () => {
    const result = matcher.matches(undefined, filename)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })

  test("return 'Generic Error' matcher result when regex.test throws error", () => {
    const testSpy = vi.spyOn(regex, 'test').mockImplementation(() => {
      throw new Error('Test error in regex.test')
    })

    const packingListJson = {
      Tabelle1: [
        {
          B: 'RMS-GB-000098-001'
        }
      ]
    }

    const result = matcher.matches(packingListJson, filename)

    expect(result).toBe(matcherResult.GENERIC_ERROR)

    testSpy.mockRestore()
  })

  test("returns 'Empty File' for empty object", () => {
    const result = matcher.matches({}, filename)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test('returns correct result when multiple sheets have valid data', () => {
    const result = matcher.matches(model.validModelMultipleSheets, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test("return 'Wrong Header' when second sheet has wrong establishment", () => {
    // Note: This returns WRONG_HEADER because the first sheet passes establishment check
    // but then when checking headers across both sheets, the second sheet fails
    const packingListJson = {
      Sheet1: [
        {
          B: 'RMS-GB-000098-001'
        },
        {
          A: 'Description',
          B: 'Nature',
          C: 'Treatment'
        }
      ],
      Sheet2: [
        {
          B: 'WRONG-ESTABLISHMENT'
        },
        {
          A: 'Description',
          B: 'Nature',
          C: 'Treatment'
        }
      ]
    }

    const result = matcher.matches(packingListJson, filename)

    // Returns WRONG_HEADER because it checks headers after establishment check
    expect(result).toBe(matcherResult.WRONG_HEADER)
  })
})
