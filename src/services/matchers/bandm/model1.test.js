import { describe, it, expect, vi } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/bandm/model1.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'

const logger = createLogger()
const filename = 'packinglist.xlsx'

describe('matchesBandmModel1', () => {
  describe('valid matching', () => {
    it.each([
      ['valid model', model.validModel],
      [
        'valid model with case insensitive headers',
        model.validModelInsensitiveHeader
      ],
      ['valid model with multiple sheets', model.validModelMultipleSheets],
      [
        'multiple sheets with headers on different rows',
        model.validModelMultipleSheetsHeadersOnDifferentRows
      ],
      ['valid headers with no data', model.validHeadersNoData]
    ])('returns Correct for %s', (_, packingListJson) => {
      const result = matches(packingListJson, filename)

      expect(result).toBe(matcherResult.CORRECT)
    })
  })

  describe('empty/invalid input', () => {
    it.each([
      ['empty json', model.emptyModel],
      ['object with no sheets', {}]
    ])("returns 'Empty File' matcher result for %s", (_, packingListJson) => {
      const result = matches(packingListJson, filename)

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
    it.each([
      ['incorrect header values', model.incorrectHeader],
      [
        'incorrect header values of multiple sheets',
        model.incorrectHeaderMultiple
      ]
    ])("return 'Wrong Header' matcher result for %s", (_, packingListJson) => {
      const result = matches(packingListJson, filename)

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
