/**
 * Boots Model 1 parser-service integration tests
 */
import { describe, it, expect } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import testData from '../../test-data-and-results/models/boots/model1.js'
import testResults from '../../test-data-and-results/results/boots/model1.js'
import ParserModel from '../../../src/services/parser-model.js'

const filename = 'packinglist-boots-model1.xlsx'

describe('matchesBootsModel1', () => {
  it('matches valid Boots Model 1 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(testData.validModel, filename)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  it('matches valid Boots Model 1 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.findParser(
      testData.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(testResults.invalidTestResult_MissingCells)
  })

  it("returns 'No Match' for incorrect file extension", async () => {
    const filename = 'packinglist.wrong'
    const invalidTestResult_NoMatch = {
      business_checks: {
        all_required_fields_present: false,
        failure_reasons: null
      },
      items: [],
      registration_approval_number: null,
      parserModel: ParserModel.NOMATCH
    }

    const result = await parserService.findParser(testData.validModel, filename)

    expect(result).toMatchObject(invalidTestResult_NoMatch)
  })

  it('matches valid Boots Model 1 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parserService.findParser(
      testData.multipleRms,
      filename
    )

    expect(result).toMatchObject(testResults.multipleRms)
  })

  it('matches valid Boots Model 1 file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
    const result = await parserService.findParser(
      testData.missingKgunit,
      filename
    )

    expect(result).toMatchObject(testResults.missingKgunit)
  })

  it('matches valid Boots Model 1 file with multiple sheets where headers are on different rows, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(
      testData.validModelMultipleSheetsHeadersOnDifferentRows,
      filename
    )

    // This test has multiple RMS numbers (001 and 002) which causes validation failure
    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(19)
    expect(result.items[1].row_location.rowNumber).toBe(20)
  })
})
