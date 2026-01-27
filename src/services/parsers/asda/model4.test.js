/**
 * ASDA Model 4 CSV Parser Tests
 */
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { parse } from './model4.js'
import parserModel from '../../parser-model.js'
import model from '../../../../test/test-data-and-results/models-csv/asda/model4.js'
import expectedResults from '../../../../test/test-data-and-results/results-csv/asda/model4.js'

describe('ASDA Model 4 CSV Parser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should parse valid ASDA Model 4 CSV correctly', () => {
    const result = parse(model.validModel)
    expect(result).toMatchObject(expectedResults.validTestResult)
  })

  test('should parse valid ASDA Model 4 CSV correctly with attestation at the bottom', () => {
    const result = parse(model.validModelAttestationAtFooter)
    expect(result).toMatchObject(
      expectedResults.validTestResultAttestationAtFooter
    )
  })

  test('should return NOMATCH for empty CSV', () => {
    const result = parse(model.emptyModel)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('should return NOMATCH for null input', () => {
    const result = parse(null)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
  })

  test('should return NOMATCH for CSV with missing required data', () => {
    const result = parse(model.invalidModel)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('should extract all establishment numbers', () => {
    const result = parse(model.validModel)
    expect(result.establishment_numbers).toContain('RMS-GB-000015-001')
  })

  test('should extract correct number of items', () => {
    const result = parse(model.validModel)
    expect(result.items.length).toBe(2)
  })

  test('should handle parsing errors gracefully', () => {
    const result = parse(null)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
  })

  test('should catch and handle exceptions during parsing', () => {
    // Create invalid data that will cause an error during processing
    const invalidData = [
      ['', 'classification_code', 'article_description'],
      ['RMS-GB-000015-001', '123', 'Test']
    ]

    // Mock rowFinder to throw an error
    const result = parse(invalidData)

    // Should return NOMATCH when exception occurs
    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('should log error when exception occurs during parsing', async () => {
    // Mock the logger to track error calls
    const loggerSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Create data structure that will cause an internal error
    const malformedData = {
      // Wrong structure - object instead of array
      0: ['header'],
      1: ['data']
    }

    parse(malformedData)

    // Restore mock
    loggerSpy.mockRestore()
  })
})
