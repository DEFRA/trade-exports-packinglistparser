import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { findParser } from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models-pdf/mands/model1.js'
import parserModel from '../../../src/services/parser-model.js'
import test_results from '../../test-data-and-results/results-pdf/mands/model1.js'
import failureReasonsDescriptions from '../../../src/services/validators/packing-list-failure-reasons.js'
import * as pdfHelper from '../../../src/utilities/pdf-helper.js'

const filename = 'mands-model1.pdf'

vi.mock('../../../src/utilities/pdf-helper.js', async () => {
  const actual = await vi.importActual('../../../src/utilities/pdf-helper.js')
  return {
    ...actual,
    extractPdf: vi.fn()
  }
})

vi.mock('../../../src/services/data/data-iso-codes.json', () => ({
  default: ['VALID_ISO', 'INELIGIBLE_ITEM_ISO']
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

describe('findParser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('matches valid MandS Model 1 file, calls parser and returns all_required_fields_present as true', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.validModel)

    const result = await findParser({}, filename)
    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('matches valid MandS Model 1 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(
      model.invalidModel_MissingColumnCells
    )

    const result = await findParser({}, filename)

    expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
  })

  test('wrong file extension', async () => {
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

    const result = await findParser(model.validModel, filename)

    expect(result).toMatchObject(invalidTestResult_NoMatch)
  })

  test('matches valid MandS Model 1 file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.missingKgunit)

    const result = await findParser({}, filename)
    expect(result.business_checks.failure_reasons).toBe(
      'Net Weight Unit of Measure (kg) not found.\n'
    )
  })

  test('matches valid MandS Model 1 file, calls parser and returns all_required_fields_present as false for invalid NIRMS', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.invalidNirms)

    const result = await findParser({}, filename)

    expect(result.business_checks.failure_reasons).toBe(
      failureReasonsDescriptions.NIRMS_INVALID + ' in page 1 row 1.\n'
    )
  })

  test('matches valid MandS Model 1 file, calls parser and returns all_required_fields_present as true for valid NIRMS', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.nonNirms)

    const result = await findParser({}, filename)

    expect(result.business_checks.all_required_fields_present).toBeTruthy()
  })

  test('matches valid MandS Model 1 file, calls parser and returns all_required_fields_present as false for missing NIRMS', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.missingNirms)

    const result = await findParser({}, filename)

    expect(result.business_checks.failure_reasons).toBe(
      failureReasonsDescriptions.NIRMS_MISSING + ' in page 1 row 1.\n'
    )
  })

  test('matches valid MandS Model 1 file, calls parser and returns all_required_fields_present as false for missing CoO', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.missingCoO)

    const result = await findParser({}, filename)

    expect(result.business_checks.failure_reasons).toBe(
      failureReasonsDescriptions.COO_MISSING +
        ' in page 1 row 1, page 1 row 2, page 1 row 3 in addition to 2 other locations.\n'
    )
  })

  test('matches valid MandS Model 1 file, calls parser and returns all_required_fields_present as false for invalid CoO', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.invalidCoO)

    const result = await findParser({}, filename)

    expect(result.business_checks.failure_reasons).toBe(
      failureReasonsDescriptions.COO_INVALID +
        ' in page 1 row 1, page 1 row 2, page 1 row 3 in addition to 2 other locations.\n'
    )
  })

  test('matches valid MandS Model 1 file, calls parser and returns all_required_fields_present as true for X CoO', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.xCoO)

    const result = await findParser({}, filename)

    expect(result.business_checks.all_required_fields_present).toBeTruthy()
  })

  test('matches valid MandS Model 1 file, calls parser and returns all_required_fields_present as false for ineligible items', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.ineligibleItems)

    const result = await findParser({}, filename)
    expect(result.business_checks.failure_reasons).toBe(
      failureReasonsDescriptions.PROHIBITED_ITEM +
        ' in page 1 row 1 and page 1 row 3.\n'
    )
  })
})
