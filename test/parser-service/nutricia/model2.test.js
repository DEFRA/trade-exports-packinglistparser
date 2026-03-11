import { describe, test, expect } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/nutricia/model2.js'
import ParserModel from '../../../src/services/parser-model.js'
import test_results from '../../test-data-and-results/results/nutricia/model2.js'
import failureReasons from '../../../src/services/validators/packing-list-failure-reasons.js'

const filename = 'packinglist-nutricia-model2.xlsx'

describe('matchesNutriciaModel2', () => {
  test('matches valid Nutricia Model 2 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.parsePackingList(
      model.modelWithNoUnitInHeader,
      filename
    )

    expect(result).toMatchObject(test_results.invalidTestResultWithNoHeader)
  })

  test('matches valid Nutricia Model 2 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.parsePackingList(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
  })

  test('returns No Match for incorrect file extension', async () => {
    const filename = 'packinglist.wrong'
    const invalidTestResult_NoMatch = {
      business_checks: {
        all_required_fields_present: false,
        failure_reasons: null
      },
      items: [],
      registration_approval_number: null,
      parserModel: ParserModel.NOMATCH
    }

    const result = await parserService.parsePackingList(
      model.validModel,
      filename
    )

    expect(result).toMatchObject(invalidTestResult_NoMatch)
  })

  test('matches valid Nutricia Model 2 file', async () => {
    const result = await parserService.parsePackingList(
      model.matchModel,
      filename
    )

    expect(result.parserModel).toBe(ParserModel.NUTRICIA2)
  })

  test('return check rms establishment number', async () => {
    const result = await parserService.parsePackingList(
      model.hasSupplierButNotRms,
      filename
    )

    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.MISSING_REMOS
    )
    expect(result.parserModel).toBe(ParserModel.NOREMOS)
  })

  test('return no match when contains rms number but not supplier', async () => {
    const result = await parserService.parsePackingList(
      model.hasRmsButNotSupplier,
      filename
    )

    expect(result.parserModel).toBe(ParserModel.NOMATCH)
  })

  test('returns multiple rms numbers failure reason', async () => {
    const result = await parserService.parsePackingList(
      model.multipleRms,
      filename
    )

    expect(result.business_checks.failure_reasons).toBe(
      failureReasons.MULTIPLE_RMS
    )
  })
  test('matches valid Nutricia Model 2 file with multiple sheets where headers are on different rows, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.parsePackingList(
      model.validModelMultipleSheetsHeadersOnDifferentRows,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(3)
    expect(result.items[1].row_location.rowNumber).toBe(4)
  })
})
