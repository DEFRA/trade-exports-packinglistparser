import { describe, test, expect } from 'vitest'
import { parse } from './model1.js'
import parserModel from '../../parser-model.js'
import model from '../../../../test/test-data-and-results/models/coop/model1.js'
import testResults from '../../../../test/test-data-and-results/results/coop/model1.js'

describe('Co-op Model 1 Parser', () => {
  test('parses populated json', () => {
    const result = parse(model.validModel)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  test('parses multiple sheets', () => {
    const result = parse(model.validModelMultipleSheets)

    expect(result).toMatchObject(testResults.validTestResultForMultipleSheets)
  })

  test('parses multiple sheets with headers on different rows', () => {
    const result = parse(model.validModelMultipleSheetsHeadersOnDifferentRows)

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(2)
    expect(result.items[1].row_location.rowNumber).toBe(3)
  })

  test('parses empty json', () => {
    const result = parse(model.emptyModel)

    expect(result).toMatchObject(testResults.emptyTestResult)
  })

  test('returns NOMATCH when parse throws an error', () => {
    const result = parse(null)

    expect(result.parserModel).toBe(parserModel.NOMATCH)
  })
})
