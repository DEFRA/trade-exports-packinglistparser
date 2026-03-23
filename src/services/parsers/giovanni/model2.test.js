/**
 * Unit tests for Giovanni Model 2 parser
 * Tests the parser's ability to extract and structure data from Giovanni Model 2 packing lists.
 */
import { describe, it, expect } from 'vitest'
import { parse } from './model2.js'
import model from '../../../../test/test-data-and-results/models/giovanni/model2.js'
import testResults from '../../../../test/test-data-and-results/results/giovanni/model2.js'
import parserModel from '../../parser-model.js'

describe('Giovanni Model 2 Parser', () => {
  describe('Valid packing lists', () => {
    it('parses valid Giovanni Model 2 file correctly', () => {
      const result = parse(model.validModel)
      expect(result).toMatchObject(testResults.validTestResult)
    })

    it('parses valid Giovanni Model 2 with multiple sheets', () => {
      const result = parse(model.validModelMultipleSheets)
      expect(result).toMatchObject(testResults.validTestResultForMultipleSheets)
    })

    it('parses headers with no data resulting in empty items', () => {
      const result = parse(model.emptyModel)
      expect(result).toMatchObject(testResults.emptyTestResult)
    })

    it('returns correct parser model', () => {
      const result = parse(model.validModel)
      expect(result.parserModel).toBe(parserModel.GIOVANNI2)
    })

    it('extracts establishment number correctly', () => {
      const result = parse(model.validModel)
      expect(result.registration_approval_number).toBe('RMS-GB-000149-006')
    })

    it('extracts all items from packing list', () => {
      const result = parse(model.validModel)
      const expectedItemCount = 2
      expect(result.items).toHaveLength(expectedItemCount)
    })
  })

  describe('Invalid packing lists', () => {
    it('handles missing cells gracefully', () => {
      const result = parse(model.invalidModel_MissingColumnCells)
      // Parser doesn't validate - validation happens in parser-service
      expect(result.business_checks.all_required_fields_present).toBe(true)
      expect(result.items[0].number_of_packages).toBeNull()
      expect(result.items[1].total_net_weight_kg).toBeNull()
    })

    it('detects multiple RMS numbers', () => {
      const result = parse(model.multipleRms)
      // Parser extracts all RMS numbers but doesn't fail validation
      expect(result.establishment_numbers).toEqual([
        'RMS-GB-000149-006',
        'RMS-GB-000149-007'
      ])
      expect(result.business_checks.all_required_fields_present).toBe(true)
    })

    it('detects missing KG unit in header', () => {
      const result = parse(model.missingKgunit)
      // Parser extracts data but doesn't validate unit presence
      expect(result.items[0].total_net_weight_unit).toBeNull()
      expect(result.items[1].total_net_weight_unit).toBeNull()
      expect(result.business_checks.all_required_fields_present).toBe(true)
    })
  })

  describe('Error handling', () => {
    it('returns NOMATCH result when an error is thrown during processing', () => {
      const result = parse(null)

      expect(result).toMatchObject({
        business_checks: {
          all_required_fields_present: false,
          failure_reasons: null
        },
        items: [],
        registration_approval_number: null,
        parserModel: parserModel.NOMATCH
      })
    })
  })
})
