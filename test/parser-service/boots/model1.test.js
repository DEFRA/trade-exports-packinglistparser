/**
 * Boots Model 1 parser-service integration tests
 */
import { describe, it, expect } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import testData from '../../test-data-and-results/models/boots/model1.js'
import testResults from '../../test-data-and-results/results/boots/model1.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

const filename = 'packinglist-boots-model1.xlsx'

describe('matchesBootsModel1', () => {
  it('matches valid Boots Model 1 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.parsePackingList(
      testData.validModel,
      filename
    )

    expect(result).toMatchObject(testResults.validTestResult)
  })

  it('matches valid Boots Model 1 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.parsePackingList(
      testData.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(testResults.invalidTestResult_MissingCells)
  })

  it("returns 'No Match' for incorrect file extension", async () => {
    const result = await parserService.parsePackingList(
      testData.validModel,
      INVALID_FILENAME
    )

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })

  it('matches valid Boots Model 1 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parserService.parsePackingList(
      testData.multipleRms,
      filename
    )

    expect(result).toMatchObject(testResults.multipleRms)
  })

  it('matches valid Boots Model 1 file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
    const result = await parserService.parsePackingList(
      testData.missingKgunit,
      filename
    )

    expect(result).toMatchObject(testResults.missingKgunit)
  })

  it('matches valid Boots Model 1 file with multiple sheets where headers are on different rows, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.parsePackingList(
      testData.validModelMultipleSheetsHeadersOnDifferentRows,
      filename
    )

    // This test has multiple RMS numbers (001 and 002) which causes validation failure
    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(19)
    expect(result.items[1].row_location.rowNumber).toBe(20)
  })
})
