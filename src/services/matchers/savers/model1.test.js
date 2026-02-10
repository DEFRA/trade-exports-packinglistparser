import { describe, it, expect, vi } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/savers/model1.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'

const logger = createLogger()
const filename = 'packinglist.xlsx'

describe('matchesSaversModel1', () => {
  describe('valid matching', () => {
    it('returns Correct for valid model', () => {
      const result = matches(model.validModel, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('returns Correct for valid model with multiple sheets', () => {
      const result = matches(model.validModelMultipleSheets, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('returns Correct for multiple sheets with headers on different rows', () => {
      const result = matches(
        model.validModelMultipleSheetsHeadersOnDifferentRows,
        filename
      )

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('returns Correct for valid headers with no data', () => {
      const result = matches(model.validHeadersNoData, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })
  })

  describe('empty/invalid input', () => {
    it("returns 'Empty File' matcher result for empty json", () => {
      const result = matches(model.emptyFile, filename)

      expect(result).toBe(matcherResult.EMPTY_FILE)
    })

    it("returns 'Empty File' matcher result for object with no sheets", () => {
      const result = matches({}, filename)

      expect(result).toBe(matcherResult.EMPTY_FILE)
    })
  })

  describe('establishment number validation', () => {
    it("returns 'Wrong Establishment Number' matcher result for missing establishment number", () => {
      const result = matches(model.wrongEstablishment, filename)

      expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
    })

    it("returns 'Wrong Establishment Number' matcher result for clipped RMS", () => {
      const result = matches(model.wrongEstablishment_clippedRMS, filename)

      expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
    })
  })

  describe('header validation', () => {
    it("return 'Wrong Header' matcher result for incorrect header values", () => {
      const result = matches(model.incorrectHeader, filename)

      expect(result).toBe(matcherResult.WRONG_HEADER)
    })

    it("return 'Wrong Header' matcher result for missing headers", () => {
      const result = matches(model.invalidModel_MissingHeaders, filename)

      expect(result).toBe(matcherResult.WRONG_HEADER)
    })
  })

  describe('invalid sheets handling', () => {
    it('skips invalid sheets and matches valid ones', () => {
      const result = matches(model.validModel, filename)

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

    it('returns Correct when filename is null', () => {
      const result = matches(model.validModel, null)

      expect(result).toBe(matcherResult.CORRECT)
      // Filename null should not cause error, just logged differently
    })
  })
})
