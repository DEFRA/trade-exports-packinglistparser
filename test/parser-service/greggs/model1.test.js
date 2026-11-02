import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { parsePackingList } from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models-pdf/greggs/model1.js'
import test_results from '../../test-data-and-results/results-pdf/greggs/model1.js'
import failureReasonsDescriptions from '../../../src/services/validators/packing-list-failure-reasons.js'
import * as pdfHelper from '../../../src/utilities/pdf-helper.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

const filename = 'greggs-model1.pdf'

vi.mock('../../../src/utilities/pdf-helper.js', async () => {
  const actual = await vi.importActual('../../../src/utilities/pdf-helper.js')
  return {
    ...actual,
    extractPdf: vi.fn()
  }
})

vi.mock('../../../src/services/data/data-iso-codes.json', () => ({
  default: ['GB']
}))

vi.mock('../../../src/services/data/data-ineligible-items.json', () => ({
  default: []
}))

// Skipped while the GREGGS1 parser is deactivated in model-parsers.js
describe.skip('parsePackingList - Greggs Model 1', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('AC1/AC2 matches valid Greggs Model 1 landscape PDF and returns all_required_fields_present as true', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.validModel)

    const result = await parsePackingList({}, filename)

    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('AC3 returns all_required_fields_present as false when identified column cells are missing', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(
      model.invalidModel_MissingColumnCells
    )

    const result = await parsePackingList({}, filename)

    expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
    expect(result.business_checks.failure_reasons).toContain(
      failureReasonsDescriptions.PACKAGES_MISSING
    )
    expect(result.business_checks.failure_reasons).toContain(
      failureReasonsDescriptions.NET_WEIGHT_MISSING
    )
  })

  test('AC4/AC5 fails the packing list when ORDER QTY and TOTAL NET WEIGHT are not numerical', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(
      model.invalidModel_NonNumeric
    )

    const result = await parsePackingList({}, filename)

    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.business_checks.failure_reasons).toContain(
      failureReasonsDescriptions.PACKAGES_INVALID
    )
    expect(result.business_checks.failure_reasons).toContain(
      failureReasonsDescriptions.NET_WEIGHT_INVALID
    )
  })

  test('returns EMPTY_DATA failure when no data rows are present', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.emptyModel)

    const result = await parsePackingList({}, filename)

    expect(result).toMatchObject(test_results.emptyTestResult)
  })

  test('fails when the net weight unit (kg) is missing from the header', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.missingKgUnit)

    const result = await parsePackingList({}, filename)

    expect(result.business_checks.failure_reasons).toContain(
      failureReasonsDescriptions.NET_WEIGHT_UNIT_MISSING
    )
  })

  test('does not match when establishment number is wrong', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(
      model.invalidModel_WrongRemosNumber
    )

    const result = await parsePackingList({}, filename)

    expect(result.parserModel).not.toBe('GREGGS1')
  })

  test('does not match Greggs when headers are wrong', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(
      model.invalidModel_WrongHeaders
    )

    const result = await parsePackingList({}, filename)

    expect(result.parserModel).not.toBe('GREGGS1')
  })

  test('wrong file extension returns no match', async () => {
    const result = await parsePackingList(model.validModel, INVALID_FILENAME)

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })
})
