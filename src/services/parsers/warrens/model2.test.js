import { describe, test, expect } from 'vitest'
import { parse } from './model2.js'
import model from '../../../../test/test-data-and-results/models/warrens/model2.js'
import testResults from '../../../../test/test-data-and-results/results/warrens/model2.js'
import parserModel from '../../parser-model.js'

describe('parseWarrensModel2', () => {
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

    expect(result.registration_approval_number).toBeNull()
    expect(result.items).toHaveLength(0)
    expect(result.parserModel).toBe(parserModel.WARRENS2)
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
