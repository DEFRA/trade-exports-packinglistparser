import { describe, test, expect, vi } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/fowlerwelch/model2.js'
import parserModel from '../../../src/services/parser-model.js'
import testResults from '../../test-data-and-results/results/fowlerwelch/model2.js'

const filename = 'packinglist.xlsx'

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

describe('matchesFowlerwelchModel2', () => {
  test('matches valid Fowlerwelch Model 2 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(model.validModel, filename)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  test('matches valid Fowlerwelch Model 2 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.findParser(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(testResults.invalidTestResult_MissingCells)
  })

  test("returns 'No Match' for incorrect file extension", async () => {
    const filename = 'packinglist.wrong'
    const invalidTestResult_NoMatch = {
      business_checks: {
        all_required_fields_present: false,
        failure_reasons: null
      },
      items: [],
      registration_approval_number: null,
      parserModel: parserModel.NOMATCH
    }

    const result = await parserService.findParser(model.validModel, filename)

    expect(result).toMatchObject(invalidTestResult_NoMatch)
  })

  test('matches valid Fowlerwelch Model 2 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parserService.findParser(model.multipleRms, filename)

    expect(result).toMatchObject(testResults.multipleRms)
  })

  test('matches valid Fowlerwelch Model 2 file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
    const result = await parserService.findParser(model.missingKgunit, filename)

    expect(result).toMatchObject(testResults.missingKgunit)
  })
})

describe('Fowlerwelch 2 CoO Validation Tests', () => {
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
    expect(result.business_checks.failure_reasons).toContain('in addition to')
  })

  test('BAC5: Invalid NIRMS value, more than 3 - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.invalidNirmsMultipleModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain('in addition to')
  })

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
    expect(result.business_checks.failure_reasons).toContain('in addition to')
  })

  test('BAC9: Invalid CoO Value, more than 3 - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.invalidCooMultipleModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain('in addition to')
  })

  test('BAC10: CoO Value is X or x - passes validation', async () => {
    const result = await parserService.findParser(model.xCoO, filename)
    expect(result.business_checks.failure_reasons).toBeNull()
  })

  test('BAC11: Item Present on Ineligible Item List (Treatment Type specified) - validation errors', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsWithTreatment,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Prohibited item identified on the packing list'
    )
  })

  test('BAC12: Item Present on Ineligible Item List, more than 3 (Treatment Type specified) - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsMultipleWithTreatment,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain('in addition to')
  })

  test('BAC13: Item Present on Ineligible Item List (no Treatment Type specified) - validation errors', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsNoTreatment,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Prohibited item identified on the packing list'
    )
  })

  test('BAC14: Item Present on Ineligible Item List, more than 3 (no Treatment Type specified) - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsMultipleNoTreatment,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain('in addition to')
  })

  test('Valid CoO Validation: Complete packing list with all fields valid', async () => {
    const result = await parserService.findParser(model.validCooModel, filename)
    expect(result.business_checks.failure_reasons).toBeNull()
    expect(result.items.every((item) => item.country_of_origin)).toBe(true)
    expect(result.items.every((item) => item.commodity_code)).toBe(true)
    expect(result.items.every((item) => item.nirms)).toBe(true)
  })
})
