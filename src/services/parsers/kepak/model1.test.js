import { describe, it, expect, vi } from 'vitest'
import { parse } from './model1.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import model from '../../../../test/test-data-and-results/models/kepak/model1.js'
import test_results from '../../../../test/test-data-and-results/results/kepak/model1.js'

const logger = createLogger()

describe('parseKepakModel1', () => {
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

    it('parses valid json with dragdown', () => {
      const result = parse(model.validModelWithDragdown)

      expect(result).toMatchObject(test_results.validTestResult)
    })

    it('parses empty json', () => {
      const result = parse(model.emptyModel)

      expect(result).toMatchObject(test_results.emptyModelResult)
    })

    it('parses model with NIRMS blanket statement', () => {
      const result = parse(model.validModelWithNirms)

      expect(result.business_checks.all_required_fields_present).toBe(true)
      expect(result.blanketNirms).toBeDefined()
      expect(result.items.length).toBeGreaterThan(0)
      expect(result.items[0].nirms).toBe('NIRMS')
    })

    it('parses model with valid headers but no data rows', () => {
      const result = parse(model.validHeadersNoData)

      expect(result.business_checks.all_required_fields_present).toBe(true)
      expect(result.items).toHaveLength(0)
    })
  })

  describe('multiple establishment numbers', () => {
    it('parses model with multiple RMS numbers', () => {
      const result = parse(model.multipleRms)

      expect(result.business_checks.all_required_fields_present).toBe(true)
      expect(result.establishment_numbers).toBeDefined()
      expect(result.establishment_numbers.length).toBeGreaterThan(1)
      expect(result.establishment_numbers).toContain('RMS-GB-000149-005')
      expect(result.establishment_numbers).toContain('RMS-GB-000149-006')
    })
  })

  describe('header variations', () => {
    it('parses model with missing KG unit in header', () => {
      const result = parse(model.missingKgunit)

      // Parser successfully extracts data even without (KG) in header
      expect(result.parserModel).toBe('KEPAK1')
      expect(result.items.length).toBeGreaterThan(0)
      expect(result.registration_approval_number).toBe('RMS-GB-000280')
    })

    it('parses multiple sheets with headers on different rows', () => {
      const result = parse(model.validModelMultipleSheetsHeadersOnDifferentRows)

      expect(result.parserModel).toBe('KEPAK1')
      expect(result.items.length).toBeGreaterThan(0)
      // Should find headers at different row positions across sheets
      expect(
        result.items.some((item) => item.row_location.sheetName === 'Sheet1')
      ).toBe(true)
      expect(
        result.items.some((item) => item.row_location.sheetName === 'Sheet2')
      ).toBe(true)
    })
  })

  describe('treatment type handling', () => {
    it('parses model with missing NIRMS statement but has treatment type', () => {
      const result = parse(model.missingNirmsStatement)

      // Parser extracts data; treatment type is handled separately
      expect(result.parserModel).toBe('KEPAK1')
      expect(result.items.length).toBeGreaterThan(0)
    })

    it('parses model with null treatment type and null identifier', () => {
      const result = parse(model.nullTreatmentTypeWithNullIdentifier)

      // Parser can handle null values without crashing
      expect(result.parserModel).toBe('KEPAK1')
      expect(result.items.length).toBeGreaterThan(0)
    })
  })

  describe('Country of Origin variations', () => {
    it('parses model with null Country of Origin', () => {
      const result = parse(model.nullCoO)

      // Parser extracts null CoO; validation happens downstream
      expect(result.parserModel).toBe('KEPAK1')
      expect(result.items.length).toBeGreaterThan(0)
      expect(result.items[0].country_of_origin).toBeNull()
    })

    it('parses model with invalid Country of Origin', () => {
      const result = parse(model.invalidCoO)

      // Parser extracts the value as-is; validation happens downstream
      expect(result.parserModel).toBe('KEPAK1')
      expect(result.items.length).toBeGreaterThan(0)
      expect(result.items[0].country_of_origin).toBe('INVALID')
    })

    it('parses model with multiple null Country of Origin values', () => {
      const result = parse(model.multipleNullCoO)

      // Parser extracts all rows including those with null CoO
      expect(result.parserModel).toBe('KEPAK1')
      expect(
        result.items.filter((item) => item.country_of_origin === null).length
      ).toBeGreaterThan(0)
    })

    it('parses model with multiple invalid Country of Origin values', () => {
      const result = parse(model.multipleInvalidCoO)

      // Parser extracts all rows including those with invalid CoO
      expect(result.parserModel).toBe('KEPAK1')
      expect(
        result.items.filter((item) => item.country_of_origin === 'INVALID')
          .length
      ).toBeGreaterThan(0)
    })

    it('parses model with x as Country of Origin', () => {
      const result = parse(model.xCoO)

      // Parser normalizes 'x' to lowercase
      expect(result.parserModel).toBe('KEPAK1')
      expect(result.items[0].country_of_origin).toBe('x')
    })
  })

  describe('ineligible items handling', () => {
    it('parses model with ineligible item and treatment type', () => {
      const result = parse(model.ineligibleItemWithTreatment)

      // Parser extracts data; ineligibility check happens downstream
      expect(result.parserModel).toBe('KEPAK1')
      expect(result.items.length).toBeGreaterThan(0)
      expect(result.items[0].country_of_origin).toBe('INELIGIBLE_ITEM_ISO')
    })

    it('parses model with multiple ineligible items and treatment type', () => {
      const result = parse(model.multipleineligibleItemsWithTreatment)

      // Parser extracts all items regardless of eligibility
      expect(result.parserModel).toBe('KEPAK1')
      expect(result.items.length).toBeGreaterThan(0)
    })

    it('parses model with ineligible item without treatment type', () => {
      const result = parse(model.ineligibleItemNoTreatment)

      // Parser extracts data without validating eligibility
      expect(result.parserModel).toBe('KEPAK1')
      expect(result.items.length).toBeGreaterThan(0)
    })

    it('parses model with multiple ineligible items without treatment type', () => {
      const result = parse(model.multipleineligibleItemsNoTreatment)

      // Parser extracts all items
      expect(result.parserModel).toBe('KEPAK1')
      expect(result.items.length).toBeGreaterThan(0)
    })
  })

  describe('missing column cells', () => {
    it('parses model with missing column cells', () => {
      const result = parse(model.invalidModel_MissingColumnCells)

      // Parser extracts data with null values for missing cells
      expect(result.parserModel).toBe('KEPAK1')
      expect(result.items.length).toBeGreaterThan(0)
      expect(
        result.items.some(
          (item) =>
            item.description === null || item.number_of_packages === null
        )
      ).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should call logger.error when an error is thrown', () => {
      const logErrorSpy = vi.spyOn(logger, 'error')

      parse(null)

      expect(logErrorSpy).toHaveBeenCalled()
    })

    it('returns NOMATCH parser when parsing fails', () => {
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
