import { describe, it, expect, vi } from 'vitest'
import { parse } from './model1.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import model from '../../../../test/test-data-and-results/models/fowlerwelch/model1.js'
import testResults from '../../../../test/test-data-and-results/results/fowlerwelch/model1.js'

describe('parseFowlerWelchModel1', () => {
  it('parses valid json', () => {
    const result = parse(model.validModel)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  it('parses valid json with dragdown', () => {
    const result = parse(model.validModelWithDragdown)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  it('parses multiple sheets', () => {
    const result = parse(model.validModel_Multiple)

    expect(result).toMatchObject(testResults.validTestResultMultipleSheets)
  })

  it('parses empty json', () => {
    const result = parse(model.emptyModel)

    expect(result).toMatchObject(testResults.emptyModelResult)
  })

  it('should call logger.error when an error is thrown', () => {
    const logger = createLogger()
    const errorSpy = vi.spyOn(logger, 'error')

    parse(null)

    expect(errorSpy).toHaveBeenCalled()
  })
})
