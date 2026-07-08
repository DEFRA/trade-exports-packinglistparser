import { describe, test, expect, vi } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/manfreight/model1.js'
import test_results from '../../test-data-and-results/results/manfreight/model1.js'
import failureReasons from '../../../src/services/validators/packing-list-failure-reasons.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

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

const filename = 'packinglist-manfreight-model1.xlsx'

describe('matchesManfreightModel1', () => {
  test('matches valid Manfreight Model 1 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.parsePackingList(
      model.validModel,
      filename
    )

    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('matches valid Manfreight Model 1 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
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

  test('matches valid Manfreight Model 1 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parserService.parsePackingList(
      model.multipleRms,
      filename
    )

    expect(result).toMatchObject(test_results.multipleRms)
  })

  test('matches valid Manfreight Model 1 file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
    const result = await parserService.parsePackingList(
      model.missingKgunit,
      filename
    )

    expect(result).toMatchObject(test_results.missingKgunit)
  })
})

describe('Manfreight1 NIRMS Validation Tests', () => {
  test('BAC1: Non-NIRMS value - passes validation', async () => {
    const result = await parserService.parsePackingList(
      model.nonNirmsModel,
      filename
    )

    expect(result.business_checks.failure_reasons).toBeNull()
  })

  test('BAC2: Null NIRMS value - validation errors', async () => {
    const result = await parserService.parsePackingList(
      model.nullNirmsModel,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.NIRMS_MISSING
    )
  })

  test('BAC3: Invalid NIRMS value - validation errors', async () => {
    const result = await parserService.parsePackingList(
      model.invalidNirmsModel,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.NIRMS_INVALID
    )
  })
})
