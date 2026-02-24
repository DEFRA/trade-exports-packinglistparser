import { describe, test, expect } from 'vitest'
import { parse } from './model2.js'
import model from '../../../../test/test-data-and-results/models/nutricia/model2.js'
import test_results from '../../../../test/test-data-and-results/results/nutricia/model2.js'
import parserModel from '../../parser-model.js'

describe('parseNutriciaModel2', () => {
  test('parses populated json', () => {
    const result = parse(model.modelWithNoUnitInHeader)

    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('parses multiple sheets', () => {
    const result = parse(model.validModelMultipleSheets)

    expect(result).toMatchObject(test_results.validTestResultForMultipleSheets)
  })

  test('parses empty json', () => {
    const result = parse(model.emptyModel)

    expect(result).toMatchObject(test_results.emptyModelResult)
  })

  test('returns NOMATCH for empty packingListJson', () => {
    const result = parse({})

    expect(result.parserModel).toBe(parserModel.NOMATCH)
  })
})
