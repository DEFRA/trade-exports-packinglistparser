// Vitest mocks for CoO validation testing
import { vi, describe, test, expect } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/buffaload-logistics/model1.js'
import parserModel from '../../../src/services/parser-model.js'
import test_results from '../../test-data-and-results/results/buffaload-logistics/model1.js'
import failureReasons from '../../../src/services/validators/packing-list-failure-reasons.js'

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
    const filename = 'packinglist.wrong'
    const invalidTestResult_NoMatch = {
      business_checks: {
        all_required_fields_present: false,
        failure_reasons: null
      },
      items: [],
      registration_approval_number: null,
      parserModel: parserModel.NOMATCH
    }

    const result = await parserService.findParser(model.validModel, filename)

    expect(result).toMatchObject(invalidTestResult_NoMatch)
  })

  test('matches valid Buffaload Model 1 file with multiple sheets where headers are on different rows, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(
      model.validModelMultipleSheetsHeadersOnDifferentRows,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(3)
    expect(result.items[1].row_location.rowNumber).toBe(4)
  })
})

describe('BUFFALOAD1 CoO Validation Tests', () => {
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
      failureReasons.NIRMS_MISSING + ' in sheet "Tabelle1" row 3.\n'
    )
  })

  test('Null NIRMS value multiple - validation errors', async () => {
    const result = await parserService.findParser(
      model.nullNirmsMultipleModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.NIRMS_MISSING +
        ' in sheet "Tabelle1" row 3, sheet "Tabelle1" row 4, sheet "Tabelle1" row 5 in addition to 1 other locations.\n'
    )
  })

  test('Invalid NIRMS value - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidNirmsModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.NIRMS_INVALID + ' in sheet "Tabelle1" row 3.\n'
    )
  })

  test('Invalid NIRMS value multiple - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidNirmsMultipleModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.NIRMS_INVALID +
        ' in sheet "Tabelle1" row 3, sheet "Tabelle1" row 4, sheet "Tabelle1" row 5 in addition to 1 other locations.\n'
    )
  })

  test('Null CoO Value - validation errors', async () => {
    const result = await parserService.findParser(model.nullCooModel, filename)

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.COO_MISSING + ' in sheet "Tabelle1" row 3.\n'
    )
  })

  test('Null CoO Value multiple - validation errors', async () => {
    const result = await parserService.findParser(
      model.nullCooMultipleModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.COO_MISSING +
        ' in sheet "Tabelle1" row 3, sheet "Tabelle1" row 4, sheet "Tabelle1" row 5 in addition to 1 other locations.\n'
    )
  })

  test('Invalid CoO Value - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidCooModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.COO_INVALID + ' in sheet "Tabelle1" row 3.\n'
    )
  })

  test('Invalid CoO Value multiple - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidCooMultipleModel,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.COO_INVALID +
        ' in sheet "Tabelle1" row 3, sheet "Tabelle1" row 4, sheet "Tabelle1" row 5 in addition to 1 other locations.\n'
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

  test('Valid CoO Validation - Complete packing list with all fields valid', async () => {
    const result = await parserService.findParser(model.validCooModel, filename)

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.business_checks.failure_reasons).toBeNull()
  })
})
