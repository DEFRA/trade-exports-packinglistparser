import { describe, test, expect } from 'vitest'
import { parse } from './model2.js'
import model from '../../../../test/test-data-and-results/models-csv/iceland/model2.js'
import expectedResults from '../../../../test/test-data-and-results/results-csv/iceland/model2.js'
import parserModel from '../../parser-model.js'

describe('Iceland Model 2 CSV Parser', () => {
  test('parses valid Iceland Model 2 CSV file correctly', () => {
    const result = parse(model.validModel)
    expect(result).toMatchObject(expectedResults.validTestResult)
    expect(result.items).toHaveLength(2)
    expect(result.establishment_numbers).toContain('RMS-GB-000040-001')
  })

  test('returns NOMATCH for empty CSV', () => {
    const result = parse(model.emptyModel)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('returns NOMATCH for null input', () => {
    const result = parse(null)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
  })

  test('returns NOMATCH for invalid model with no data rows', () => {
    const result = parse(model.invalidModel)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })
})
