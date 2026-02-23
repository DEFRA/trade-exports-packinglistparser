import { describe, test, expect } from 'vitest'
import { parse } from './model1.js'
import parserModel from '../../parser-model.js'
import model from '../../../../test/test-data-and-results/models/bartonredman/model1.js'
import testResults from '../../../../test/test-data-and-results/results/bartonredman/model1.js'

describe('Barton and Redman Model 1 Parser', () => {
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

  test('ignores invalid sheets and parses valid sheet', () => {
    const packingListJson = {
      References: [
        {
          A: 'Invalid reference data'
        }
      ],
      'Input Packing Sheet': model.validModel['Input Packing Sheet']
    }

    const result = parse(packingListJson)

    expect(result.parserModel).toBe(parserModel.BARTONREDMAN1)
    expect(result.registration_approval_number).toBe('RMS-GB-000137-001')
    expect(result.items).toHaveLength(2)
  })

  test('returns empty parse result when all sheets are invalid', () => {
    const packingListJson = {
      References: [{ A: 'Invalid reference data' }],
      Lookups: [{ A: 'Invalid lookup data' }]
    }

    const result = parse(packingListJson)

    expect(result.parserModel).toBe(parserModel.BARTONREDMAN1)
    expect(result.registration_approval_number).toBeNull()
    expect(result.items).toHaveLength(0)
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
