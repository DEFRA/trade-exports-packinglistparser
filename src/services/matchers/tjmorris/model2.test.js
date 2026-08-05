import { describe, test, expect } from 'vitest'
import { matches } from './model2.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/tjmorris/model2.js'

const filename = 'packinglist.xls'

describe('matchesTjmorris', () => {
  test('returns Empty File matcher result for empty json', () => {
    const packingListJson = {}

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test.each([
    [
      'missing establishment number',
      {
        Sheet1: [
          {},
          {
            A: 'Incorrect'
          }
        ]
      }
    ],
    [
      'missing establishment numbers of multiple sheets',
      model.wrongEstablishmentMultiple
    ]
  ])(
    'returns Wrong Establishment Number matcher result for %s',
    (_, packingListJson) => {
      const result = matches(packingListJson, filename)

      expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
    }
  )

  test.each([
    [
      'incorrect header values',
      {
        Sheet1: [
          {
            B: 'wrong',
            J: 'Treatment Type',
            L: 'Description',
            O: 'Tariff/Commodity',
            P: 'Number of packages',
            R: 'Net Weight Kg',
            T: 'Country of Origin'
          },
          {
            A: 'RMS-GB-000010-001'
          }
        ]
      }
    ],
    [
      'invalid header values',
      {
        Sheet1: [
          {
            A: 'NOT',
            B: 'CORRECT',
            C: 'HEADER',
            L: 'Description'
          },
          {
            A: 'RMS-GB-000010-001'
          }
        ]
      }
    ],
    [
      'incorrect header values of multiple sheets',
      model.incorrectHeaderMultiple
    ]
  ])('returns wrong header for %s', (_, packingListJson) => {
    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test('returns Correct', () => {
    const packingListJson = {
      Sheet1: [
        {
          B: 'Nature of Products',
          J: 'Treatment Type',
          L: 'Description',
          O: 'Tariff/Commodity',
          P: 'Number of packages',
          R: 'Net Weight Kg',
          T: 'Country of Origin'
        },
        {
          A: 'RMS-GB-000010-001'
        }
      ]
    }

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  test('return Generic Error matcher result when an error occurs', () => {
    const result = matches(null, null)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
