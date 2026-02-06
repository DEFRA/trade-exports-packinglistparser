/**
 * Mars parser unit tests
 */
import { describe, it, expect } from 'vitest'
import { parse } from './model1.js'
import testData from '../../../../test/test-data-and-results/models/mars/model1.js'
import testResults from '../../../../test/test-data-and-results/results/mars/model1.js'

describe('parseMarsModel1', () => {
  it('parses json', () => {
    const result = parse(testData.validModel)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  it('parses multiple sheets', () => {
    const result = parse(testData.validModelMultipleSheets)

    expect(result).toMatchObject(testResults.validTestResultForMultipleSheets)
  })

  it('parses empty json', () => {
    const result = parse(testData.emptyModel)

    expect(result).toMatchObject(testResults.emptyTestResult)
  })

  it('parses multiple sheets with headers on different rows', () => {
    const result = parse(
      testData.validModelMultipleSheetsHeadersOnDifferentRows
    )

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(3)
    expect(result.items[1].row_location.rowNumber).toBe(4)
  })
})
