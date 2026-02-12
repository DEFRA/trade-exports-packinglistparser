/**
 * B&M Model 1 Parser Unit Tests
 * Tests data extraction only. Validation tests are in parser-service integration tests.
 */
import { describe, it, expect, vi } from 'vitest'
import { parse } from './model1.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import model from '../../../../test/test-data-and-results/models/bandm/model1.js'
import test_results from '../../../../test/test-data-and-results/results/bandm/model1.js'

const logger = createLogger()

describe('parseBandmModel1', () => {
  describe('basic parsing', () => {
    it('parses json', () => {
      const result = parse(model.validModel)

      expect(result).toMatchObject(test_results.validTestResult)
    })

    it('parses json with case insensitive headers', () => {
      const result = parse(model.validModelInsensitiveHeader)

      expect(result.items).toHaveLength(2)
      expect(result.business_checks.all_required_fields_present).toBe(true)
    })

    it('parses multiple sheets', () => {
      const result = parse(model.validModelMultipleSheets)

      expect(result).toMatchObject(
        test_results.validTestResultForMultipleSheets
      )
    })

    it('parses valid json with headers but no data', () => {
      const result = parse(model.validHeadersNoData)

      expect(result.business_checks.all_required_fields_present).toBe(true)
      expect(result.items).toEqual([])
      expect(result.registration_approval_number).toBe('RMS-GB-000005-001')
    })

    it('parses empty json', () => {
      const result = parse(model.emptyModel)

      // emptyModel has valid header and establishment but no data rows
      // Parser extracts structure successfully even with no rows
      expect(result.business_checks.all_required_fields_present).toBe(true)
      expect(result.items).toEqual([])
      expect(result.registration_approval_number).toBeNull()
    })
  })

  describe('multiple establishment numbers', () => {
    it('parses model with multiple RMS numbers and lists them', () => {
      const result = parse(model.multipleRms)

      expect(result.business_checks.all_required_fields_present).toBe(true)
      expect(result.establishment_numbers).toBeDefined()
      expect(result.establishment_numbers.length).toBeGreaterThan(1)
      expect(result.establishment_numbers).toContain('RMS-GB-000005-001')
      expect(result.establishment_numbers).toContain('RMS-GB-000005-002')
    })
  })

  describe('header variations', () => {
    it('parses model with missing KG unit in header', () => {
      const result = parse(model.missingKgunit)

      // Parser extracts data even without KG unit (validation happens in parser-service)
      expect(result.business_checks.all_required_fields_present).toBe(true)
      expect(result.items.length).toBeGreaterThan(0)
      expect(result.items[0].total_net_weight_unit).toBeNull()
    })
  })

  describe('special BANDM features', () => {
    it('sets validateCountryOfOrigin flag', () => {
      const result = parse(model.validModel)

      expect(result.validateCountryOfOrigin).toBe(true)
    })

    it('extracts blanketNirms when statement found', () => {
      const result = parse(model.validModel)

      expect(result.blanketNirms).toMatchObject({
        regex: expect.any(RegExp),
        value: 'NIRMS'
      })
    })

    it('populates nirms field on items from blanket statement', () => {
      const result = parse(model.validModel)

      expect(result.items[0].nirms).toBe('NIRMS')
      expect(result.items[1].nirms).toBe('NIRMS')
    })

    it('populates treatment type from blanket statement', () => {
      const result = parse(model.validModel)

      expect(result.items[0].type_of_treatment).toBe('Processed')
      expect(result.items[1].type_of_treatment).toBe('Processed')
    })

    it('extracts country_of_origin field', () => {
      const result = parse(model.validModel)

      expect(result.items[0].country_of_origin).toBe('GB')
      expect(result.items[1].country_of_origin).toBe('GB')
    })

    it('filters out empty/totals rows', () => {
      const result = parse(model.validModel)

      // Should only have 2 items, not 3 (third row with spaces should be filtered)
      expect(result.items).toHaveLength(2)
    })

    it('filters out repeated header rows in data', () => {
      const modelWithRepeatedHeaders = {
        Sheet1: [
          {},
          {},
          {
            H: 'WAREHOUSE SCHEME NUMBER:',
            I: 'RMS-GB-000005-001'
          },
          {
            J: 'This consignment contains only NIRMS eligible goods',
            K: 'Treatment type: all products are processed'
          },
          {},
          {
            A: 'PRODUCT CODE (SHORT)',
            B: 'PRISM',
            C: 'ITEM DESCRIPTION',
            D: 'COMMODITY CODE',
            E: 'PLACE OF DISPATCH',
            F: 'TOTAL NUMBER OF CASES',
            G: 'NET WEIGHT KG',
            H: 'GROSS WEIGHT',
            I: 'ANIMAL ORIGIN',
            J: 'COUNTRY OF ORIGIN'
          },
          {
            A: 412267,
            B: 10145600,
            C: 'J/L JERKY 70G TERIYAKI',
            D: 16025095,
            E: 'RMS-GB-000005-001',
            F: 1,
            G: 1.15,
            H: 1.28,
            I: 'YES',
            J: 'GB'
          },
          {
            A: 'PRODUCT CODE (SHORT)',
            B: 'PRISM',
            C: 'ITEM DESCRIPTION',
            D: 'COMMODITY CODE',
            E: 'PLACE OF DISPATCH',
            F: 'TOTAL NUMBER OF CASES',
            G: 'NET WEIGHT KG',
            H: 'GROSS WEIGHT',
            I: 'ANIMAL ORIGIN',
            J: 'COUNTRY OF ORIGIN'
          },
          {
            A: 351357,
            B: 10300700,
            C: 'MINI ROLLS 10PK',
            D: 19053199,
            E: 'RMS-GB-000005-001',
            F: 1,
            G: 3.27,
            H: 3.63,
            I: 'YES',
            J: 'GB'
          }
        ]
      }

      const result = parse(modelWithRepeatedHeaders)

      // Should only have 2 data items, repeated header row should be filtered
      expect(result.items).toHaveLength(2)
      expect(result.items[0].description).toBe('J/L JERKY 70G TERIYAKI')
      expect(result.items[1].description).toBe('MINI ROLLS 10PK')
    })

    it('filters out rows with totals keywords', () => {
      const modelWithTotals = {
        Sheet1: [
          {},
          {},
          {
            H: 'WAREHOUSE SCHEME NUMBER:',
            I: 'RMS-GB-000005-001'
          },
          {
            J: 'This consignment contains only NIRMS eligible goods',
            K: 'Treatment type: all products are processed'
          },
          {},
          {
            A: 'PRODUCT CODE (SHORT)',
            B: 'PRISM',
            C: 'ITEM DESCRIPTION',
            D: 'COMMODITY CODE',
            E: 'PLACE OF DISPATCH',
            F: 'TOTAL NUMBER OF CASES',
            G: 'NET WEIGHT KG',
            H: 'GROSS WEIGHT',
            I: 'ANIMAL ORIGIN',
            J: 'COUNTRY OF ORIGIN'
          },
          {
            A: 412267,
            B: 10145600,
            C: 'J/L JERKY 70G TERIYAKI',
            D: 16025095,
            E: 'RMS-GB-000005-001',
            F: 1,
            G: 1.15,
            H: 1.28,
            I: 'YES',
            J: 'GB'
          },
          {
            A: '',
            B: '',
            C: 'Grand Total',
            D: '',
            E: '',
            F: 10,
            G: 50.5,
            H: 55.2,
            I: '',
            J: ''
          },
          {
            A: 351357,
            B: 10300700,
            C: 'MINI ROLLS 10PK',
            D: 19053199,
            E: 'RMS-GB-000005-001',
            F: 1,
            G: 3.27,
            H: 3.63,
            I: 'YES',
            J: 'GB'
          },
          {
            A: '',
            B: '',
            C: 'Total',
            D: '',
            E: '',
            F: 11,
            G: 53.77,
            H: 58.83,
            I: '',
            J: ''
          }
        ]
      }

      const result = parse(modelWithTotals)

      // Should only have 2 data items, totals rows should be filtered
      expect(result.items).toHaveLength(2)
      expect(result.items[0].description).toBe('J/L JERKY 70G TERIYAKI')
      expect(result.items[1].description).toBe('MINI ROLLS 10PK')
      // Verify totals rows are not in the results
      expect(result.items.some(item => item.description?.toLowerCase().includes('total'))).toBe(false)
    })
  })

  describe('error handling', () => {
    it('returns NOMATCH when parsing fails', () => {
      const result = parse(null)

      expect(result.parserModel).toBe('NOMATCH')
      expect(result.business_checks.all_required_fields_present).toBe(false)
      expect(result.items).toEqual([])
    })

    it('calls logger.error when an error occurs', () => {
      const errorSpy = vi.spyOn(logger, 'error')

      parse(null)

      expect(errorSpy).toHaveBeenCalled()
    })
  })
})
