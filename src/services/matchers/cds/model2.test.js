import { describe, test, expect } from 'vitest'
import { matches } from './model2.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/cds/model2.js'

const filename = 'packinglist.xlsx'

describe('CDS Model 2 Matcher', () => {
  test.each([
    ['valid CDS Model 2 file', model.validModel],
    [
      'valid CDS Model 2 file with multiple sheets',
      model.validModelMultipleSheets
    ]
  ])('matches %s', (_, packingListJson) => {
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
          {
            K: 'INCORRECT'
          }
        ]
      }
    ],
    [
      'missing establishment numbers of multiple sheets',
      model.wrongEstablishmentMultiple
    ]
  ])('returns WRONG_ESTABLISHMENT_NUMBER for %s', (_, packingListJson) => {
    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test.each([
    [
      'incorrect header values',
      {
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
    ],
    [
      'incorrect header values of multiple sheets',
      model.incorrectHeaderMultiple
    ]
  ])('returns WRONG_HEADER for %s', (_, packingListJson) => {
    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test('returns GENERIC_ERROR when an exception occurs', () => {
    const result = matches(null, filename)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
