import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models-csv/iceland/model2.js'
import test_results from '../../test-data-and-results/results-csv/iceland/model2.js'
import {
  INVALID_FILENAME,
  NO_MATCH_RESULT,
  NO_REMOS_RESULT,
  ERROR_SUMMARY_TEXT
} from '../../test-constants.js'

const filename = 'packinglist.csv'

describe('matchesIcelandModel2', () => {
  test('matches valid Iceland Model 2 CSV file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(model.validModel, filename)

    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('matches valid Iceland Model 2 CSV file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.findParser(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
  })

  test('returns "No Match" for incorrect file extension', async () => {
    const result = await parserService.findParser(
      model.validModel,
      INVALID_FILENAME
    )

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })

  test('matches valid Iceland Model 2 CSV file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parserService.findParser(
      model.invalidModel_MultipleRms,
      filename
    )

    expect(result).toMatchObject(test_results.invalidTestResult_MultipleRms)
  })

  test('matches valid Iceland Model 2 CSV file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
    const result = await parserService.findParser(model.missingKgUnit, filename)

    expect(result).toMatchObject(test_results.invalidTestResult_MissingKgUnit)
  })

  test('returns "No Match" for empty model', async () => {
    const result = await parserService.findParser(model.emptyModel, filename)

    expect(result).toMatchObject(NO_REMOS_RESULT)
  })

  test('matches valid Iceland Model 2 CSV file, calls parser and returns all_required_fields_present as false for ineligible items with treatment', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsWithTreatmentModel,
      filename
    )

    expect(result).toMatchObject(
      test_results.ineligibleItemsWithTreatmentTestResult
    )
  })

  test('matches valid Iceland Model 2 CSV file, calls parser and returns all_required_fields_present as false for ineligible items without treatment', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsNoTreatmentModel,
      filename
    )

    expect(result).toMatchObject(
      test_results.ineligibleItemsNoTreatmentTestResult
    )
  })

  test('matches valid Iceland Model 2 CSV file, calls parser and returns all_required_fields_present as false for multiple ineligible items with treatment', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsMultipleWithTreatmentModel,
      filename
    )

    expect(result).toMatchObject(
      test_results.ineligibleItemsMultipleWithTreatmentTestResult
    )
  })

  test('matches valid Iceland Model 2 CSV file, calls parser and returns all_required_fields_present as false for multiple ineligible items without treatment', async () => {
    const result = await parserService.findParser(
      model.ineligibleItemsMultipleNoTreatmentModel,
      filename
    )

    expect(result).toMatchObject(
      test_results.ineligibleItemsMultipleNoTreatmentTestResult
    )
  })
})

describe('ICELAND2 CoO Validation Tests - Type 1 - Nirms', () => {
  test('NOT within NIRMS Scheme - passes validation', async () => {
    const result = await parserService.findParser(model.nonNirmsModel, filename)
    expect(result.business_checks.failure_reasons).toBeNull()
  })

  test('Null NIRMS value - validation errors', async () => {
    const result = await parserService.findParser(
      model.nullNirmsModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'NIRMS/Non-NIRMS goods not specified'
    )
  })

  test('Invalid NIRMS value - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidNirmsModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Invalid entry for NIRMS/Non-NIRMS goods'
    )
  })

  test('Null NIRMS value, more than 3 - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.nullNirmsMultipleModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  test('Invalid NIRMS value, more than 3 - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.invalidNirmsMultipleModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })
})

describe('ICELAND2 CoO Validation Tests - Type 1 - CoO', () => {
  test('Null CoO Value - validation errors', async () => {
    const result = await parserService.findParser(model.nullCooModel, filename)
    expect(result.business_checks.failure_reasons).toContain(
      'Missing Country of Origin'
    )
  })

  test('Invalid CoO Value - validation errors', async () => {
    const result = await parserService.findParser(
      model.invalidCooModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(
      'Invalid Country of Origin ISO Code'
    )
  })

  test('Null CoO Value, more than 3 - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.nullCooMultipleModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  test('Invalid CoO Value, more than 3 - validation errors with summary', async () => {
    const result = await parserService.findParser(
      model.invalidCooMultipleModel,
      filename
    )
    expect(result.business_checks.failure_reasons).toContain(ERROR_SUMMARY_TEXT)
  })

  test('CoO Value is X or x - passes validation', async () => {
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
