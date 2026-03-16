// ⚠️ CRITICAL: Top-level mocks (hoisted properly)
import { vi, describe, test, expect } from 'vitest'
import { parsePackingList } from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/nisa/model1.js'
import test_results from '../../test-data-and-results/results/nisa/model1.js'
import failureReasons from '../../../src/services/validators/packing-list-failure-reasons.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

vi.mock('../../../src/services/data/data-iso-codes.json', () => ({
  default: ['VALID_ISO', 'INELIGIBLE_ITEM_ISO']
}))

vi.mock('../../../src/services/data/data-ineligible-items.json', () => ({
  default: [
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO',
      commodity_code: '012',
      type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT'
    }
  ]
}))

const filename = 'packinglist-nisa-model1.xlsx'

// Expected row numbers for multi-sheet test
const EXPECTED_FIRST_DATA_ROW = 2
const EXPECTED_SECOND_DATA_ROW = 3

describe('parsePackingList', () => {
  test('matches valid Nisa Model 1 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parsePackingList(model.validModel, filename)

    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('matches valid Nisa Model 1 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parsePackingList(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
  })

  test("returns 'No Match' for incorrect file extension", async () => {
    const result = await parsePackingList(model.validModel, INVALID_FILENAME)

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })

  test('matches valid Nisa Model 1 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parsePackingList(model.multipleRms, filename)

    expect(result).toMatchObject(test_results.multipleRms)
  })

  test('matches valid Nisa Model 1 file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
    const result = await parsePackingList(model.missingKgunit, filename)

    expect(result).toMatchObject(test_results.missingKgunit)
  })

  test('matches valid NISA Model 1 file, calls parser and returns all_required_fields_present as false for invalid NIRMS', async () => {
    const result = await parsePackingList(model.invalidNirms, filename)

    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.NIRMS_INVALID} in sheet "Customer Order" row 2.\n`
    )
  })

  test('matches valid NISA Model 1 file, calls parser and returns all_required_fields_present as true for valid NIRMS', async () => {
    const result = await parsePackingList(model.nonNirms, filename)

    expect(result.business_checks.all_required_fields_present).toBeTruthy()
  })

  test('matches valid NISA Model 1 file, calls parser and returns all_required_fields_present as false for missing NIRMS', async () => {
    const result = await parsePackingList(model.missingNirms, filename)

    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.NIRMS_MISSING} in sheet "Customer Order" row 2.\n`
    )
  })

  test('matches valid NISA Model 1 file, calls parser and returns all_required_fields_present as false for missing CoO', async () => {
    const result = await parsePackingList(model.missingCoO, filename)

    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.COO_MISSING +
        ' in sheet "Customer Order" row 2 and sheet "Customer Order" row 3.\n'
    )
  })

  test('matches valid NISA Model 1 file, calls parser and returns all_required_fields_present as false for invalid CoO', async () => {
    const result = await parsePackingList(model.invalidCoO, filename)

    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.COO_INVALID +
        ' in sheet "Customer Order" row 2 and sheet "Customer Order" row 3.\n'
    )
  })

  test('matches valid NISA Model 1 file, calls parser and returns all_required_fields_present as true for X CoO', async () => {
    const result = await parsePackingList(model.xCoO, filename)

    expect(result.business_checks.all_required_fields_present).toBeTruthy()
  })

  test('matches valid NISA Model 1 file, calls parser and returns all_required_fields_present as false for ineligible items', async () => {
    const result = await parsePackingList(model.ineligibleItems, filename)

    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.PROHIBITED_ITEM +
        ' in sheet "Customer Order" row 2 and sheet "Customer Order" row 4.\n'
    )
  })

  test('matches valid Nisa Model 1 file with multiple sheets where headers are on different rows', async () => {
    const result = await parsePackingList(
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
