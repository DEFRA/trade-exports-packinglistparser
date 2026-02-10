import { describe, it, expect } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'

const validModel = {
  PackingList_Extract: [
    {
      A: 'Description of Goods',
      B: 'Commodity code',
      C: 'No. of pkgs',
      D: 'Item Net Weight kg',
      E: 'Nature of Product',
      F: 'Type of Treatment',
      G: 'Country of Origin',
      H: 'NIRMS / NON NIRMS',
      I: 'RMS-GB-000156-001'
    }
  ]
}

const wrongEstablishment = {
  PackingList_Extract: [
    {},
    {
      I: 'INCORRECT'
    }
  ]
}

const incorrectHeader = {
  PackingList_Extract: [
    {
      A: 'NOT',
      B: 'CORRECT',
      C: 'HEADER',
      I: 'RMS-GB-000156-001'
    }
  ]
}

const filename = 'packinglist.xlsx'

describe('Turners Model 1 matcher', () => {
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

  it('returns GENERIC_ERROR when error occurs', () => {
    const result = matches(null, null)
    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
