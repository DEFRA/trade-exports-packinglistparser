import { describe, test, expect } from 'vitest'
import { parse } from './model1.js'
import model from '../../../../test/test-data-and-results/models/manfreight/model1.js'
import test_results from '../../../../test/test-data-and-results/results/manfreight/model1.js'

describe('parseManfreightModel1', () => {
  test('parses populated json', () => {
    const result = parse(model.validModel)

    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('parses multiple sheets', () => {
    const result = parse(model.validModelMultipleSheets)

    expect(result).toMatchObject(test_results.validTestResultForMultipleSheets)
  })

  test('parses empty json', () => {
    const result = parse(model.emptyModel)

    expect(result).toMatchObject(test_results.emptyTestResult)
  })

  test('filters out footer rows containing only totals', () => {
    const result = parse(model.validModelWithFooterRow)

    expect(result).toMatchObject(test_results.validTestResult)
    expect(result.items).toHaveLength(2)
  })

  test('skips excluded sheets and only returns data from valid sheets', () => {
    const result = parse(model.validModelWithInvalidSheet)

    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      description: 'Fresh Chicken Breast 500g',
      commodity_code: '0207130000'
    })
  })

  test('handles exception during parsing', () => {
    const invalidData = {
      Sheet1: [
        {
          get B() {
            throw new Error('Simulated parsing error')
          }
        }
      ]
    }

    const result = parse(invalidData)

    expect(result.parserModel).toBe('NOMATCH')
    expect(result.items).toEqual([])
  })
})
