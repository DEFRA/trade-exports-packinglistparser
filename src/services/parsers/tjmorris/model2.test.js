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
})
