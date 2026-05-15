import { describe, test, expect } from 'vitest'
import { parse } from './model3.js'
import model from '../../../../test/test-data-and-results/models/cds/model3.js'
import expectedResults from '../../../../test/test-data-and-results/results/cds/model3.js'
import parserModel from '../../parser-model.js'

describe('CDS Model 3 Parser', () => {
  test('parses valid CDS Model 3 file correctly', () => {
    const result = parse(model.validModel)
    expect(result).toMatchObject(expectedResults.validTestResult)
  })

  test('parses valid model with multiple sheets correctly', () => {
    const result = parse(model.validModelMultipleSheets)
    expect(result).toMatchObject(
      expectedResults.validTestResultForMultipleSheets
    )
  })

  test('parses multiple sheets with headers on different rows', () => {
    const result = parse(model.validModelMultipleSheetsHeadersOnDifferentRows)

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(2)
    expect(result.items[1].row_location.rowNumber).toBe(3)
  })

  test('parses empty model but without RMS establishment number', () => {
    const result = parse(model.emptyModel)

    expect(result.parserModel).toBe(parserModel.CDS3)
    expect(result.registration_approval_number).toBeNull()
  })

  test('parses valid headers but no data rows', () => {
    const result = parse(model.validHeadersNoData)

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items).toHaveLength(0)
  })

  test('returns NOMATCH when exception occurs during parsing', () => {
    const result = parse(null)

    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('returns NOMATCH for empty packingListJson', () => {
    const result = parse({})

    expect(result.parserModel).toBe(parserModel.NOMATCH)
  })
})
