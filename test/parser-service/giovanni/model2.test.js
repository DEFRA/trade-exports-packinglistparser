/**
 * Parser Service Integration Tests - Giovanni Model 2
 *
 * Tests the complete parsing workflow including:
 * - Parser discovery and selection
 * - Data extraction and validation
 * - NIRMS/Non-NIRMS handling
 * - Ineligible items detection
 * - Error handling and validation
 */
import { describe, test, expect, vi } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/giovanni/model2.js'
import test_results from '../../test-data-and-results/results/giovanni/model2.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

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

// Mock ineligible items
vi.mock('../../../src/services/data/data-ineligible-items.json', () => ({
  default: [
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO',
      commodity_code: '012',
      type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT'
    }
  ]
}))

const filename = 'packinglist-giovanni-model2.xlsx'

describe('Parser Service - Giovanni Model 2', () => {
  describe('Valid packing lists', () => {
    test('matches valid Giovanni Model 2 file, calls parser and returns all_required_fields_present as true', async () => {
      const result = await parserService.parsePackingList(
        model.validModel,
        filename
      )
      expect(result).toMatchObject(test_results.validTestResult)
    })

    test('parses multiple sheets correctly', async () => {
      const result = await parserService.parsePackingList(
        model.validModelMultipleSheets,
        filename
      )
      expect(result).toMatchObject(
        test_results.validTestResultForMultipleSheets
      )
    })
  })

  describe('Invalid packing lists', () => {
    test('matches valid Giovanni Model 2 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
      const result = await parserService.parsePackingList(
        model.invalidModel_MissingColumnCells,
        filename
      )
      expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
    })

    test('matches valid Giovanni Model 2 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
      const result = await parserService.parsePackingList(
        model.multipleRms,
        filename
      )
      expect(result).toMatchObject(test_results.multipleRms)
    })

    test('matches valid Giovanni Model 2 file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
      const result = await parserService.parsePackingList(
        model.missingKgunit,
        filename
      )
      expect(result).toMatchObject(test_results.missingKgunit)
    })
  })

  test(`returns 'No Match' for incorrect file extension`, async () => {
    const result = await parserService.parsePackingList(
      model.validModel,
      INVALID_FILENAME
    )
    expect(result).toMatchObject(NO_MATCH_RESULT)
  })
})
