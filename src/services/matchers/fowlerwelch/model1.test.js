import { describe, it, expect, vi } from 'vitest'
import MatcherResult from '../../matcher-result.js'
import { matches } from './model1.js'
import model from '../../../../test/test-data-and-results/models/fowlerwelch/model1.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'

const filename = 'packinglist.xlsx'

describe('matchesFowlerWelch', () => {
  it("returns 'Empty File' matcher result for empty json", () => {
    const packingListJson = {}

    const result = matches(packingListJson, filename)

    expect(result).toBe(MatcherResult.EMPTY_FILE)
  })

  it("returns 'Wrong Establishment Number' matcher result for missing establishment number for one sheet", () => {
    const result = matches(
      model.invalid_Model_IncorrectEstablishmentNumber,
      filename
    )

    expect(result).toBe(MatcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  it("returns 'Wrong Establishment Number' matcher result for missing establishment numbers of multiple sheets", () => {
    const result = matches(
      model.invalid_Model_IncorrectEstablishmentNumberMultiple,
      filename
    )

    expect(result).toBe(MatcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  it("returns 'Wrong Header' matcher result for incorrect header values of one sheet", () => {
    const filename = 'packinglist.xlsx'
    const result = matches(model.invalid_Model_IncorrectHeader, filename)

    expect(result).toBe(MatcherResult.WRONG_HEADER)
  })

  it("returns 'Wrong Header' matcher result for incorrect header values of multiple sheets", () => {
    const filename = 'packinglist.xlsx'
    const result = matches(
      model.invalid_Model_IncorrectHeaderMultiple,
      filename
    )

    expect(result).toBe(MatcherResult.WRONG_HEADER)
  })

  it('returns correct for correct headers for one sheet', () => {
    const result = matches(model.validModel, filename)

    expect(result).toBe(MatcherResult.CORRECT)
  })

  it('returns correct for correct headers of multiple sheets', () => {
    const result = matches(model.validModel_Multiple, filename)

    expect(result).toBe(MatcherResult.CORRECT)
  })

  it("if the key is equal to 'K' and doesn't include 'Net Weight' in its header, return 'Wrong Header' matcher result", () => {
    const filename = 'packinglist.xlsx'
    const packingListJson = {
      'Cust Ord - Vitacress': [
        {
          C: 'Commodity code',
          F: 'Description of goods',
          H: 'No. of pkgs',
          K: 'Item (kgs)',
          N: 'Treatment Type (Chilled /Ambient)'
        },
        {
          M: 'RMS-GB-000216-002'
        }
      ]
    }

    const result = matches(packingListJson, filename)

    expect(result).toBe(MatcherResult.WRONG_HEADER)
  })

  it("if the header doesn't start with the header[key], return 'Wrong Header' matcher result", () => {
    const filename = 'packinglist.xlsx'
    const packingListJson = {
      'Cust Ord - Vitacress': [
        {
          C: 'Commodity code',
          F: 'Description of goods',
          H: '(318)',
          K: 'Item Net Weight (kgs)',
          N: 'Treatment Type (Chilled /Ambient)'
        },
        {
          M: 'RMS-GB-000216-002'
        }
      ]
    }

    const result = matches(packingListJson, filename)

    expect(result).toBe(MatcherResult.WRONG_HEADER)
  })

  it("if all required headers are missing, return 'Wrong Header' matcher result", () => {
    const filename = 'packinglist.xlsx'
    const result = matches(model.invalidModel_MissingHeaders, filename)

    expect(result).toBe(MatcherResult.WRONG_HEADER)
  })

  it("return 'Generic Error' matcher result when an error occurs", () => {
    const result = matches(null, null)

    expect(result).toBe(MatcherResult.GENERIC_ERROR)
  })

  it('should call logger.error when an error is thrown', () => {
    const logger = createLogger()
    const errorSpy = vi.spyOn(logger, 'error')

    matches(null, null)

    expect(errorSpy).toHaveBeenCalled()
  })

  it('skips processing for sheets listed in invalidSheets', () => {
    const packingListJson = {
      Invoice: [
        {
          C: 'Commodity code',
          F: 'Description of goods',
          H: 'No. of pkgs',
          K: 'Item Net Weight (kgs)',
          N: 'Treatment Type (Chilled /Ambient)'
        }
      ]
    }

    const result = matches(packingListJson, filename)

    expect(result).toBe(MatcherResult.EMPTY_FILE)
  })
})
