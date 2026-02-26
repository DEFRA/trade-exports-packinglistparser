import { describe, it, expect } from 'vitest'
import { parse } from './model1.js'
import model from '../../../../test/test-data-and-results/models/gousto/model1.js'
import test_results from '../../../../test/test-data-and-results/results/gousto/model1.js'

describe('parseGoustoModel1', () => {
  it('parses json', () => {
    const result = parse(model.validModel)

    expect(result).toMatchObject(test_results.validTestResult)
  })

  it('parses multiple sheets', () => {
    const result = parse(model.validModelMultipleSheets)

    expect(result).toMatchObject(test_results.validTestResultForMultipleSheets)
  })

  it('parses empty json', () => {
    const result = parse(model.emptyModel)

    expect(result).toMatchObject(test_results.emptyTestResult)
  })

  it('filters out rows with box numbers', () => {
    const result = parse(model.modelWithBoxNumberRows)

    expect(result).toMatchObject(test_results.boxNumberRowsFilteredResult)
    expect(result.items).toHaveLength(2)
    expect(result.items.map((i) => i.description)).toEqual([
      'Chicken Breast',
      'Beef Mince'
    ])
  })
})
