import { describe, test, expect, vi } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import parserModel from '../../../src/services/parser-model.js'
import model from '../../test-data-and-results/models/bartonredman/model1.js'
import testResults from '../../test-data-and-results/results/bartonredman/model1.js'
import failureReasons from '../../../src/services/validators/packing-list-failure-reasons.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

const BARTONREDMAN_FILENAME = 'packinglist-bartonredman-model1.xlsx'

vi.mock('../../../src/services/data/data-iso-codes.json', () => ({
  default: ['GB', 'VALID_ISO', 'INELIGIBLE_ITEM_ISO', 'X']
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

describe('Parser Service - Barton and Redman Model 1', () => {
  test('matches valid Barton and Redman Model 1 file and returns all_required_fields_present as true', async () => {
    const result = await parserService.parsePackingList(
      model.validModel,
      BARTONREDMAN_FILENAME
    )

    expect(result).toMatchObject(testResults.validTestResult)
    expect(result.parserModel).toBe(parserModel.BARTONREDMAN1)
  })

  test('matches valid Barton and Redman Model 1 file with multiple sheets where headers are on different rows', async () => {
    const result = await parserService.parsePackingList(
      model.validModelMultipleSheetsHeadersOnDifferentRows,
      BARTONREDMAN_FILENAME
    )

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(2)
    expect(result.items[1].row_location.rowNumber).toBe(3)
  })

  test('ignores invalid sheets and still discovers/parses Barton and Redman Model 1', async () => {
    const packingListWithInvalidSheets = {
      References: [{ A: 'reference data' }],
      Lookups: [{ A: 'lookup data' }],
      'Input Packing Sheet': model.validModel['Input Packing Sheet']
    }

    const result = await parserService.parsePackingList(
      packingListWithInvalidSheets,
      BARTONREDMAN_FILENAME
    )

    expect(result.parserModel).toBe(parserModel.BARTONREDMAN1)
    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items).toHaveLength(2)
    expect(
      result.items.every(
        (item) => item.row_location.sheetName === 'Input Packing Sheet'
      )
    ).toBe(true)
  })

  test('returns all_required_fields_present as false when required cells are missing', async () => {
    const result = await parserService.parsePackingList(
      model.invalidModel_MissingColumnCells,
      BARTONREDMAN_FILENAME
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test("returns 'No Match' for incorrect file extension", async () => {
    const result = await parserService.parsePackingList(
      model.validModel,
      INVALID_FILENAME
    )

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })
})

describe('BARTONREDMAN1 CoO Validation Tests - Type 1 - Nirms', () => {
  test('RED lane (non-NIRMS) passes validation without CoO', async () => {
    const result = await parserService.parsePackingList(
      model.nonNirms,
      BARTONREDMAN_FILENAME
    )

    expect(result.business_checks.all_required_fields_present).toBeTruthy()
  })

  test('Invalid NIRMS value returns validation error', async () => {
    const result = await parserService.parsePackingList(
      model.invalidNirms,
      BARTONREDMAN_FILENAME
    )

    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.NIRMS_INVALID
    )
  })

  test('Null NIRMS value returns validation error', async () => {
    const result = await parserService.parsePackingList(
      model.missingNirms,
      BARTONREDMAN_FILENAME
    )

    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.NIRMS_MISSING
    )
  })
})

describe('BARTONREDMAN1 CoO Validation Tests - Type 1 - CoO', () => {
  test('GREEN lane with missing CoO returns validation error', async () => {
    const result = await parserService.parsePackingList(
      model.missingCoO,
      BARTONREDMAN_FILENAME
    )

    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.COO_MISSING
    )
  })

  test('GREEN lane with invalid CoO returns validation error', async () => {
    const result = await parserService.parsePackingList(
      model.invalidCoO,
      BARTONREDMAN_FILENAME
    )

    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.COO_INVALID
    )
  })

  test('GREEN lane with CoO value X passes validation', async () => {
    const result = await parserService.parsePackingList(
      model.xCoO,
      BARTONREDMAN_FILENAME
    )

    expect(result.business_checks.all_required_fields_present).toBeTruthy()
  })
})

describe('BARTONREDMAN1 CoO Validation Tests - Type 1 - Ineligible Items', () => {
  test('Ineligible items detected returns validation error', async () => {
    const result = await parserService.parsePackingList(
      model.ineligibleItems,
      BARTONREDMAN_FILENAME
    )

    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.PROHIBITED_ITEM
    )
  })
})
