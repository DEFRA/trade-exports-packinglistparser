import { describe, test, expect } from 'vitest'
import { parse } from './model1.js'
import model from '../../../../test/test-data-and-results/models/sainsburys/model1.js'
import test_results from '../../../../test/test-data-and-results/results/sainsburys/model1.js'

describe('parseSainsburysModel1', () => {
  test('parses populated json', () => {
    const result = parse(model.validModel)

    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('parses multiple sheets', () => {
    const result = parse(model.validModelMultipleSheets)

    expect(result).toMatchObject(test_results.validTestResultForMultipleSheets)
  })

  test('parses multiple sheets with headers on different rows', () => {
    const result = parse(model.validModelMultipleSheetsHeadersOnDifferentRows)

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(2)
    expect(result.items[1].row_location.rowNumber).toBe(3)
  })

  test('parses empty json', () => {
    const result = parse(model.emptyModel)

    expect(result).toMatchObject(test_results.emptyTestResult)
  })

  test('removes zero-width spaces from establishment numbers', () => {
    // Test data contains RMS numbers with zero-width space character (\u200B)
    const result = parse(model.validModel)

    // Verify establishment numbers are cleaned (zero-width spaces removed)
    expect(result.establishment_numbers).toBeDefined()
    expect(result.establishment_numbers.length).toBeGreaterThan(0)

    // Verify no zero-width spaces in any establishment number
    result.establishment_numbers.forEach((rms) => {
      expect(rms).not.toContain('\u200B')
      expect(rms).toMatch(/^RMS-GB-\d{6}-\d{3}$/)
    })
  })

  test('removes zero-width space from primary establishment number', () => {
    // Line 34 specifically tests the primary establishment number extraction
    // which uses ?.replaceAll to clean zero-width spaces
    const result = parse(model.validModel)

    // Verify primary establishment number is cleaned
    expect(result.registration_approval_number).toBeDefined()
    expect(result.registration_approval_number).not.toContain('\u200B')
    expect(result.registration_approval_number).toMatch(/^RMS-GB-\d{6}-\d{3}$/)
    expect(result.registration_approval_number).toBe('RMS-GB-000094-002')
  })

  test('handles exception during parsing', () => {
    // Pass invalid data structure that will cause an error during processing
    const invalidData = {
      Sheet1: [
        {
          get C() {
            throw new Error('Simulated parsing error')
          }
        }
      ]
    }

    const result = parse(invalidData)

    // Should return NOMATCH result when exception occurs
    expect(result.parserModel).toBe('NOMATCH')
    expect(result.items).toEqual([])
  })
})
