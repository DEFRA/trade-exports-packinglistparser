/**
 * Parser Service Integration Tests - Tesco Model 2
 *
 * Tests the full parser service flow for Tesco Model 2 including:
 * - Matcher identification
 * - Parser execution
 * - Validation (including Country of Origin)
 * - Business rule checks
 */
import { describe, it, expect, vi } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/tesco/model2.js'
import test_results from '../../test-data-and-results/results/tesco/model2.js'
import {
  INVALID_FILENAME,
  NO_MATCH_RESULT,
  ERROR_SUMMARY_TEXT
} from '../../test-constants.js'

const filename = 'PackingListTesco2.xlsx'

describe('matchesTescoModel2', () => {
  it('matches valid Tesco Model 2 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(model.validModel, filename)

    expect(result).toMatchObject(test_results.validTestResult)
  })

  it('matches valid Tesco Model 2 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.findParser(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
  })

  it("returns 'No Match' for incorrect file extension", async () => {
    const result = await parserService.findParser(
      model.validModel,
      INVALID_FILENAME
    )

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })

  it('matches valid Tesco Model 2 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parserService.findParser(model.multipleRms, filename)

    expect(result).toMatchObject(test_results.multipleRms)
  })

  it('matches valid Tesco Model 2 file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
    const result = await parserService.findParser(model.missingKgunit, filename)

    expect(result).toMatchObject(test_results.missingKgunit)
  })

  it('matches valid Tesco Model 2 file, calls parser and returns all_required_fields_present as true for missing row', async () => {
    const result = await parserService.findParser(model.missingRow, filename)

    expect(result).toMatchObject(test_results.missingRow)
  })
})

// Mock data for CoO validation testing
vi.mock('../../../src/services/data/data-iso-codes.json', () => ({
  default: ['VALID_ISO', 'PROHIBITED_ITEM_ISO', 'GB', 'BR', 'PE', 'X']
}))

vi.mock('../../../src/services/data/data-ineligible-items.json', () => ({
  default: [
    {
      country_of_origin: 'PROHIBITED_ITEM_ISO',
      commodity_code: '1234',
      type_of_treatment: 'Processed'
    }
  ]
}))

describe('Tesco2 CoO Validation Tests', () => {
  // Order tests by BAC sequence for maintainability

  it('BAC1: NOT within NIRMS Scheme - passes validation', async () => {
    const result = await parserService.findParser(model.nonNirmsModel, filename)
    expect(result.business_checks.failure_reasons).toBeNull()
  })

  it('BAC2: Null NIRMS value - validation errors', async () => {
    const result = await parserService.findParser(
      model.nullNirmsModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'NIRMS/Non-NIRMS goods not specified'
    )
  })

  it('BAC3: Invalid NIRMS value - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidNirmsModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Invalid entry for NIRMS/Non-NIRMS goods'
    )
  })

  it('BAC4: Null NIRMS value, more than 3 - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.nullNirmsMultipleModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  it('BAC5: Invalid NIRMS value, more than 3 - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.invalidNirmsMultipleModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  it('BAC6: Null CoO Value - validation errors', async () => {
    const result = await parserService.findParser(model.nullCooModel, filename)
    expect(result.business_checks.failure_reasons).toContain(
      'Missing Country of Origin'
    )
  })

  it('BAC7: Invalid CoO Value - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidCooModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Invalid Country of Origin ISO Code'
    )
  })

  it('BAC8: Null CoO Value, more than 3 - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.nullCooMultipleModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  it('BAC9: Invalid CoO Value, more than 3 - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.invalidCooMultipleModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  it('BAC10: CoO Value is X or x - passes validation', async () => {
    const result = await parserService.findParser(
      model.cooPlaceholderXModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toBeNull()
  })

  it('BAC11: Item Present on Prohibited Item List (Treatment Type specified) - validation errors', async () => {
    const result = await parserService.findParser(
      model.prohibitedItemsWithTreatmentModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Prohibited item identified on the packing list'
    )
  })

  it('BAC12: Item Present on Prohibited Item List, more than 3 (Treatment Type specified) - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.prohibitedItemsMultipleWithTreatmentModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  it('BAC13: Item Present on Prohibited Item List (no Treatment Type specified) - validation errors', async () => {
    const result = await parserService.findParser(
      model.prohibitedItemsNoTreatmentModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Prohibited item identified on the packing list'
    )
  })

  it('BAC14: Item Present on Prohibited Item List, more than 3 (no Treatment Type specified) - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.prohibitedItemsMultipleNoTreatmentModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  it('Valid CoO Validation: Complete packing list with all fields valid', async () => {
    const result = await parserService.findParser(model.validCooModel, filename)
    expect(result.business_checks.failure_reasons).toBeNull()
    expect(result.items.every((item) => item.country_of_origin)).toBe(true)
    expect(result.items.every((item) => item.commodity_code)).toBe(true)
    expect(result.items.every((item) => item.nirms)).toBe(true)
    expect(result.items.every((item) => item.nature_of_products)).toBe(true)
    expect(result.items.every((item) => item.type_of_treatment)).toBe(true)
  })
})
