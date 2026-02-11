import { describe, test, expect } from 'vitest'
import { parse } from './model2.js'
import model from '../../../../test/test-data-and-results/models/fowlerwelch/model2.js'
import testResults from '../../../../test/test-data-and-results/results/fowlerwelch/model2.js'

describe('parseFowlerwelchModel2', () => {
  test('parses json', () => {
    const result = parse(model.validModel)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  test('parses multiple sheets', () => {
    const result = parse(model.validModel_Multiple)

    expect(result).toMatchObject(testResults.validTestResultMultiple)
  })

  test('parses empty json', () => {
    const packingListJson = model.emptyModel

    const result = parse(packingListJson)

    expect(result).toMatchObject(testResults.emptyFile)
  })

  test('returns NOMATCH result when an error is thrown during processing', () => {
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
