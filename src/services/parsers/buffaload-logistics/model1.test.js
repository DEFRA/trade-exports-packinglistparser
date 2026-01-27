import { describe, test, expect } from 'vitest'
import * as parser from './model1.js'
import model from '../../../../test/test-data-and-results/models/buffaload-logistics/model1.js'
import test_results from '../../../../test/test-data-and-results/results/buffaload-logistics/model1.js'

describe('parsesBuffaloadLogisticsModel1', () => {
  test('parses valid json', () => {
    const result = parser.parse(model.validModel)

    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('parses multiple sheets', () => {
    const result = parser.parse(model.validModelMultipleSheets)

    expect(result).toMatchObject(test_results.validTestResultForMultipleSheets)
  })

  test('parses empty json', () => {
    const result = parser.parse(model.emptyModel)

    expect(result).toMatchObject(test_results.emptyModelResult)
  })
})
