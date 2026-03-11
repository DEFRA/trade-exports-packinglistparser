/**
 * Unit tests for Giovanni Model 2 matcher
 * Tests matcher's ability to identify valid Giovanni Model 2 packing lists
 */
import { describe, it, expect } from 'vitest'
import { matches } from './model2.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/giovanni/model2.js'

const filename = 'packinglist.xlsx'

describe('Giovanni Model 2 Matcher', () => {
  describe('Valid files', () => {
    it('returns CORRECT for valid Giovanni Model 2', () => {
      const result = matches(model.validModel, filename)
      expect(result).toBe(matcherResult.CORRECT)
    })
  })

  describe('Invalid files', () => {
    it('returns EMPTY_FILE for empty json', () => {
      const result = matches({}, filename)
      expect(result).toBe(matcherResult.EMPTY_FILE)
    })

    it('returns WRONG_ESTABLISHMENT_NUMBER for missing establishment number', () => {
      const result = matches(model.incorrectEstablishmentNumber, filename)
      expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
    })

    it('returns WRONG_ESTABLISHMENT_NUMBER for missing establishment numbers in multiple sheets', () => {
      const result = matches(model.wrongEstablishmentMultiple, filename)
      expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
    })

    it('returns WRONG_HEADER for incorrect header values', () => {
      const result = matches(model.incorrectHeader, filename)
      expect(result).toBe(matcherResult.WRONG_HEADER)
    })

    it('returns WRONG_HEADER for incorrect header values in multiple sheets', () => {
      const result = matches(model.incorrectHeaderMultiple, filename)
      expect(result).toBe(matcherResult.WRONG_HEADER)
    })
  })

  describe('Error handling', () => {
    it('returns GENERIC_ERROR when an error occurs', () => {
      const result = matches(null, null)
      expect(result).toBe(matcherResult.GENERIC_ERROR)
    })
  })
})
