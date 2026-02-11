/**
 * Unit tests for Giovanni Model 1 parser
 * Tests the parser's ability to extract and structure data from Giovanni Model 1 packing lists.
 */
import { describe, test, expect } from 'vitest'
import { parse } from './model1.js'
import model from '../../../../test/test-data-and-results/models/giovanni/model1.js'
import expectedResults from '../../../../test/test-data-and-results/results/giovanni/model1.js'
import parserModel from '../../parser-model.js'

describe('Giovanni Model 1 Parser', () => {
  describe('Valid packing lists', () => {
    test('parses valid Giovanni Model 1 file correctly', () => {
      const result = parse(model.validModel)
      expect(result).toMatchObject(expectedResults.validTestResult)
    })

    test('parses valid Giovanni Model 1 with multiple sheets', () => {
      const result = parse(model.validModelMultipleSheets)
      expect(result).toMatchObject(
        expectedResults.validTestResultForMultipleSheets
      )
    })

    test('returns correct parser model', () => {
      const result = parse(model.validModel)
      expect(result.parserModel).toBe(parserModel.GIOVANNI1)
    })

    test('extracts establishment number correctly', () => {
      const result = parse(model.validModel)
      expect(result.registration_approval_number).toBe('RMS-GB-000153')
    })

    test('extracts all items from packing list', () => {
      const result = parse(model.validModel)
      const expectedItemCount = 2
      expect(result.items).toHaveLength(expectedItemCount)
    })

    test('parses headers with no data as empty items', () => {
      const result = parse(model.validHeadersNoData)
      expect(result).toMatchObject(expectedResults.emptyTestResult)
    })
  })

  describe('Invalid packing lists', () => {
    test('handles missing required fields gracefully', () => {
      const result = parse(model.invalidModel_MissingColumnCells)
      expect(result).toMatchObject(expectedResults.validParserResult)
    })

    test('detects multiple RMS numbers', () => {
      const result = parse(model.multipleRms)
      expect(result).toMatchObject(expectedResults.validParserResultMultipleRms)
    })

    test('detects missing kg unit', () => {
      const result = parse(model.missingKgunit)
      expect(result).toMatchObject(expectedResults.validParserResultMissingKg)
    })

    test('parses data even when fields are missing (validation happens in parser-service)', () => {
      const result = parse(model.invalidModel_MissingColumnCells)
      expect(result.business_checks.all_required_fields_present).toBe(true)
    })
  })

  describe('Item extraction', () => {
    test('extracts description correctly', () => {
      const result = parse(model.validModel)
      expect(result.items[0].description).toBe('SPINACH AND RICOTTA TORT')
      expect(result.items[1].description).toBe('FOUR CHEESE TORT')
    })

    test('extracts commodity code correctly', () => {
      const result = parse(model.validModel)
      expect(result.items[0].commodity_code).toBe('1902209990')
      expect(result.items[1].commodity_code).toBe('1902209990')
    })

    test('extracts number of packages correctly', () => {
      const result = parse(model.validModel)
      const expectedFirstItemPackages = 17
      const expectedSecondItemPackages = 10
      expect(result.items[0].number_of_packages).toBe(expectedFirstItemPackages)
      expect(result.items[1].number_of_packages).toBe(
        expectedSecondItemPackages
      )
    })

    test('extracts total net weight correctly', () => {
      const result = parse(model.validModel)
      const expectedFirstItemWeight = 40.8
      const expectedSecondItemWeight = 24
      expect(result.items[0].total_net_weight_kg).toBe(expectedFirstItemWeight)
      expect(result.items[1].total_net_weight_kg).toBe(expectedSecondItemWeight)
    })

    test('extracts country of origin correctly', () => {
      const result = parse(model.validModel)
      expect(result.items[0].country_of_origin).toBe('IT')
      expect(result.items[1].country_of_origin).toBe('IT')
    })

    test('extracts NIRMS status from blanket statement', () => {
      const result = parse(model.validModel)
      expect(result.items[0].nirms).toBe('NIRMS')
      expect(result.items[1].nirms).toBe('NIRMS')
    })

    test('sets net weight unit to KG when found', () => {
      const result = parse(model.validModel)
      expect(result.items[0].total_net_weight_unit).toBe('KG')
      expect(result.items[1].total_net_weight_unit).toBe('KG')
    })
  })

  describe('Row filtering', () => {
    test('filters out drag-down rows with all zeros', () => {
      const testData = {
        RANA: [
          { A: 'RMS-GB-000153' },
          {
            C: 'DESCRIPTION',
            E: 'Commodity Code',
            G: 'Quantity',
            H: 'Net Weight (KG)'
          },
          {
            C: 'Real Item',
            E: '1234567890',
            G: 5,
            H: 10
          },
          {
            C: 0,
            E: 0,
            G: 0,
            H: 0
          }
        ]
      }
      const result = parse(testData)
      expect(result.items).toHaveLength(1)
      expect(result.items[0].description).toBe('Real Item')
    })

    test('filters out rows with all null values', () => {
      const testData = {
        RANA: [
          { A: 'RMS-GB-000153' },
          {
            C: 'DESCRIPTION',
            E: 'Commodity Code',
            G: 'Quantity',
            H: 'Net Weight (KG)'
          },
          {
            C: 'Real Item',
            E: '1234567890',
            G: 5,
            H: 10
          },
          {
            C: null,
            E: null,
            G: null,
            H: null
          }
        ]
      }
      const result = parse(testData)
      expect(result.items).toHaveLength(1)
      expect(result.items[0].description).toBe('Real Item')
    })
  })

  describe('Error handling', () => {
    test('returns NOMATCH when error occurs', () => {
      const result = parse(null)
      expect(result.parserModel).toBe(parserModel.NOMATCH)
    })

    test('returns empty items array when error occurs', () => {
      const result = parse(null)
      expect(result.items).toEqual([])
    })

    test('returns null establishment number when error occurs', () => {
      const result = parse(null)
      expect(result.registration_approval_number).toBeNull()
    })

    test('sets all_required_fields_present to false when error occurs', () => {
      const result = parse(null)
      expect(result.business_checks.all_required_fields_present).toBe(false)
    })
  })

  describe('Multi-sheet processing', () => {
    test('processes all sheets in workbook', () => {
      const result = parse(model.validModelMultipleSheets)
      const expectedItemCount = 2
      expect(result.items).toHaveLength(expectedItemCount)
    })

    test('combines items from multiple sheets', () => {
      const result = parse(model.validModelMultipleSheets)
      expect(result.items[0].description).toBe('RANA CHICKEN&BACON TORT')
      expect(result.items[1].description).toBe('RANA HAM&CHEESE TORT')
    })

    test('finds establishment numbers across all sheets', () => {
      const result = parse(model.validModelMultipleSheets)
      expect(result.registration_approval_number).toBe('RMS-GB-000153')
    })
  })
})
