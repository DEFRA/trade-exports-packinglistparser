/**
 * Giovanni Model 3 Parser Service Integration Tests
 */

import { describe, test, expect, vi, afterEach } from 'vitest'
import { findParser } from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models-pdf/giovanni/model3.js'
import parserModel from '../../../src/services/parser-model.js'
import test_results from '../../test-data-and-results/results-pdf/giovanni/model3.js'
import * as pdfHelper from '../../../src/utilities/pdf-helper.js'

const filename = 'test.pdf'

// Mock the pdf-helper module - partial mock to keep real functions
vi.mock('../../../src/utilities/pdf-helper.js', async () => {
  const actual = await vi.importActual('../../../src/utilities/pdf-helper.js')
  return {
    ...actual,
    extractPdf: vi.fn(),
    extractEstablishmentNumbers: vi.fn(() => ['RMS-GB-000149-002'])
  }
})

describe('findParser - Giovanni Model 3', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set default mock for extractEstablishmentNumbers (single RMS)
    vi.mocked(pdfHelper.extractEstablishmentNumbers).mockReturnValue([
      'RMS-GB-000149-002'
    ])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('matches valid Giovanni Model 3 file, calls parser and returns all_required_fields_present as true', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.validModel)
    const result = await findParser({}, filename)
    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('matches valid Giovanni Model 3 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(
      model.invalidModel_MissingColumnCells
    )
    const result = await findParser({}, filename)
    expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
  })

  test('parses model multiple RMS', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.multipleRms)
    vi.mocked(pdfHelper.extractEstablishmentNumbers).mockReturnValue([
      'RMS-GB-000149-002',
      'RMS-GB-000149-003'
    ])
    const result = await findParser({}, filename)
    expect(result).toMatchObject(test_results.multipleRmsTestResult)
  })

  test('parses model missing unit of weight', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.missingKgunit)
    const result = await findParser({}, filename)
    expect(result).toMatchObject(test_results.missingKgTestResult)
  })

  test("returns 'No Match' for incorrect file extension", async () => {
    const wrongFilename = 'packinglist.wrong'
    const invalidTestResult_NoMatch = {
      business_checks: {
        all_required_fields_present: false,
        failure_reasons: null
      },
      items: [],
      registration_approval_number: null,
      parserModel: parserModel.NOMATCH
    }

    const result = await findParser({}, wrongFilename)
    expect(result).toMatchObject(invalidTestResult_NoMatch)
  })
})
