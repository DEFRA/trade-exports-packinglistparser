/**
 * Giovanni Model 3 Parser Service Integration Tests
 */

import { describe, test, expect, vi, afterEach } from 'vitest'
import { findParser } from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models-pdf/giovanni/model3.js'
import test_results from '../../test-data-and-results/results-pdf/giovanni/model3.js'
import * as pdfHelper from '../../../src/utilities/pdf-helper.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

const filename = 'test.pdf'

// Expected RMS establishment number for tests
const EXPECTED_RMS_NUMBER = 'RMS-GB-000149-002'

// Mock the pdf-helper module - partial mock to keep real functions
vi.mock('../../../src/utilities/pdf-helper.js', async () => {
  const actual = await vi.importActual('../../../src/utilities/pdf-helper.js')
  return {
    ...actual,
    extractPdf: vi.fn(),
    extractEstablishmentNumbers: vi.fn(() => [EXPECTED_RMS_NUMBER])
  }
})

describe('findParser - Giovanni Model 3', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set default mock for extractEstablishmentNumbers (single RMS)
    vi.mocked(pdfHelper.extractEstablishmentNumbers).mockReturnValue([
      EXPECTED_RMS_NUMBER
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
    const result = await findParser({}, INVALID_FILENAME)
    expect(result).toMatchObject(NO_MATCH_RESULT)
  })
})
