import { describe, test, expect } from 'vitest'
import { parse } from './model2.js'
import model from '../../../../test/test-data-and-results/models/tjmorris/model2.js'
import testResults from '../../../../test/test-data-and-results/results/tjmorris/model2.js'

describe('parseTjmorrisModel2', () => {
  test('parses valid json', () => {
    const result = parse(model.validModel)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  test('parses multiple sheets', () => {
    const result = parse(model.validModelMultipleSheets)

    expect(result).toMatchObject(testResults.validTestResultForMultipleSheets)
  })

  test('parses empty json', () => {
    const result = parse(model.emptyModel)

    expect(result).toMatchObject(testResults.emptyModelResult)
  })

  test('returns NOMATCH result when an error is thrown during processing', () => {
    // Create a malformed object that will cause an error when Object.keys is called
    const malformedPackingList = {
      get sheet1() {
        throw new Error('Test error during processing')
      }
    }

    const result = parse(malformedPackingList)

    expect(result).toMatchObject({
      business_checks: {
        all_required_fields_present: false,
        failure_reasons: null
      },
      items: [],
      parserModel: 'NOMATCH',
      registration_approval_number: null
    })
  })

  test('returns NOMATCH result when null is passed', () => {
    const result = parse(null)

    expect(result).toMatchObject({
      business_checks: {
        all_required_fields_present: false,
        failure_reasons: null
      },
      items: [],
      parserModel: 'NOMATCH',
      registration_approval_number: null
    })
  })
})
