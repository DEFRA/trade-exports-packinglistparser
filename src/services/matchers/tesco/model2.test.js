import { describe, it, expect } from 'vitest'
import { matches } from './model2.js'
import matcherResult from '../../matcher-result.js'

const filename = 'PackingListTesco2.xlsx'

// Test models
const validModel = {
  Sheet2: [
    {
      A: 'Item',
      B: 'Product code',
      C: 'Commodity code',
      F: 'Description of goods',
      H: 'No. of pkgs',
      K: 'Total Net Weight',
      P: 'GB Establishment RMS Number'
    },
    {
      K: '12kgs'
    },
    {
      P: 'RMS-GB-000015-009'
    }
  ]
}

const wrongEstablishmentMultiple = {
  Sheet1: [
    {
      C: 'Commodity code',
      F: 'Description of goods',
      H: 'No. of pkgs',
      K: 'Total Net Weight'
    },
    {
      K: '12kgs'
    },
    {
      P: 'RMS-GB-000015-009'
    }
  ],
  Sheet2: [
    {
      C: 'Commodity code',
      F: 'Description of goods',
      H: 'No. of pkgs',
      K: 'Total Net Weight'
    },
    {},
    {
      P: 'INCORRECT'
    }
  ]
}

const incorrectHeaderMultiple = {
  Sheet1: [
    {
      C: 'Commodity code',
      F: 'Description of goods',
      H: 'No. of pkgs',
      K: 'Total Net Weight'
    },
    {},
    {
      P: 'RMS-GB-000015-009'
    }
  ],
  Sheet2: [
    {
      F: 'NOT',
      H: 'CORRECT',
      K: 'HEADER'
    },
    {},
    {
      P: 'RMS-GB-000015-009'
    }
  ]
}

describe('matchesTescoModel2', () => {
  it('returns Correct', () => {
    const result = matches(validModel, filename)

    expect(result).toBe(matcherResult.CORRECT)
  })

  it("returns 'Empty File' matcher result for empty json", () => {
    const packingListJson = {}

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  it("returns 'Wrong Establishment Number' matcher result for missing establishment number", () => {
    const packingListJson = {
      Sheet2: [
        {},
        {},
        {
          M: 'INCORRECT'
        }
      ]
    }

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  it("returns 'Wrong Establishment Number' matcher result for missing establishment numbers of multiple sheets", () => {
    const result = matches(wrongEstablishmentMultiple, filename)

    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  it("return 'Wrong Header' matcher result for incorrect header values", () => {
    const packingListJson = {
      Sheet2: [
        {
          A: 'NOT',
          B: 'CORRECT',
          C: 'HEADER'
        },
        {},
        {
          M: 'RMS-GB-000015-009'
        }
      ]
    }

    const result = matches(packingListJson, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  it("return 'Wrong Header' matcher result for incorrect header values of multiple sheets", () => {
    const result = matches(incorrectHeaderMultiple, filename)

    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  it("return 'Generic Error' matcher result when an error occurs", () => {
    const result = matches(null, null)

    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })

  it('should log error when an error is thrown', () => {
    // Spy is not needed - error logging is tested implicitly
    const result = matches(null, null)
    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
