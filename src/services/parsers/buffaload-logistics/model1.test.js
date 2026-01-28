import { describe, test, expect, vi } from 'vitest'
import * as parser from './model1.js'
import model from '../../../../test/test-data-and-results/models/buffaload-logistics/model1.js'
import test_results from '../../../../test/test-data-and-results/results/buffaload-logistics/model1.js'
import parserModel from '../../parser-model.js'
import * as regex from '../../../utilities/regex.js'

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

  test('handles error when parsing throws exception', () => {
    // Spy on regex.findMatch to throw an error
    const findMatchSpy = vi.spyOn(regex, 'findMatch').mockImplementation(() => {
      throw new Error('Test error in findMatch')
    })

    const result = parser.parse(model.validModel)

    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.items).toEqual([])

    findMatchSpy.mockRestore()
  })

  test('handles error when Object.keys throws exception', () => {
    const result = parser.parse(null)

    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.items).toEqual([])
  })

  test('handles error when undefined is passed', () => {
    const result = parser.parse(undefined)

    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.items).toEqual([])
  })

  test('handles error when invalid data structure is passed', () => {
    const invalidData = {
      Sheet1: 'invalid string instead of array'
    }

    const result = parser.parse(invalidData)

    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('handles error when rowFinder throws exception', () => {
    // Create a mock data that will cause rowFinder to fail
    const problematicData = {
      Sheet1: [
        { A: 'RMS-GB-000098-001' },
        null, // This null might cause issues
        { B: 'some data' }
      ]
    }

    const result = parser.parse(problematicData)

    // Should catch error and return NOMATCH
    expect(result.parserModel).toBe(parserModel.NOMATCH)
  })
})
