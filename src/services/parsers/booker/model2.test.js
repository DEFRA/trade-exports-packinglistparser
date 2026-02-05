import { parse } from './model2.js'
import model from '../../../../test/test-data-and-results/models/booker/model2.js'
import testResults from '../../../../test/test-data-and-results/results/booker/model2.js'

describe('parseBookerModel2', () => {
  test('parses populated json', () => {
    const result = parse(model.validModel)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  test('parses populated json with total', () => {
    const result = parse(model.validModelWithTotal)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  test('parses multiple sheets', () => {
    const result = parse(model.validModelMultipleSheets)

    expect(result).toMatchObject(testResults.validTestResultForMultipleSheets)
  })

  test('parses empty json', () => {
    const result = parse(model.emptyModel)

    expect(result).toMatchObject(testResults.emptyTestResult)
  })
})
