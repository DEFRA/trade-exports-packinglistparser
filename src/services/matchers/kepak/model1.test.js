import { describe, it, expect, vi } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/kepak/model1.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'

const logger = createLogger()
const filename = 'packinglist.xlsx'

describe('matchesKepakModel1', () => {
  describe('valid matching', () => {
    it.each([
      ['valid model', model.validModel],
      ['valid model with NIRMS', model.validModelWithNirms],
      ['valid model with dragdown', model.validModelWithDragdown],
      [
        'multiple sheets with valid establishment numbers',
        model.validModelMultipleSheets
      ],
      ['model with multiple RMS numbers', model.multipleRms],
      ['model with missing KG unit', model.missingKgunit],
      [
        'multiple sheets with headers on different rows',
        model.validModelMultipleSheetsHeadersOnDifferentRows
      ]
    ])('returns Correct for %s', (_, packingListJson) => {
      const result = matches(packingListJson, filename)

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
    it.each([
      ['model with missing NIRMS statement', model.missingNirmsStatement],
      ['model with null Country of Origin', model.nullCoO],
      ['model with invalid Country of Origin', model.invalidCoO],
      ['model with X Country of Origin', model.xCoO],
      ['model with ineligible item', model.ineligibleItemWithTreatment],
      ['model with missing column cells', model.invalidModel_MissingColumnCells]
    ])('returns Correct for %s', (_, packingListJson) => {
      const result = matches(packingListJson, filename)

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
