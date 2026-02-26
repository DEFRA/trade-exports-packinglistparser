import { describe, it, expect } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'

const ESTABLISHMENT_NUMBER = 'RMS-GB-000219-001'

const validModel = {
  Revised: [
    {
      C: 'Commodity code',
      F: 'Description of goods',
      G: 'Country of Origin',
      H: 'No. of packages',
      K: 'Item Net Weight (kgs)',
      M: ESTABLISHMENT_NUMBER,
      N: 'Nature of Product',
      O: 'Type of Treatment',
      P: 'NIRMS Red/Green Lane'
    },
    {
      C: '709999090',
      F: 'Herb Lovage x1kg',
      G: 'IT',
      H: '2',
      K: '2',
      M: ESTABLISHMENT_NUMBER,
      N: 'Chilled',
      O: 'Raw',
      P: 'Green'
    }
  ],
  References: [{ A: 'Country of Origin', B: 'ISO Code' }],
  Lookups: [{ A: 'Incoterms', B: 'Incoterms Desc' }],
  Meursing: [{ I: 'Sucrose' }]
}

const wrongEstablishment = {
  Revised: [{}, { I: 'INCORRECT' }]
}

const incorrectHeader = {
  Revised: [
    {
      A: 'NOT',
      B: 'CORRECT',
      C: 'HEADER',
      M: ESTABLISHMENT_NUMBER
    }
  ]
}

const missingCommodityCode = {
  Revised: [
    {
      F: 'Description of goods',
      G: 'Country of Origin',
      H: 'No. of packages',
      K: 'Item Net Weight (kgs)',
      M: ESTABLISHMENT_NUMBER,
      N: 'Nature of Product',
      O: 'Type of Treatment',
      P: 'NIRMS Red/Green Lane'
    }
  ]
}

const filename = 'burbank-packinglist.xlsx'

describe('Burbank Model 1 matcher', () => {
  it('returns CORRECT for valid model', () => {
    const result = matches(validModel, filename)
    expect(result).toBe(matcherResult.CORRECT)
  })

  it('returns EMPTY_FILE for empty json', () => {
    const result = matches({}, filename)
    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  it('returns WRONG_ESTABLISHMENT_NUMBER for missing establishment number', () => {
    const result = matches(wrongEstablishment, filename)
    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  it('returns WRONG_HEADER for incorrect header values', () => {
    const result = matches(incorrectHeader, filename)
    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  it('returns WRONG_HEADER when commodity code header is missing', () => {
    const result = matches(missingCommodityCode, filename)
    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  it('returns GENERIC_ERROR when error occurs', () => {
    const result = matches(null, null)
    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })

  it('skips invalid sheets and still matches valid Revised sheet', () => {
    const onlyInvalidSheets = {
      References: [{ A: 'Country of Origin' }],
      Lookups: [{ A: 'Incoterms' }],
      Meursing: [{ I: 'Sucrose' }]
    }
    const result = matches(onlyInvalidSheets, filename)
    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  it('skips invalid sheets and returns CORRECT when Revised sheet is valid', () => {
    const result = matches(validModel, filename)
    expect(result).toBe(matcherResult.CORRECT)
  })
})
