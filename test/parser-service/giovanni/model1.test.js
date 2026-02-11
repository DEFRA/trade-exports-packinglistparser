/**
 * Parser Service Integration Tests - Giovanni Model 1
 *
 * Tests the complete parsing workflow including:
 * - Parser discovery and selection
 * - Data extraction and validation
 * - Country of Origin (CoO) validation with dynamic blanket statement
 * - NIRMS/Non-NIRMS handling
 * - Ineligible items detection
 * - Error handling and validation
 */
import { describe, test, expect, vi } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/giovanni/model1.js'
import test_results from '../../test-data-and-results/results/giovanni/model1.js'
import {
  INVALID_FILENAME,
  NO_MATCH_RESULT,
  ERROR_SUMMARY_TEXT
} from '../../test-constants.js'

// Mock ISO codes - must include all codes used in test data
vi.mock('../../../src/services/data/data-iso-codes.json', () => ({
  default: [
    'VALID_ISO',
    'INELIGIBLE_ITEM_ISO',
    'GB',
    'CN',
    'IT',
    'DE',
    'FR',
    'ES',
    'US'
  ]
}))

// Mock ineligible items - copy EXACTLY from legacy test
vi.mock('../../../src/services/data/data-ineligible-items.json', () => ({
  default: [
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO',
      commodity_code: '012',
      type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT'
    }
  ]
}))

const filename = 'packinglist-giovanni-model1.xlsx'

describe('Parser Service - Giovanni Model 1', () => {
  describe('Valid packing lists', () => {
    test('matches valid Giovanni Model 1 file, calls parser and returns all_required_fields_present as true', async () => {
      const result = await parserService.findParser(model.validModel, filename)
      expect(result).toMatchObject(test_results.validTestResult)
    })

    test('matches valid Giovanni Model 1 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
      const result = await parserService.findParser(
        model.invalidModel_MissingColumnCells,
        filename
      )
      expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
    })

    test('matches valid Giovanni Model 1 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
      const result = await parserService.findParser(model.multipleRms, filename)
      expect(result).toMatchObject(test_results.multipleRms)
    })

    test('matches valid Giovanni Model 1 file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
      const result = await parserService.findParser(
        model.missingKgunit,
        filename
      )
      expect(result).toMatchObject(test_results.missingKgunit)
    })
  })

  test(`returns 'No Match' for incorrect file extension`, async () => {
    const result = await parserService.findParser(
      model.validModel,
      INVALID_FILENAME
    )
    expect(result).toMatchObject(NO_MATCH_RESULT)
  })
})

// CoO Validation Tests - AB#591527
describe('GIOVANNI1 CoO Validation Tests - Type 4', () => {
  test('BAC1: Missing dynamic blanket statement - validation fails', async () => {
    const result = await parserService.findParser(
      model.missingBlanketStatement,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'NIRMS/Non-NIRMS goods not specified'
    )
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('BAC2: Missing CoO values with blanket statement - validation errors', async () => {
    const result = await parserService.findParser(
      model.missingCooValues,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Missing Country of Origin'
    )
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('BAC3: Invalid CoO format - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidCooFormat,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Invalid Country of Origin ISO Code'
    )
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test(`BAC4-5: Multiple CoO errors aggregation - shows first 3 and "${ERROR_SUMMARY_TEXT}" message`, async () => {
    const result = await parserService.findParser(
      model.multipleCooErrors,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('BAC6: Valid packing list with dynamic blanket statement passes validation', async () => {
    const result = await parserService.findParser(model.validCooModel, filename)
    expect(result.business_checks.failure_reasons).toBeNull()
    expect(result.business_checks.all_required_fields_present).toBe(true)
  })

  test('BAC6: CoO placeholder X/x values pass validation', async () => {
    const result = await parserService.findParser(
      model.cooPlaceholderX,
      filename
    )
    expect(result.business_checks.failure_reasons).toBeNull()
    expect(result.business_checks.all_required_fields_present).toBe(true)
  })

  test('Dynamic blanket statement sets all items to NIRMS', async () => {
    const result = await parserService.findParser(model.validCooModel, filename)
    expect(result.items.every((item) => item.nirms === 'NIRMS')).toBe(true)
  })

  test('BAC7: ineligible items validation with treatment type', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsWithTreatment,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Prohibited item identified on the packing list'
    )
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test(`BAC8,10: Multiple ineligible items aggregation - shows first 3 and "${ERROR_SUMMARY_TEXT}" message`, async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsMultiple,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Prohibited item identified on the packing list'
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('BAC9: ineligible items validation without treatment type', async () => {
    const result = await parserService.findParser(
      model.ineligibleItems,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Prohibited item identified on the packing list'
    )
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })
})
