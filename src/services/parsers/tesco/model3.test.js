import { describe, test, expect } from 'vitest'
import { parse } from './model3.js'
import model from '../../../../test/test-data-and-results/models/tesco/model3.js'
import test_results from '../../../../test/test-data-and-results/results/tesco/model3.js'

describe('parseTescoModel3', () => {
  test('parses populated json', () => {
    const result = parse(model.validModel)

    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('parses multiple sheets', () => {
    const result = parse(model.validModelMultipleSheets)

    expect(result).toMatchObject(test_results.validTestResultForMultipleSheets)
  })

  test('parses missing required values', () => {
    const result = parse(model.invalidModel_MissingColumnCells)

    expect(result).toMatchObject(
      test_results.invalidTestResult_MissingCellsInParse
    )
  })

  test('parses empty json', () => {
    const result = parse(model.emptyModel)

    expect(result).toMatchObject(test_results.emptyTestResult)
  })

  test('parses multiple sheets with headers on different rows', () => {
    const result = parse(model.validModelMultipleSheetsHeadersOnDifferentRows)

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(3)
    expect(result.items[1].row_location.rowNumber).toBe(6)
  })

  test('returns NOMATCH fallback when parser throws', () => {
    const result = parse(null)

    expect(result).toMatchObject({
      registration_approval_number: null,
      items: [],
      business_checks: {
        all_required_fields_present: false,
        failure_reasons: null
      },
      parserModel: 'NOMATCH',
      establishment_numbers: []
    })
  })
})
