import { describe, test, expect, vi } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/fowlerwelch/model1.js'
import parserModel from '../../../src/services/parser-model.js'
import testResults from '../../test-data-and-results/results/fowlerwelch/model1.js'
import { INVALID_FILENAME } from '../../test-constants.js'

vi.mock('../../../src/services/data/data-iso-codes.json', () => ({
  default: ['GB', 'X']
}))

const filename = 'packinglist-fowlerwelch-model1.xlsx'

describe('matchesFowlerwelchModel1', () => {
  test('matches valid Fowlerwelch Model 1 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(model.validModel, filename)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  test('matches Fowlerwelch Model 1 file with multiple sheets containing different RMS numbers, returns validation error', async () => {
    const result = await parserService.findParser(
      model.validModel_Multiple,
      filename
    )

    // Note: validModel_Multiple has different RMS numbers across sheets (002 and 001)
    // which triggers the multiple RMS validation error
    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toContain(
      'Multiple GB Place of Dispatch'
    )
  })

  test('matches valid Fowlerwelch Model 1 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.findParser(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(testResults.invalidTestResult_MissingCells)
  })

  test("returns 'No Match' for incorrect file extension", async () => {
    const invalidTestResult_NoMatch = {
      business_checks: {
        all_required_fields_present: false,
        failure_reasons: null
      },
      items: [],
      registration_approval_number: null,
      parserModel: parserModel.NOMATCH
    }

    const result = await parserService.findParser(
      model.validModel,
      INVALID_FILENAME
    )

    expect(result).toMatchObject(invalidTestResult_NoMatch)
  })

  test('matches valid Fowlerwelch Model 1 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parserService.findParser(model.multipleRms, filename)

    expect(result).toMatchObject(testResults.multipleRms)
  })

  test('matches valid Fowlerwelch Model 1 file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
    const result = await parserService.findParser(model.missingKgunit, filename)

    expect(result).toMatchObject(testResults.missingKgunit)
  })
})
