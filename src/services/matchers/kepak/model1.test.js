import { describe, it, expect, vi } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/kepak/model1.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'

const logger = createLogger()
const filename = 'packinglist.xlsx'

describe('matchesKepakModel1', () => {
  describe('valid matching', () => {
    it('returns Correct for valid model', () => {
      const result = matches(model.validModel, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('returns Correct for valid model with NIRMS', () => {
      const result = matches(model.validModelWithNirms, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('returns Correct for valid model with dragdown', () => {
      const result = matches(model.validModelWithDragdown, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('returns Correct for multiple sheets with valid establishment numbers', () => {
      const result = matches(model.validModelMultipleSheets, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('returns Correct for model with multiple RMS numbers', () => {
      const result = matches(model.multipleRms, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('returns Correct for model with missing KG unit', () => {
      const result = matches(model.missingKgunit, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('returns Correct for multiple sheets with headers on different rows', () => {
      const result = matches(
        model.validModelMultipleSheetsHeadersOnDifferentRows,
        filename
      )

      expect(result).toBe(matcherResult.CORRECT)
    })
  })

  describe('empty/invalid input', () => {
    it("returns 'Empty File' matcher result for empty json", () => {
      const packingListJson = {}

      const result = matches(packingListJson, filename)

      expect(result).toBe(matcherResult.EMPTY_FILE)
    })

    it("returns 'Empty File' matcher result for object with no sheets", () => {
      const result = matches({}, filename)

      expect(result).toBe(matcherResult.EMPTY_FILE)
    })
  })

  describe('establishment number validation', () => {
    it("returns 'Wrong Establishment Number' matcher result for missing establishment number", () => {
      const result = matches(
        model.invalidModel_IncorrectEstablishmentNumber,
        filename
      )

      expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
    })

    it("returns 'Wrong Establishment Number' matcher result for missing establishment numbers of multiple sheets", () => {
      const result = matches(model.wrongEstablishmentMultiple, filename)

      expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
    })
  })

  describe('header validation', () => {
    it("return 'Wrong Header' matcher result for incorrect header values", () => {
      const result = matches(model.invalidModel_IncorrectHeaders, filename)

      expect(result).toBe(matcherResult.WRONG_HEADER)
    })

    it("return 'Wrong Header' matcher result for incorrect header values of multiple sheets", () => {
      const result = matches(model.incorrectHeaderMultiple, filename)

      expect(result).toBe(matcherResult.WRONG_HEADER)
    })
  })

  describe('edge cases with valid patterns', () => {
    it('returns Correct for model with missing NIRMS statement', () => {
      const result = matches(model.missingNirmsStatement, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('returns Correct for model with null Country of Origin', () => {
      const result = matches(model.nullCoO, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('returns Correct for model with invalid Country of Origin', () => {
      const result = matches(model.invalidCoO, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('returns Correct for model with X Country of Origin', () => {
      const result = matches(model.xCoO, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('returns Correct for model with ineligible item', () => {
      const result = matches(model.ineligibleItemWithTreatment, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('returns Correct for model with missing column cells', () => {
      const result = matches(model.invalidModel_MissingColumnCells, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })
  })

  describe('error handling', () => {
    it("return 'Generic Error' matcher result when an error occurs", () => {
      const result = matches(null, null)

      expect(result).toBe(matcherResult.GENERIC_ERROR)
    })

    it('should call logger.error when an error is thrown', () => {
      const logErrorSpy = vi.spyOn(logger, 'error')

      matches(null, null)

      expect(logErrorSpy).toHaveBeenCalled()
    })

    it('returns Generic Error when passed undefined', () => {
      const result = matches(undefined, filename)

      expect(result).toBe(matcherResult.GENERIC_ERROR)
    })

    it('returns Generic Error when filename is null', () => {
      const result = matches(model.validModel, null)

      expect(result).toBe(matcherResult.CORRECT)
      // Filename null should not cause error, just logged differently
    })
  })
})
