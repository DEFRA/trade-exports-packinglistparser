/**
 * Savers Model 2 CSV Parser Service Integration Tests
 *
 * Tests the complete parser service workflow for SAVERS2 CSV model.
 */
import { describe, test, expect } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models-csv/savers/model2.js'
import test_results from '../../test-data-and-results/results-csv/savers/model2.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

const filename = 'packinglist.csv'

describe('matchesSaversModel2', () => {
  test('matches valid Savers Model 2 CSV file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.parsePackingList(
      model.validModel,
      filename
    )

    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('matches valid Savers Model 2 CSV file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.parsePackingList(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
  })

  test("returns 'No Match' for incorrect file extension", async () => {
    const result = await parserService.parsePackingList(
      model.validModel,
      INVALID_FILENAME
    )

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })
})
