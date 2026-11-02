/**
 * Savers Model 2 CSV Parser Tests
 */
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { parse } from './model2.js'
import parserModel from '../../parser-model.js'
import model from '../../../../test/test-data-and-results/models-csv/savers/model2.js'
import expectedResults from '../../../../test/test-data-and-results/results-csv/savers/model2.js'

describe('Savers Model 2 CSV Parser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should parse valid Savers Model 2 CSV correctly', () => {
    const result = parse(model.validModel)
    expect(result).toMatchObject(expectedResults.validTestResult)
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

  test('should return NOMATCH when establishment number is missing', () => {
    const result = parse(model.invalidModel)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('should extract all establishment numbers', () => {
    const result = parse(model.validModel)
    expect(result.establishment_numbers).toContain('RMS-GB-000247-002')
  })

  test('should extract correct number of items', () => {
    const result = parse(model.validModel)
    expect(result.items.length).toBe(2)
  })

  test('should drop filler rows with no meaningful data', () => {
    const result = parse(model.modelWithFillerRows)
    expect(result.items.length).toBe(2)
    expect(result.items.map((item) => item.description)).toEqual([
      'HARMONY HAIRSPRAY FIRM 225ML',
      "HERMESETAS ORIG. 300'S"
    ])
  })

  test('should preserve original row numbers after dropping filler rows', () => {
    const result = parse(model.modelWithFillerRows)
    // dataRow1 is at row 7; a filler row precedes dataRow2 at row 9.
    expect(result.items.map((item) => item.row_location.rowNumber)).toEqual([
      7, 9
    ])
  })

  test('should handle malformed data without throwing', () => {
    const malformedData = {
      0: ['header'],
      1: ['data']
    }

    const result = parse(malformedData)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
  })
})
