/**
 * Giovanni Model 3 PDF Parser Tests
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { parse } from './model3.js'
import model from '../../../../test/test-data-and-results/models-pdf/giovanni/model3.js'
import expectedResults from '../../../../test/test-data-and-results/results-pdf/giovanni/model3.js'
import parserModel from '../../parser-model.js'
import * as pdfHelper from '../../../utilities/pdf-helper.js'

// Mock the pdf-helper module - only mock extractPdf
vi.mock('../../../utilities/pdf-helper.js', async () => {
  const actual = await vi.importActual('../../../utilities/pdf-helper.js')
  return {
    ...actual,
    extractPdf: vi.fn()
  }
})

describe('Giovanni Model 3 PDF Parser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('parses valid Giovanni Model 3 PDF correctly', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.validModel)
    const result = await parse(Buffer.from('mock-pdf'))
    expect(result).toMatchObject(expectedResults.validTestResult)
    expect(result.items).toHaveLength(
      expectedResults.validTestResult.items.length
    )
    expect(result.establishment_numbers).toContain('RMS-GB-000149-002')
  })

  test('returns NOMATCH for empty pdf', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.emptyModel)
    const result = await parse(Buffer.from('mock-pdf'))
    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('parses model with short commodity code', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(
      model.validModelWithShortCommodityCode
    )
    const result = await parse(Buffer.from('mock-pdf'))
    expect(result).toMatchObject(
      expectedResults.validTestResultWithShortCommodityCode
    )
  })
})
