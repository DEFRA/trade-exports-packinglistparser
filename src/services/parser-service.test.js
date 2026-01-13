import * as parserService from './parser-service.js'
import model from '../../test/test-data-and-results/models-csv/iceland/model2.js'
import parserModel from './parser-model.js'
import test_results from '../../test/test-data-and-results/results-csv/iceland/model2.js'

const filename = 'packinglist.csv'

describe('matchesIcelandModel2', () => {
  test('matches valid Iceland Model 2 CSV file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.findParser(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
  })

  test('returns "No Match" for incorrect file extension', async () => {
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
    const invalidTestResult_NoMatch = {
      business_checks: {
        all_required_fields_present: false,
        failure_reasons: 'Check GB Establishment RMS Number.'
      },
      items: [],
      registration_approval_number: null,
      parserModel: parserModel.NOREMOS
    }

    const result = await parserService.findParser(model.emptyModel, filename)

    expect(result).toMatchObject(invalidTestResult_NoMatch)
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
