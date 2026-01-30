// Vitest mocks for CoO validation testing
import { vi, describe, test, expect } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/buffaload-logistics/model1.js'
import test_results from '../../test-data-and-results/results/buffaload-logistics/model1.js'
import failureReasons from '../../../src/services/validators/packing-list-failure-reasons.js'
import {
  INVALID_FILENAME,
  NO_MATCH_RESULT,
  ERROR_SUMMARY_TEXT
} from '../../test-constants.js'

vi.mock('../../../src/services/data/data-iso-codes.json', () => ({
  default: ['VALID_ISO', 'INELIGIBLE_ITEM_ISO', 'GB', 'X']
}))

vi.mock('../../../src/services/data/data-ineligible-items.json', () => ({
  default: [
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO',
      commodity_code: '1234',
      type_of_treatment: 'Processed'
    }
  ]
}))

const filename = 'PackingList-Buffaload-model1.xlsx'

// Expected row numbers for multi-sheet test
const EXPECTED_FIRST_DATA_ROW = 3
const EXPECTED_SECOND_DATA_ROW = 4

describe('matchesBuffaloadModel1', () => {
  test('matches valid Buffaload Model 1 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(model.validModel, filename)

    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('matches valid Buffaload Model 1 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.findParser(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
  })

  test('matches valid Buffaload Model 1 file, calls parser, but returns all_required_fields_present as false when multiple rms numbers', async () => {
    const result = await parserService.findParser(
      model.invalidMultipleRMS,
      filename
    )

    expect(result).toMatchObject(test_results.invalidTestResult_multipleRMS)
  })

  test("returns 'No Match' for incorrect file extension", async () => {
    const result = await parserService.findParser(
      model.validModel,
      INVALID_FILENAME
    )

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })

  test('matches valid Buffaload Model 1 file with multiple sheets where headers are on different rows, calls parser and returns all_required_fields_present as true', async () => {
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

describe('BUFFALOAD1 CoO Validation Tests - nirms', () => {
  // Order tests by BAC sequence for maintainability

  test('NOT within NIRMS Scheme - passes validation', async () => {
    const result = await parserService.findParser(model.nonNirmsModel, filename)

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.business_checks.failure_reasons).toBeNull()
  })

  test('Null NIRMS value - validation errors', async () => {
    const result = await parserService.findParser(
      model.nullNirmsModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.NIRMS_MISSING} in sheet "Tabelle1" row 3.\n`
    )
  })

  test('Null NIRMS value multiple - validation errors', async () => {
    const result = await parserService.findParser(
      model.nullNirmsMultipleModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.NIRMS_MISSING} in sheet "Tabelle1" row 3, sheet "Tabelle1" row 4, sheet "Tabelle1" row 5 ${ERROR_SUMMARY_TEXT} 1 other locations.\n`
    )
  })

  test('Invalid NIRMS value - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidNirmsModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.NIRMS_INVALID} in sheet "Tabelle1" row 3.\n`
    )
  })

  test('Invalid NIRMS value multiple - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidNirmsMultipleModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.NIRMS_INVALID} in sheet "Tabelle1" row 3, sheet "Tabelle1" row 4, sheet "Tabelle1" row 5 ${ERROR_SUMMARY_TEXT} 1 other locations.\n`
    )
  })

  test('Item Present on Ineligible Item List (Treatment Type specified) - validation errors', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsWithTreatmentModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.PROHIBITED_ITEM + ' in sheet "Tabelle1" row 3.\n'
    )
  })

  test('Item Present on Ineligible Item List (Treatment Type specified) - validation errors', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsMultipleWithTreatmentModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.PROHIBITED_ITEM +
        ' in sheet "Tabelle1" row 3, sheet "Tabelle1" row 4, sheet "Tabelle1" row 5 in addition to 1 other locations.\n'
    )
  })

  test('Valid CoO Validation - Complete packing list with all fields valid', async () => {
    const result = await parserService.findParser(model.validCooModel, filename)

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.business_checks.failure_reasons).toBeNull()
  })
})

describe('BUFFALOAD1 CoO Validation Tests - CoO', () => {
  test('Null CoO Value - validation errors', async () => {
    const result = await parserService.findParser(model.nullCooModel, filename)

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.COO_MISSING} in sheet "Tabelle1" row 3.\n`
    )
  })

  test('Null CoO Value multiple - validation errors', async () => {
    const result = await parserService.findParser(
      model.nullCooMultipleModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.COO_MISSING} in sheet "Tabelle1" row 3, sheet "Tabelle1" row 4, sheet "Tabelle1" row 5 ${ERROR_SUMMARY_TEXT} 1 other locations.\n`
    )
  })

  test('Invalid CoO Value - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidCooModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.COO_INVALID} in sheet "Tabelle1" row 3.\n`
    )
  })

  test('Invalid CoO Value multiple - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidCooMultipleModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.COO_INVALID} in sheet "Tabelle1" row 3, sheet "Tabelle1" row 4, sheet "Tabelle1" row 5 ${ERROR_SUMMARY_TEXT} 1 other locations.\n`
    )
  })

  test('CoO Value is X or x - passes validation', async () => {
    const result = await parserService.findParser(
      model.cooPlaceholderXModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.business_checks.failure_reasons).toBeNull()
  })
})

describe('BUFFALOAD1 CoO Validation Tests - Ineligible Item List', () => {
  test('Item Present on Ineligible Item List (no Treatment Type specified) - validation errors', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsNoTreatmentModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.PROHIBITED_ITEM + ' in sheet "Tabelle1" row 3.\n'
    )
  })

  test('Item Present on Ineligible Item List (no Treatment Type specified) - validation errors', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsMultipleNoTreatmentModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.PROHIBITED_ITEM +
        ' in sheet "Tabelle1" row 3, sheet "Tabelle1" row 4, sheet "Tabelle1" row 5 in addition to 1 other locations.\n'
    )
  })
})
