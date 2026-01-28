import { describe, test, expect } from 'vitest'
import { parse } from './model1.js'
import model from '../../../../test/test-data-and-results/models/nisa/model1.js'
import test_results from '../../../../test/test-data-and-results/results/nisa/model1.js'
import parserModel from '../../parser-model.js'

describe('parseNisa1', () => {
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

  test('parses with footer', () => {
    const result = parse(model.validModelWithFooter)

    expect(result).toMatchObject(test_results.validTestResult)
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
