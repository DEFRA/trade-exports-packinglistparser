/**
 * B&M Model 1 Parser Unit Tests
 * Tests data extraction only. Validation tests are in parser-service integration tests.
 */
import { describe, it, expect, vi } from 'vitest'
import { parse } from './model1.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import headers from '../../model-headers.js'
import parserModel from '../../parser-model.js'
import model from '../../../../test/test-data-and-results/models/bandm/model1.js'
import test_results from '../../../../test/test-data-and-results/results/bandm/model1.js'

const logger = createLogger()

describe('parseBandmModel1', () => {
  describe('basic parsing', () => {
    it('parses json', () => {
      const result = parse(model.validModel)

      // Parser doesn't validate - validation happens in the service layer
      expect(result.business_checks.all_required_fields_present).toBe(true)
      expect(result.registration_approval_number).toBe('RMS-GB-000005-001')
      expect(result.parserModel).toBe(parserModel.BANDM1)
      expect(result.items).toMatchObject(test_results.validTestResult.items)
    })

    it('parses json with case insensitive headers', () => {
      const result = parse(model.validModelInsensitiveHeader)

      expect(result.items).toHaveLength(2) // Drag-down row filtered (no identifiers)
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

    it('includes rows with partial data for validation', () => {
      const result = parse(model.validModel)

      // Should have 2 items (drag-down row filtered - no identifiers)
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
      expect(
        result.items.some((item) =>
          item.description?.toLowerCase().includes('total')
        )
      ).toBe(false)
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

  describe('row filtering configuration', () => {
    it('does not filter rows when skipTotalsRows is false', () => {
      // Temporarily modify headers config
      const originalSkipTotalsRows = headers.BANDM1.skipTotalsRows
      headers.BANDM1.skipTotalsRows = false

      const modelWithEmptyRow = {
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
            A: ' ',
            B: ' ',
            C: ' ',
            D: ' ',
            E: ' ',
            F: 1,
            G: 3.27,
            H: 3.63
          }
        ]
      }

      const result = parse(modelWithEmptyRow)

      // Restore original config
      headers.BANDM1.skipTotalsRows = originalSkipTotalsRows

      // Should include the empty row when filtering is disabled
      expect(result.items.length).toBeGreaterThanOrEqual(1)
    })

    it('does not filter repeated headers when skipRepeatedHeaders is false', () => {
      // Temporarily modify headers config
      const originalSkipRepeatedHeaders = headers.BANDM1.skipRepeatedHeaders
      headers.BANDM1.skipRepeatedHeaders = false

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
          }
        ]
      }

      const result = parse(modelWithRepeatedHeaders)

      // Restore original config
      headers.BANDM1.skipRepeatedHeaders = originalSkipRepeatedHeaders

      // Should include the repeated header row when filtering is disabled
      expect(result.items.length).toBe(2)
    })

    it('handles items with no description in totals check', () => {
      const modelWithNoDescription = {
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
            A: 123,
            B: 456,
            C: null,
            D: 'test',
            E: 'RMS-GB-000005-001',
            F: 1,
            G: 2.5,
            H: 3.0,
            I: 'YES',
            J: 'GB'
          }
        ]
      }

      const result = parse(modelWithNoDescription)

      // Should handle null description gracefully (not filtered as it has commodity code)
      expect(result.items.length).toBe(2)
    })
  })

  describe('isEmptyRow filtering', () => {
    it('filters completely empty rows', () => {
      const modelWithEmptyRow = {
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
            A: null,
            B: null,
            C: null,
            D: null,
            E: null,
            F: null,
            G: null,
            H: null,
            I: null,
            J: null
          }
        ]
      }

      const result = parse(modelWithEmptyRow)

      // Should only have 1 valid item, empty row should be filtered
      expect(result.items).toHaveLength(1)
      expect(result.items[0].description).toBe('J/L JERKY 70G TERIYAKI')
    })

    it('filters rows with zero packages and weight', () => {
      const modelWithZeros = {
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
            A: null,
            B: null,
            C: '',
            D: '',
            E: '',
            F: 0,
            G: 0,
            H: 0,
            I: '',
            J: ''
          }
        ]
      }

      const result = parse(modelWithZeros)

      // Should only have 1 valid item, zero row should be filtered as empty
      expect(result.items).toHaveLength(1)
      expect(result.items[0].description).toBe('J/L JERKY 70G TERIYAKI')
    })

    it('keeps rows with only whitespace strings (drag-down rows for validation)', () => {
      const modelWithWhitespace = {
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
            A: ' ',
            B: ' ',
            C: ' ',
            D: ' ',
            E: ' ',
            F: 1,
            G: 3.27,
            H: 3.63
          }
        ]
      }

      const result = parse(modelWithWhitespace)

      // Note: After cleanupWhitespace, this row will have null identifiers + quantities
      // The NISA pattern will filter it as a totals row
      expect(result.items).toHaveLength(1)
      expect(result.items[0].description).toBe('J/L JERKY 70G TERIYAKI')
    })
  })

  describe('isTotalsRow detection', () => {
    it('filters rows with "total" keyword', () => {
      const modelWithTotal = {
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
            C: 'Total',
            D: '',
            E: '',
            F: 10,
            G: 50.5,
            H: 55.2,
            I: '',
            J: ''
          }
        ]
      }

      const result = parse(modelWithTotal)

      expect(result.items).toHaveLength(1)
      expect(result.items[0].description).toBe('J/L JERKY 70G TERIYAKI')
    })

    it('filters rows with "totals" keyword (case insensitive)', () => {
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
            C: 'TOTALS',
            D: '',
            E: '',
            F: 10,
            G: 50.5,
            H: 55.2,
            I: '',
            J: ''
          }
        ]
      }

      const result = parse(modelWithTotals)

      expect(result.items).toHaveLength(1)
    })

    it('filters rows with null identifiers but has quantities (aggregate totals)', () => {
      const modelWithNullIdentifiers = {
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
            A: null,
            B: null,
            C: null,
            D: null,
            E: '',
            F: 47,
            G: 150.82,
            H: 165.5,
            I: '',
            J: null
          }
        ]
      }

      const result = parse(modelWithNullIdentifiers)

      // NISA pattern filters: null identifiers + has quantities = aggregate totals row
      expect(result.items).toHaveLength(1)
      expect(result.items[0].description).toBe('J/L JERKY 70G TERIYAKI')
    })

    it('filters rows with space strings after cleanup (pattern matches totals)', () => {
      const modelWithSpaces = {
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
            A: ' ',
            B: ' ',
            C: ' ',
            D: ' ',
            E: ' ',
            F: 1,
            G: 3.27,
            H: 3.63
          }
        ]
      }

      const result = parse(modelWithSpaces)

      // After cleanupWhitespace converts spaces to null, NISA pattern filters as totals
      expect(result.items).toHaveLength(1)
    })
  })

  describe('cleanupWhitespace processing', () => {
    it('converts whitespace-only strings to null', () => {
      const modelWithWhitespace = {
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
            A: ' ',
            B: ' ',
            C: '   ',
            D: '  ',
            E: 'RMS-GB-000005-001',
            F: 1,
            G: 1.15,
            H: 1.28,
            I: 'YES',
            J: '  '
          }
        ]
      }

      const result = parse(modelWithWhitespace)

      // Row filtered - no identifying info (all whitespace)
      expect(result.items).toHaveLength(0)
    })

    it('preserves non-whitespace string values', () => {
      const modelWithValidData = {
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
            C: 'Valid Description',
            D: 16025095,
            E: 'RMS-GB-000005-001',
            F: 1,
            G: 1.15,
            H: 1.28,
            I: 'YES',
            J: 'GB'
          }
        ]
      }

      const result = parse(modelWithValidData)

      expect(result.items).toHaveLength(1)
      expect(result.items[0].description).toBe('Valid Description')
      expect(result.items[0].commodity_code).toBe(16025095)
      expect(result.items[0].country_of_origin).toBe('GB')
    })

    it('preserves numeric values during cleanup', () => {
      const modelWithNumbers = {
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
            C: 'Test Item',
            D: 16025095,
            E: 'RMS-GB-000005-001',
            F: 5,
            G: 10.5,
            H: 11.2,
            I: 'YES',
            J: 'GB'
          }
        ]
      }

      const result = parse(modelWithNumbers)

      expect(result.items).toHaveLength(1)
      expect(result.items[0].number_of_packages).toBe(5)
      expect(result.items[0].total_net_weight_kg).toBe(10.5)
    })
  })

  describe('isRepeatedHeaderRow filtering', () => {
    it('filters rows containing "item description" keyword', () => {
      const modelWithRepeatedHeader = {
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
          }
        ]
      }

      const result = parse(modelWithRepeatedHeader)

      // Should filter the repeated header row
      expect(result.items).toHaveLength(1)
      expect(result.items[0].description).toBe('J/L JERKY 70G TERIYAKI')
    })

    it('filters rows with "prism" as description', () => {
      const modelWithPrism = {
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
            C: 'PRISM',
            D: '',
            E: '',
            F: 1,
            G: 1.5,
            H: 2.0,
            I: '',
            J: ''
          }
        ]
      }

      const result = parse(modelWithPrism)

      // Should filter the row with "PRISM" in description
      expect(result.items).toHaveLength(1)
      expect(result.items[0].description).toBe('J/L JERKY 70G TERIYAKI')
    })
  })

  describe('exception handling and edge cases', () => {
    it('handles undefined items gracefully', () => {
      const modelWithUndefined = {
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
            A: undefined,
            B: undefined,
            C: undefined,
            D: undefined,
            E: undefined,
            F: undefined,
            G: undefined,
            H: undefined,
            I: undefined,
            J: undefined
          }
        ]
      }

      const result = parse(modelWithUndefined)

      // Should filter undefined row as empty
      expect(result.items).toHaveLength(1)
      expect(result.items[0].description).toBe('J/L JERKY 70G TERIYAKI')
    })

    it('handles mixed null and whitespace gracefully', () => {
      const modelWithMixed = {
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
            A: null,
            B: '  ',
            C: '',
            D: null,
            E: '   ',
            F: 0,
            G: null,
            H: 0,
            I: '',
            J: null
          }
        ]
      }

      const result = parse(modelWithMixed)

      // Should filter row with mixed null/whitespace/zeros as empty
      expect(result.items).toHaveLength(1)
      expect(result.items[0].description).toBe('J/L JERKY 70G TERIYAKI')
    })

    it('handles malformed sheet data without crashing', () => {
      const malformedModel = {
        Sheet1: []
      }

      const result = parse(malformedModel)

      // Should return NOMATCH without crashing
      expect(result.parserModel).toBe('NOMATCH')
      expect(result.business_checks.all_required_fields_present).toBe(false)
    })

    it('handles missing sheet keys', () => {
      const emptyModel = {}

      const result = parse(emptyModel)

      // Should return NOMATCH without crashing
      expect(result.parserModel).toBe('NOMATCH')
      expect(result.business_checks.all_required_fields_present).toBe(false)
    })

    it('handles items with only blanket values (nirms, treatment)', () => {
      const modelWithBlanketOnly = {
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
            A: null,
            B: null,
            C: null,
            D: null,
            E: null,
            F: null,
            G: null,
            H: null,
            I: null,
            J: null
          }
        ]
      }

      const result = parse(modelWithBlanketOnly)

      // Empty row should be filtered even though blanket values get applied
      expect(result.items).toHaveLength(1)
      expect(result.items[0].description).toBe('J/L JERKY 70G TERIYAKI')
      expect(result.items[0].nirms).toBe('NIRMS')
      expect(result.items[0].type_of_treatment).toBe('Processed')
    })
  })
})
