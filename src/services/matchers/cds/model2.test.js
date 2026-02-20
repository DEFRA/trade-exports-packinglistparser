import { describe, test, expect } from 'vitest'
import { matches } from './model2.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/cds/model2.js'

const filename = 'packinglist.xlsx'

describe('CDS Model 2 Matcher', () => {
  test('matches valid CDS Model 2 file', () => {
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
        {
          K: 'INCORRECT'
        }
      ]
    }

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test('returns WRONG_ESTABLISHMENT_NUMBER for missing establishment numbers of multiple sheets', () => {
    const result = matches(model.wrongEstablishmentMultiple, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test('returns WRONG_HEADER for incorrect header values', () => {
    const packingListJson = {
      PackingList_Extract: [
        {
          A: 'NOT',
          B: 'CORRECT',
          C: 'HEADER'
        },
        {
          K: 'THE RANGE / RMS-GB-000252-002 / DN8 4HT'
        }
      ]
    }

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test('returns WRONG_HEADER for incorrect header values of multiple sheets', () => {
    const result = matches(model.incorrectHeaderMultiple, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test('matches valid CDS Model 2 file with multiple sheets', () => {
    const result = matches(model.validModelMultipleSheets, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns GENERIC_ERROR when an exception occurs', () => {
    const result = matches(null, filename)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
