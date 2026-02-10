import { describe, test, expect, vi } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/turners/model1.js'
import parserModel from '../../../src/services/parser-model.js'
import testResults from '../../test-data-and-results/results/turners/model1.js'
import { INVALID_FILENAME } from '../../test-constants.js'

vi.mock('../../../src/services/data/data-iso-codes.json', () => ({
  default: ['IE', 'GB', 'VALID_ISO']
}))

const filename = 'packinglist-turners-model1.xlsx'

describe('matchesTurnersModel1', () => {
  test('matches valid TURNERS Model 1 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(model.validModel, filename)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  test('matches valid TURNERS Model 1 file with multiple sheets, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(
      model.validModelMultipleSheets,
      filename
    )

    expect(result).toMatchObject(testResults.validTestResultForMultipleSheets)
  })

  test('matches valid TURNERS Model 1 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.findParser(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(
      testResults.invalidTestResult_MissingColumnCells
    )
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
})
