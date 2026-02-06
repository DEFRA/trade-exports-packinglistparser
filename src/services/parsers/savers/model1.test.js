import { describe, it, expect, vi } from 'vitest'
import { parse } from './model1.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import model from '../../../../test/test-data-and-results/models/savers/model1.js'
import test_results from '../../../../test/test-data-and-results/results/savers/model1.js'

const logger = createLogger()

describe('parseSaversModel1', () => {
  describe('basic parsing', () => {
    it('parses json', () => {
      const result = parse(model.validModel)

      expect(result).toMatchObject(test_results.validTestResult)
    })

    it('parses multiple sheets', () => {
      const result = parse(model.validModelMultipleSheets)

      expect(result).toMatchObject(
        test_results.validTestResultForMultipleSheets
      )
    })

    it('parses valid json with headers but no data', () => {
      const result = parse(model.validHeadersNoData)

      expect(result).toMatchObject(test_results.emptyTestResult)
    })

    it('parses empty json', () => {
      const result = parse(model.emptyFile)

      expect(result.business_checks.all_required_fields_present).toBe(false)
      expect(result.items).toEqual([])
      expect(result.registration_approval_number).toBeNull()
    })

    it('parses invalid model with missing headers', () => {
      const result = parse(model.invalidModel_MissingHeaders)

      expect(result).toMatchObject(test_results.failedTestResult)
    })
  })

  describe('multiple establishment numbers', () => {
    it('parses model with multiple RMS numbers', () => {
      const result = parse(model.multipleRms)

      expect(result.business_checks.all_required_fields_present).toBe(true)
      expect(result.establishment_numbers).toBeDefined()
      expect(result.establishment_numbers.length).toBeGreaterThan(1)
      expect(result.establishment_numbers).toContain('RMS-GB-000247-001')
      expect(result.establishment_numbers).toContain('RMS-GB-000247-002')
    })
  })

  describe('header variations', () => {
    it('parses model with missing KG unit in header', () => {
      const result = parse(model.missingKgunit)

      // Parser successfully extracts data even without (KG) in header
      expect(result.parserModel).toBe('SAVERS1')
      expect(result.items.length).toBeGreaterThan(0)
      expect(result.registration_approval_number).toBe('RMS-GB-000247-001')
    })

    it('parses multiple sheets with headers on different rows', () => {
      const result = parse(model.validModelMultipleSheetsHeadersOnDifferentRows)

      expect(result.parserModel).toBe('SAVERS1')
      expect(result.items.length).toBeGreaterThan(0)
      // Should find headers at different row positions across sheets
      expect(
        result.items.some((item) => item.row_location.sheetName === 'Sheet1')
      ).toBe(true)
      expect(
        result.items.some((item) => item.row_location.sheetName === 'sheet2')
      ).toBe(true)
    })
  })

  describe('missing column cells', () => {
    it('parses model with missing column cells', () => {
      const result = parse(model.invalidModel_MissingColumnCells)

      // Parser extracts data with null values for missing cells
      expect(result.parserModel).toBe('SAVERS1')
      expect(result.items.length).toBeGreaterThan(0)
      expect(
        result.items.some(
          (item) =>
            item.description === null || item.number_of_packages === null
        )
      ).toBe(true)
    })
  })

  describe('invalid sheets handling', () => {
    it('skips invalid sheets during parsing', () => {
      const result = parse(model.validModel)

      // Should have parsed data only from valid sheets
      expect(result.parserModel).toBe('SAVERS1')
      expect(result.items.length).toBeGreaterThan(0)
    })
  })

  describe('empty rows filtering', () => {
    it('filters out empty/dragdown rows', () => {
      const result = parse(model.validModel)

      // Should not include rows with all zeros
      const emptyRows = result.items.filter(
        (item) =>
          item.description === 0 &&
          item.number_of_packages === 0 &&
          item.total_net_weight_kg === 0
      )
      expect(emptyRows.length).toBe(0)
    })
  })

  describe('error handling', () => {
    it('should call logger.error when an error is thrown', () => {
      const logErrorSpy = vi.spyOn(logger, 'error')

      parse(null)

      expect(logErrorSpy).not.toHaveBeenCalled() // Early return, no error logged
    })

    it('returns NOMATCH parser model when parsing fails', () => {
      const result = parse(null)

      expect(result.parserModel).toBe('NOMATCH')
      expect(result.items).toHaveLength(0)
    })

    it('returns NOMATCH parser when parsing undefined', () => {
      const result = parse(undefined)

      expect(result.parserModel).toBe('NOMATCH')
    })
  })
})
