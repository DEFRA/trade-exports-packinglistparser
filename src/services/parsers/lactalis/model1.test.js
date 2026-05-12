import { describe, test, expect } from 'vitest'
import { parse } from './model1.js'
import model from '../../../../test/test-data-and-results/models/lactalis/model1.js'
import testResults from '../../../../test/test-data-and-results/results/lactalis/model1.js'

describe('parseLactalisModel1', () => {
  test('parses MCL (Q8) format', () => {
    const result = parse(model.validModel)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  test('parses LNCD (Q7) format', () => {
    const result = parse(model.validModelLncd)

    expect(result).toMatchObject(testResults.validTestResultLncd)
  })

  test('filters out "(blank)" placeholder rows', () => {
    const result = parse(model.blankPlaceholderRows)

    expect(result).toMatchObject(testResults.blankPlaceholderResult)
  })

  test('filters out zero-filled rows', () => {
    const result = parse(model.zeroFilledRows)

    expect(result).toMatchObject(testResults.zeroFilledResult)
  })

  test('parses empty json gracefully', () => {
    const result = parse({})

    expect(result).toMatchObject(testResults.emptyTestResult)
  })
})
