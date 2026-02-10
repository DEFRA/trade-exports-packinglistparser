import { describe, it, expect, vi } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/bandm/model1.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'

const logger = createLogger()
const filename = 'packinglist.xlsx'

describe('matchesBandmModel1', () => {
  describe('valid matching', () => {
    it('returns Correct for valid model', () => {
      const result = matches(model.validModel, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('returns Correct for valid model with case insensitive headers', () => {
      const result = matches(model.validModelInsensitiveHeader, filename)

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
      const result = matches(model.emptyModel, filename)

      expect(result).toBe(matcherResult.EMPTY_FILE)
    })

    it("returns 'Empty File' matcher result for object with no sheets", () => {
      const result = matches({}, filename)

      expect(result).toBe(matcherResult.EMPTY_FILE)
    })
  })

  describe('establishment number validation', () => {
    it("returns 'Wrong Establishment Number' matcher result for wrong establishment in multiple sheets", () => {
      const result = matches(model.wrongEstablishmentMultiple, filename)

      expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
    })
  })

  describe('header validation', () => {
    it("return 'Wrong Header' matcher result for incorrect header values", () => {
      const result = matches(model.incorrectHeader, filename)

      expect(result).toBe(matcherResult.WRONG_HEADER)
    })

    it("return 'Wrong Header' matcher result for incorrect header values of multiple sheets", () => {
      const result = matches(model.incorrectHeaderMultiple, filename)

      expect(result).toBe(matcherResult.WRONG_HEADER)
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
  })
})
