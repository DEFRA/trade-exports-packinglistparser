import { describe, test, expect } from 'vitest'
import { parse } from './model2.js'
import model from '../../../../test/test-data-and-results/models/nisa/model2.js'
import expectedResults from '../../../../test/test-data-and-results/results/nisa/model2.js'
import parserModel from '../../parser-model.js'

const EXPECTED_ROW_THREE = 3
const EXPECTED_ROW_FOUR = 4
const EXPECTED_TWO_ITEMS = 2

describe('NISA Model 2 Parser', () => {
  test('parses valid NISA Model 2 file correctly', () => {
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
    expect(result.items[0].row_location.rowNumber).toBe(EXPECTED_ROW_THREE)
    expect(result.items[1].row_location.rowNumber).toBe(EXPECTED_ROW_FOUR)
  })

  test('handles empty model correctly', () => {
    const result = parse(model.emptyModel)
    expect(result).toMatchObject(expectedResults.emptyTestResult)
  })

  test('filters out total rows correctly', () => {
    const result = parse(model.validModelWithTotals)
    expect(result.items).toHaveLength(EXPECTED_TWO_ITEMS)
    expect(result.business_checks.all_required_fields_present).toBe(true)
  })

  test('parses valid headers but no data', () => {
    const result = parse(model.validHeadersNoData)

    expect(result.business_checks.all_required_fields_present).toBe(true)
  })

  test('returns NOMATCH for empty packingListJson', () => {
    const result = parse({})

    expect(result.parserModel).toBe(parserModel.NOMATCH)
  })
})
