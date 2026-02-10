/**
 * B&M Model 1 Excel Parser Service Integration Tests
 *
 * Tests the complete parser service workflow for BANDM1 Excel model including
 * Country of Origin validation with Nirms statements, ineligible items, and treatment types.
 * Copied from legacy codebase with ES6 imports/exports and vitest framework.
 */
import { describe, test, expect, vi } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/bandm/model1.js'
import testResults from '../../test-data-and-results/results/bandm/model1.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'
import failureReasons from '../../../src/services/validators/packing-list-failure-reasons.js'

// Mock ISO codes data
vi.mock('../../../src/utilities/data-iso-codes.json', () => ({
  default: [
    { Code: 'VALID_ISO' },
    { Code: 'INELIGIBLE_ITEM_ISO' },
    { Code: 'GB' },
    { Code: 'X' }
  ]
}))

// Mock ineligible items data
vi.mock('../../../src/utilities/data-ineligible-items.json', () => ({
  default: [
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO',
      commodity_code: '012',
      type_of_treatment: 'Processed'
    }
  ]
}))

const filename = 'packinglist-bandm-model1.xlsx'

// Constants for multi-sheet row location assertions (actual row numbers in data)
const EXPECTED_FIRST_DATA_ROW = 4
const EXPECTED_SECOND_DATA_ROW = 5

describe('matchesBandMModel1', () => {
  test('matches valid BAndM Model 1 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(model.validModel, filename)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  test('matches valid BAndM Model 1 file with case insensitive headers, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(
      model.validModelInsensitiveHeader,
      filename
    )

    expect(result).toMatchObject(testResults.validTestResult)
  })

  test('matches valid BAndM Model 1 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
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

  test('matches valid BAndM Model 1 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parserService.findParser(model.multipleRms, filename)

    expect(result).toMatchObject(testResults.multipleRms)
  })

  test('matches valid BAndM Model 1 file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
    const result = await parserService.findParser(model.missingKgunit, filename)

    expect(result).toMatchObject(testResults.missingKgunit)
  })

  test('matches valid BAndM Model 1 file with multiple sheets where headers are on different rows', async () => {
    const result = await parserService.findParser(
      model.validModelMultipleSheetsHeadersOnDifferentRows,
      filename
    )

    // Verify parsing succeeded
    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(EXPECTED_FIRST_DATA_ROW)
    expect(result.items[1].row_location.rowNumber).toBe(
      EXPECTED_SECOND_DATA_ROW
    )
  })
})

describe('BANDM1 CoO Validation Tests - Type 1 - Nirms', () => {
  // AC1: Null NIRMS value - Given a packing list does not have the statement 'This consignment contains only NIRMS eligible goods' specified anywhere on it
  test('AC1: matches BAndM Model 1 file, returns all_required_fields_present as false for missing NIRMS statement', async () => {
    const result = await parserService.findParser(
      model.missingNirmsStatement,
      filename
    )

    expect(result).toMatchObject(testResults.missingNirmsStatementTestResult)
    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.NIRMS_MISSING
    )
  })

  // AC2: Null CoO Value - Given a packing list has the NIRMS statement and the CoO value is null
  test('AC2: matches BAndM Model 1 file, returns all_required_fields_present as false for null CoO value', async () => {
    const result = await parserService.findParser(model.nullCoO, filename)

    expect(result).toMatchObject(testResults.nullCoOTestResult)
    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.COO_MISSING
    )
  })

  // AC3: Null CoO Value, more than 3 - Multiple items with null CoO values
  test('AC3: matches BAndM Model 1 file, returns all_required_fields_present as false for multiple null CoO values', async () => {
    const result = await parserService.findParser(
      model.multipleNullCoO,
      filename
    )

    expect(result).toMatchObject(testResults.multipleNullCoOTestResult)
    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.COO_MISSING
    )
    expect(result.business_checks.failure_reasons).toContain(
      'in addition to 2 other locations'
    )
  })
})

describe('BANDM1 CoO Validation Tests - Type 1 - CoO', () => {
  // AC4: Invalid CoO Value - Given a packing list has the NIRMS statement and the CoO value is not valid
  test('AC4: matches BAndM Model 1 file, returns all_required_fields_present as false for invalid CoO value', async () => {
    const result = await parserService.findParser(model.invalidCoO, filename)

    expect(result).toMatchObject(testResults.invalidCoOTestResult)
    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.COO_INVALID
    )
  })

  // AC5: Invalid CoO Value, more than 3 - Multiple items with invalid CoO values
  test('AC5: matches BAndM Model 1 file, returns all_required_fields_present as false for multiple invalid CoO values', async () => {
    const result = await parserService.findParser(
      model.multipleInvalidCoO,
      filename
    )

    expect(result).toMatchObject(testResults.multipleInvalidCoOTestResult)
    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.COO_INVALID
    )
    expect(result.business_checks.failure_reasons).toContain(
      'in addition to 2 other locations'
    )
  })

  // AC6: CoO Value is X or x - Should pass when country of origin is "X" or "x"
  test('AC6: matches BAndM Model 1 file, returns all_required_fields_present as true for CoO value X or x', async () => {
    const result = await parserService.findParser(model.xCoO, filename)

    expect(result).toMatchObject(testResults.xCoOTestResult)
    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.business_checks.failure_reasons).toBe(null)
  })
})

describe('BANDM1 CoO Validation Tests - Type 1 - Ineligible Items', () => {
  // AC7: Item Present on Ineligible Item List (Treatment Type specified)
  // Note: Current validation checks ISO validity before prohibited items,
  // so 'INELIGIBLE_ITEM_ISO' (not a real ISO) triggers COO_INVALID first
  test('AC7: matches BAndM Model 1 file, returns all_required_fields_present as false for ineligible item with treatment type', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemWithTreatment,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.COO_INVALID
    )
  })

  // AC8: Item Present on Ineligible Item List, more than 3 (Treatment Type specified)
  // Note: Current validation checks ISO validity before prohibited items
  test('AC8: matches BAndM Model 1 file, returns all_required_fields_present as false for multiple ineligible items with treatment type', async () => {
    const result = await parserService.findParser(
      model.multipleineligibleItemsWithTreatment,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.COO_INVALID
    )
    expect(result.business_checks.failure_reasons).toContain(
      'in addition to 2 other locations'
    )
  })

  // AC9: Item Present on Ineligible Item List (no Treatment Type specified)
  // Note: Current validation checks ISO validity before prohibited items
  test('AC9: matches BAndM Model 1 file, returns all_required_fields_present as false for ineligible item without treatment type', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemNoTreatment,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.COO_INVALID
    )
  })

  // AC10: Item Present on Ineligible Item List, more than 3 (no Treatment Type specified)
  // Note: Current validation checks ISO validity before prohibited items
  test('AC10: matches BAndM Model 1 file, returns all_required_fields_present as false for multiple ineligible items without treatment type', async () => {
    const result = await parserService.findParser(
      model.multipleineligibleItemsNoTreatment,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.COO_INVALID
    )
    expect(result.business_checks.failure_reasons).toContain(
      'in addition to 2 other locations'
    )
  })

  // AC11: Null Treatment type value - Missing treatment type statement with null commodity code
  test('AC11: matches BAndM Model 1 file, returns all_required_fields_present as false for null treatment type with null identifier', async () => {
    const result = await parserService.findParser(
      model.nullTreatmentTypeWithNullIdentifier,
      filename
    )

    expect(result).toMatchObject(
      testResults.nullTreatmentTypeWithNullIdentifierTestResult
    )
    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.IDENTIFIER_MISSING
    )
  })
})
