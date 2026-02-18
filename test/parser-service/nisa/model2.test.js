// ⚠️ CRITICAL: Top-level mocks (hoisted properly)
import { describe, test, expect, vi } from 'vitest'

import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/nisa/model2.js'
import test_results from '../../test-data-and-results/results/nisa/model2.js'
import {
  INVALID_FILENAME,
  NO_MATCH_RESULT,
  ERROR_SUMMARY_TEXT
} from '../../test-constants.js'

vi.mock('../../../src/services/data/data-iso-codes.json', () => ({
  default: ['VALID_ISO', 'INELIGIBLE_ITEM_ISO', 'GB', 'X', 'IE', 'FR', 'DE']
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

const filename = 'packinglist-nisa-model2.xlsx'

// Expected row numbers for multi-sheet test
const EXPECTED_FIRST_DATA_ROW = 3
const EXPECTED_SECOND_DATA_ROW = 4

describe('matchesNisaModel2', () => {
  test('matches valid Nisa Model 2 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(model.validModel, filename)

    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('matches valid Nisa Model 2 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
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

  test('matches valid Nisa Model 2 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parserService.findParser(model.multipleRms, filename)

    expect(result).toMatchObject(test_results.multipleRms)
  })

  test('matches valid Nisa Model 2 file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
    const result = await parserService.findParser(model.missingKgunit, filename)

    expect(result).toMatchObject(test_results.missingKgunit)
  })

  test('matches valid Nisa Model 2 file, calls parser and returns all_required_fields_present as false for missing mandatory data', async () => {
    const result = await parserService.findParser(
      model.missingMandatoryData,
      filename
    )

    expect(result).toMatchObject(test_results.missingMandatoryData)
  })

  test('matches valid Nisa Model 2 file with multiple sheets where headers are on different rows, calls parser and returns all_required_fields_present as true', async () => {
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

describe('Nisa 2 CoO Validation Tests - Type 1 - Nirms', () => {
  // Valid CoO validation - happy path
  test('Valid packing list with conventional NIRMS values - passes all validation', async () => {
    const result = await parserService.findParser(model.validCooModel, filename)

    expect(result.business_checks.failure_reasons).toBeNull()
    expect(result.items.every((item) => item.country_of_origin)).toBe(true)
    expect(result.items.every((item) => item.commodity_code)).toBe(true)
    expect(result.items.every((item) => item.nirms)).toBe(true)
  })

  // BAC1: NOT within NIRMS Scheme - passes validation
  test('BAC1: NOT within NIRMS Scheme - passes validation', async () => {
    const result = await parserService.findParser(model.nonNirmsModel, filename)

    expect(result.business_checks.failure_reasons).toBeNull()
  })

  // BAC2: Null NIRMS value - validation errors
  test('BAC2: Null NIRMS value - validation errors', async () => {
    const result = await parserService.findParser(
      model.nullNirmsModel,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(
      'NIRMS/Non-NIRMS goods not specified'
    )
  })

  // BAC3: Invalid NIRMS value - validation errors
  test('BAC3: Invalid NIRMS value - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidNirmsModel,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(
      'Invalid entry for NIRMS/Non-NIRMS goods'
    )
  })

  // BAC4: Null NIRMS value, more than 3 - multiple validation errors
  test('BAC4: Null NIRMS value, more than 3 - multiple validation errors', async () => {
    const result = await parserService.findParser(
      model.nullNirmsMultipleModel,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  // BAC5: Invalid NIRMS value, more than 3 - multiple validation errors
  test('BAC5: Invalid NIRMS value, more than 3 - multiple validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidNirmsMultipleModel,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })
})

describe('Nisa 2 CoO Validation Tests - Type 1 - CoO', () => {
  // BAC6: Null CoO Value - validation errors
  test('BAC6: Null CoO Value - validation errors', async () => {
    const result = await parserService.findParser(model.nullCooModel, filename)

    expect(result.business_checks.failure_reasons).toContain(
      'Missing Country of Origin'
    )
  })

  // BAC7: Invalid CoO Value - validation errors
  test('BAC7: Invalid CoO Value - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidCooModel,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(
      'Invalid Country of Origin ISO Code'
    )
  })

  // BAC8: Null CoO Value, more than 3 - multiple validation errors
  test('BAC8: Null CoO Value, more than 3 - multiple validation errors', async () => {
    const result = await parserService.findParser(
      model.nullCooMultipleModel,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  // BAC9: Invalid CoO Value, more than 3 - multiple validation errors
  test('BAC9: Invalid CoO Value, more than 3 - multiple validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidCooMultipleModel,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  // BAC10: CoO Placeholder X - passes validation
  test('BAC10: CoO Placeholder X - passes validation', async () => {
    const result = await parserService.findParser(model.xCooModel, filename)

    expect(result.business_checks.failure_reasons).toBeNull()
  })
})

describe('Nisa 2 CoO Validation Tests - Type 1 - Ineligible Items', () => {
  // BAC11: ineligible item with Treatment Type - validation errors
  test('BAC11: ineligible item with Treatment Type - validation errors', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsWithTreatment,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(
      'Prohibited item identified on the packing list'
    )
  })

  // BAC12: ineligible items, more than 3 (Treatment Type specified) - multiple validation errors
  test('BAC12: ineligible items, more than 3 (Treatment Type specified) - multiple validation errors', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsMultipleWithTreatment,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  // BAC13: ineligible item without Treatment Type - validation errors
  test('BAC13: ineligible item without Treatment Type - validation errors', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsWithoutTreatment,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(
      'Prohibited item identified on the packing list'
    )
  })

  // BAC14: ineligible items, more than 3 (no Treatment Type specified) - multiple validation errors
  test('BAC14: ineligible items, more than 3 (no Treatment Type specified) - multiple validation errors', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsMultipleWithoutTreatment,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })
})
