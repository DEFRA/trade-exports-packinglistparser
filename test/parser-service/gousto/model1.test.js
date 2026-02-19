import { describe, it, expect, vi } from 'vitest'
import { findParser } from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/gousto/model1.js'
import test_results from '../../test-data-and-results/results/gousto/model1.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

// Mock ISO codes - use generic codes for testing
vi.mock('../../../src/services/data/data-iso-codes.json', () => ({
  default: ['VALID_ISO', 'INELIGIBLE_ITEM_ISO', 'GB', 'X']
}))

// Mock ineligible items - use generic test data
vi.mock('../../../src/services/data/data-ineligible-items.json', () => ({
  default: [
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO',
      commodity_code: '0201',
      type_of_treatment: null
    }
  ]
}))

const filename = 'packinglist-gousto-model1.xlsx'

describe('matchesGoustoModel1', () => {
  it('matches valid Gousto Model 1 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await findParser(model.validModel, filename)

    expect(result).toMatchObject(test_results.validTestResult)
  })

  it('matches valid Gousto Model 1 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await findParser(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
  })

  it('returns "No Match" for incorrect file extension', async () => {
    const result = await findParser(model.validModel, INVALID_FILENAME)

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })

  it('matches valid Gousto Model 1 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await findParser(model.multipleRms, filename)

    expect(result).toMatchObject(test_results.multipleRms)
  })
})

// CoO Validation Tests
describe('GOUSTO1 CoO Validation Tests', () => {
  it('Missing dynamic blanket statement - validation fails', async () => {
    const result = await findParser(model.missingBlanketStatement, filename)

    expect(result.business_checks.failure_reasons).toContain(
      'NIRMS/Non-NIRMS goods not specified'
    )
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  it('Missing CoO values with blanket statement - validation errors', async () => {
    const result = await findParser(model.missingCooValues, filename)

    expect(result.business_checks.failure_reasons).toContain(
      'Missing Country of Origin'
    )
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  it('Invalid CoO format - validation errors', async () => {
    const result = await findParser(model.invalidCooFormat, filename)

    expect(result.business_checks.failure_reasons).toContain(
      'Invalid Country of Origin ISO Code'
    )
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  it('Multiple CoO errors aggregation - shows first 3 and "in addition to" message', async () => {
    const result = await findParser(model.multipleCooErrors, filename)

    expect(result.business_checks.failure_reasons).toContain('in addition to')
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  it('Valid packing list with dynamic blanket statement passes validation', async () => {
    const result = await findParser(model.validCooModel, filename)

    expect(result.business_checks.failure_reasons).toBeNull()
    expect(result.business_checks.all_required_fields_present).toBe(true)
  })

  it('CoO placeholder X/x values pass validation', async () => {
    const result = await findParser(model.cooPlaceholderX, filename)

    expect(result.business_checks.failure_reasons).toBeNull()
    expect(result.business_checks.all_required_fields_present).toBe(true)
  })

  it('Dynamic blanket statement sets all items to NIRMS', async () => {
    const result = await findParser(model.validCooModel, filename)

    expect(result.items.every((item) => item.nirms === 'NIRMS')).toBe(true)
  })

  it('Prohibited items validation with treatment type', async () => {
    const result = await findParser(
      model.prohibitedItemsWithTreatment,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(
      'Prohibited item identified on the packing list'
    )
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  it('Multiple prohibited items aggregation - shows first 3 and "in addition to" message', async () => {
    const result = await findParser(model.prohibitedItemsMultiple, filename)

    expect(result.business_checks.failure_reasons).toContain(
      'Prohibited item identified on the packing list'
    )
    expect(result.business_checks.failure_reasons).toContain('in addition to')
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  it('Prohibited items validation without treatment type', async () => {
    const result = await findParser(
      model.prohibitedItemsWithoutTreatment,
      filename
    )

    expect(result.business_checks.failure_reasons).toContain(
      'Prohibited item identified on the packing list'
    )
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })
})
