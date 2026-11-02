import { describe, test, expect } from 'vitest'
import { parse } from './model3.js'
import model from '../../../../test/test-data-and-results/models/nutricia/model3.js'
import testResults from '../../../../test/test-data-and-results/results/nutricia/model3.js'

describe('parseNutriciaModel3', () => {
  test('parses populated json', () => {
    const result = parse(model.validModel)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  test('parses multiple sheets', () => {
    const result = parse(model.validModelMultipleSheets)

    expect(result).toMatchObject(testResults.validTestResultForMultipleSheets)
  })

  test('parses empty json', () => {
    const result = parse(model.emptyModel)

    expect(result).toMatchObject(testResults.emptyTestResult)
  })

  test('parses multiple sheets with headers on different rows', () => {
    const result = parse(model.validModelMultipleSheetsHeadersOnDifferentRows)

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(6)
    expect(result.items[1].row_location.rowNumber).toBe(6)
  })

  test('returns NOMATCH when an error occurs during parsing', () => {
    const result = parse(null)

    expect(result.parserModel).toBe('NOMATCH')
    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.items).toEqual([])
  })
})
