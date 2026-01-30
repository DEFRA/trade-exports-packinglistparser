import { describe, test, expect, vi } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/sainsburys/model1.js'
import test_results from '../../test-data-and-results/results/sainsburys/model1.js'
import failureReasons from '../../../src/services/validators/packing-list-failure-reasons.js'
import {
  INVALID_FILENAME,
  NO_MATCH_RESULT,
  ERROR_SUMMARY_TEXT
} from '../../test-constants.js'

vi.mock('../../../src/services/data/data-iso-codes.json', () => ({
  default: ['VALID_ISO', 'INELIGIBLE_ITEM_ISO']
}))

vi.mock('../../../../../src/services/data/data-ineligible-items.json', () => ({
  default: [
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO',
      commodity_code: '012',
      type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT'
    }
  ]
}))

const filename = 'packinglist-sainsburys-model1.xlsx'

// Expected row numbers for multi-sheet test
const EXPECTED_FIRST_DATA_ROW = 2
const EXPECTED_SECOND_DATA_ROW = 3

describe('matchesSainsburysModel1', () => {
  test('matches valid Sainsburys Model 1 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(model.validModel, filename)

    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('matches valid Sainsburys Model 1 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.findParser(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
  })

  test("returns 'No Match' for incorrect file extension", async () => {
    const result = await parserService.findParser(
      model.validModel,
      INVALID_FILENAME
    )

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })

  test('matches valid Sainsburys Model 1 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parserService.findParser(model.multipleRms, filename)

    expect(result).toMatchObject(test_results.multipleRms)
  })

  test('matches valid Sainsburys Model 1 file file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
    const result = await parserService.findParser(model.missingKgunit, filename)

    expect(result).toMatchObject(test_results.missingKgunit)
  })

  test('matches valid Sainsburys Model 1 file, calls parser and returns all_required_fields_present as false for invalid NIRMS', async () => {
    const result = await parserService.findParser(model.invalidNirms, filename)

    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.NIRMS_INVALID} in sheet "Sheet1" row 2.\n`
    )
  })

  test('matches valid Sainsburys Model 1 file, calls parser and returns all_required_fields_present as true for valid NIRMS', async () => {
    const result = await parserService.findParser(model.nonNirms, filename)

    expect(result.business_checks.all_required_fields_present).toBeTruthy()
  })

  test('matches valid Sainsburys Model 1 file, calls parser and returns all_required_fields_present as false for missing NIRMS', async () => {
    const result = await parserService.findParser(model.missingNirms, filename)

    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.NIRMS_MISSING} in sheet "Sheet1" row 2.\n`
    )
  })

  test('matches valid Sainsburys Model 1 file, calls parser and returns all_required_fields_present as false for missing CoO', async () => {
    const result = await parserService.findParser(model.missingCoO, filename)

    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.COO_MISSING} in sheet "Sheet1" row 2, sheet "Sheet1" row 3, sheet "Sheet1" row 4 ${ERROR_SUMMARY_TEXT} 2 other locations.\n`
    )
  })

  test('matches valid Sainsburys Model 1 file, calls parser and returns all_required_fields_present as false for invalid CoO', async () => {
    const result = await parserService.findParser(model.invalidCoO, filename)

    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.COO_INVALID} in sheet "Sheet1" row 2, sheet "Sheet1" row 3, sheet "Sheet1" row 4 ${ERROR_SUMMARY_TEXT} 2 other locations.\n`
    )
  })

  test('matches valid Sainsburys Model 1 file, calls parser and returns all_required_fields_present as true for X CoO', async () => {
    const result = await parserService.findParser(model.xCoO, filename)

    expect(result.business_checks.all_required_fields_present).toBeTruthy()
  })

  test('matches valid Sainsburys Model 1 file with multiple sheets where headers are on different rows', async () => {
    const result = await parserService.findParser(
      model.validModelMultipleSheetsHeadersOnDifferentRows,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(EXPECTED_FIRST_DATA_ROW)
    expect(result.items[1].row_location.rowNumber).toBe(
      EXPECTED_SECOND_DATA_ROW
    )
  })
})
