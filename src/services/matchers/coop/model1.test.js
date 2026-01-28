import { describe, test, expect } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/coop/model1.js'

const filename = 'packinglist.xlsx'

describe('Co-op Model 1 Matcher', () => {
  test('returns Correct', () => {
    const result = matches(model.validModel, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns EMPTY_FILE for empty json', () => {
    const packingListJson = {}

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test('returns WRONG_ESTABLISHMENT_NUMBER for missing establishment number', () => {
    const packingListJson = {
      PackingList_Extract: [
        {},
        {},
        {
          E: 'INCORRECT'
        }
      ]
    }

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test('returns WRONG_ESTABLISHMENT_NUMBER for incorrect establishment number', () => {
    const result = matches(model.wrongEstablishment, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test('returns WRONG_ESTABLISHMENT_NUMBER for incorrect establishment on multiple sheets', () => {
    const result = matches(model.wrongEstablishmentMultiple, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test('returns WRONG_HEADER for incorrect headers', () => {
    const result = matches(model.incorrectHeader, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test('returns WRONG_HEADER for incorrect headers on multiple sheets', () => {
    const result = matches(model.incorrectHeaderMultiple, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test('returns Correct for valid model with multiple sheets', () => {
    const result = matches(model.validModelMultipleSheets, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })
})
