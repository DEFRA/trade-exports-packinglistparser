import { describe, test, expect, vi } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/warrens/model2.js'
import testResults from '../../test-data-and-results/results/warrens/model2.js'
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

const filename = 'packinglist.xlsx'

describe('matchesWarrensModel2', () => {
  test('matches valid Warrens Model 2 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(model.validModel, filename)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  test('matches valid Warrens Model 2 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.findParser(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(testResults.invalidTestResult_MissingCells)
  })

  test("returns 'No Match' for incorrect file extension", async () => {
    const result = await parserService.findParser(
      model.validModel,
      INVALID_FILENAME
    )

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })

  test('matches valid Warrens Model 2 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parserService.findParser(model.multipleRms, filename)

    expect(result).toMatchObject(testResults.multipleRms)
  })

  test('matches valid Warrens Model 2 file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
    const result = await parserService.findParser(model.missingKgunit, filename)

    expect(result).toMatchObject(testResults.missingKgunit)
  })
})

describe('Warrens 2 CoO Validation Tests - Type 1 - Nirms', () => {
  test('BAC1: NOT within NIRMS Scheme - passes validation', async () => {
    const result = await parserService.findParser(model.nonNirmsModel, filename)
    expect(result.business_checks.failure_reasons).toBeNull()
  })

  test('BAC2: Null NIRMS value - validation errors', async () => {
    const result = await parserService.findParser(
      model.nullNirmsModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'NIRMS/Non-NIRMS goods not specified'
    )
  })

  test('BAC3: Invalid NIRMS value - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidNirmsModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Invalid entry for NIRMS/Non-NIRMS goods'
    )
  })

  test('BAC4: Null NIRMS value, more than 3 - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.nullNirmsMultipleModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  test('BAC5: Invalid NIRMS value, more than 3 - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.invalidNirmsMultipleModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })
})

describe('Warrens 2 CoO Validation Tests - Type 1 - CoO', () => {
  test('BAC6: Null CoO Value - validation errors', async () => {
    const result = await parserService.findParser(model.nullCooModel, filename)
    expect(result.business_checks.failure_reasons).toContain(
      'Missing Country of Origin'
    )
  })

  test('BAC7: Invalid CoO Value - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidCooModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Invalid Country of Origin ISO Code'
    )
  })

  test('BAC8: Null CoO Value, more than 3 - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.nullCooMultipleModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  test('BAC9: Invalid CoO Value, more than 3 - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.invalidCooMultipleModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  test('BAC10: CoO Value is X or x - passes validation', async () => {
    const result = await parserService.findParser(
      model.cooPlaceholderXModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toBeNull()
  })

  test('Valid CoO Validation: Complete packing list with all fields valid', async () => {
    const result = await parserService.findParser(model.validCooModel, filename)
    expect(result.business_checks.failure_reasons).toBeNull()
    expect(result.items.every((item) => item.country_of_origin)).toBe(true)
    expect(result.items.every((item) => item.commodity_code)).toBe(true)
    expect(result.items.every((item) => item.nirms)).toBe(true)
  })
})

describe('Warrens 2 CoO Validation Tests - Type 1 - Ineligible Items', () => {
  test('BAC11: Item Present on Ineligible Item List (Treatment Type specified) - validation errors', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsWithTreatmentModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Prohibited item identified on the packing list'
    )
  })

  test('BAC12: Item Present on Ineligible Item List, more than 3 (Treatment Type specified) - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsMultipleWithTreatmentModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  test('BAC13: Item Present on Ineligible Item List (no Treatment Type specified) - validation errors', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsNoTreatmentModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Prohibited item identified on the packing list'
    )
  })

  test('BAC14: Item Present on Ineligible Item List, more than 3 (no Treatment Type specified) - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsMultipleNoTreatmentModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })
})
