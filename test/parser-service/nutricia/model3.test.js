import { vi, describe, test, expect } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/nutricia/model3.js'
import testResults from '../../test-data-and-results/results/nutricia/model3.js'
import {
  INVALID_FILENAME,
  NO_MATCH_RESULT,
  ERROR_SUMMARY_TEXT
} from '../../test-constants.js'

vi.mock('../../../src/services/data/data-iso-codes.json', () => ({
  default: ['GB', 'FR', 'IE', 'DE', 'ES', 'VALID_ISO', 'X']
}))

vi.mock('../../../src/services/data/data-ineligible-items.json', () => ({
  default: [
    {
      country_of_origin: 'FR',
      commodity_code: '21069098',
      type_of_treatment: 'Processed'
    }
  ]
}))

const filename = 'packinglist-nutricia-model3.xlsx'

describe('parsesNutriciaModel3', () => {
  test('matches valid Nutricia Model 3 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.parsePackingList(
      model.validModel,
      filename
    )

    expect(result).toMatchObject(testResults.validTestResult)
  })

  test('matches valid Nutricia Model 3 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.parsePackingList(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toContain(
      'No of packages is missing'
    )
  })

  test("returns 'No Match' for incorrect file extension", async () => {
    const result = await parserService.parsePackingList(
      model.validModel,
      INVALID_FILENAME
    )

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })

  test('matches valid Nutricia Model 3 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parserService.parsePackingList(
      model.multipleRms,
      filename
    )

    expect(result).toMatchObject(testResults.multipleRms)
  })

  test('matches valid Nutricia Model 3 file with multiple sheets where headers are on different rows', async () => {
    const result = await parserService.parsePackingList(
      model.validModelMultipleSheetsHeadersOnDifferentRows,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(6)
    expect(result.items[1].row_location.rowNumber).toBe(6)
  })
})

describe('Nutricia3 CoO Validation Tests', () => {
  test('returns validation error for missing NIRMS declaration', async () => {
    const result = await parserService.parsePackingList(
      model.missingNirms,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(
      'NIRMS/Non-NIRMS goods not specified'
    )
  })

  test('returns validation error summary for repeated invalid Country of Origin values', async () => {
    const result = await parserService.parsePackingList(
      model.invalidCooMultiple,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(
      'Invalid Country of Origin ISO Code'
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })
})
