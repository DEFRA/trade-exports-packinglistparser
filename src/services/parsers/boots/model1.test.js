import { parse } from './model1.js'
import model from '../../../../test/test-data-and-results/models/boots/model1.js'
import test_results from '../../../../test/test-data-and-results/results/boots/model1.js'

describe('parse a packing list using the BOOTS1 parser', () => {
  test.each([
    [model.validModel, test_results.validTestResult],
    [model.validModel_MissingFooter, test_results.validTestResult],
    [model.validHeadersNoData, test_results.emptyTestResult],
    [model.invalidModel_MissingHeaders, test_results.failedTestResult]
  ])('parses model', (testModel, expected) => {
    const result = parse(testModel)

    expect(result).toMatchObject(expected)
  })
})
