/**
 * Giovanni Model 3 PDF Parser Tests
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { parse } from './model3.js'
import model from '../../../../test/test-data-and-results/models-pdf/giovanni/model3.js'
import parserModel from '../../parser-model.js'
import * as pdfHelper from '../../../utilities/pdf-helper.js'
import * as parserMap from '../../parser-map-pdf.js'

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
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  test('parses valid Giovanni Model 3 PDF correctly', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.validModel)
    const result = await parse(Buffer.from('mock-pdf'))
    expect(result.parserModel).toBe(parserModel.GIOVANNI3)
    expect(result.registration_approval_number).toBe('RMS-GB-000149-002')
    expect(result.items).toHaveLength(1)
    expect(result.establishment_numbers).toContain('RMS-GB-000149-002')
  })

  test('extracts country_of_origin from valid model', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.validModel)
    const result = await parse(Buffer.from('mock-pdf'))
    expect(result.items[0].country_of_origin).toBe('IT')
  })

  test('sets validateCountryOfOrigin to true', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.validModel)
    const result = await parse(Buffer.from('mock-pdf'))
    expect(result.validateCountryOfOrigin).toBe(true)
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
    expect(result.parserModel).toBe(parserModel.GIOVANNI3)
    expect(result.items[0].commodity_code).toBe('902209990')
    expect(result.items[0].country_of_origin).toBe('IT')
  })

  test('handles pages with no rows after header', async () => {
    const mapSpy = vi
      .spyOn(parserMap, 'mapPdfDynamicHeaderParser')
      .mockReturnValue([])
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue({
      pages: [
        {
          content: [
            { x: 174, y: 285, str: 'DESCRIPTION', width: 36 },
            { x: 257, y: 286, str: 'Commodity Code', width: 44 },
            { x: 357, y: 286, str: 'Quantity', width: 21 },
            { x: 389, y: 286, str: 'Net Weight (KG)', width: 41 },
            { x: 120, y: 147, str: 'RMS-GB-000149-002', width: 70 }
          ]
        }
      ]
    })

    const result = await parse(Buffer.from('mock-pdf'))

    expect(mapSpy).toHaveBeenCalled()
    expect(result.parserModel).toBe(parserModel.GIOVANNI3)
  })

  test('handles malformed row data when extracting Y coordinates', async () => {
    const mapSpy = vi
      .spyOn(parserMap, 'mapPdfDynamicHeaderParser')
      .mockReturnValue([])
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue({
      pages: [
        {
          content: [
            { x: 174, y: 285, str: 'DESCRIPTION', width: 36 },
            { x: 257, y: 286, str: 'Commodity Code', width: 44 },
            { x: 357, y: 286, str: 'Quantity', width: 21 },
            { x: 389, y: 286, str: 'Net Weight (KG)', width: 41 },
            { x: 120, y: 147, str: 'RMS-GB-000149-002', width: 70 },
            { x: 140, y: undefined, str: 'BROKEN', width: 30 }
          ]
        }
      ]
    })

    const result = await parse(Buffer.from('mock-pdf'))

    expect(mapSpy).toHaveBeenCalled()
    expect(result.parserModel).toBe(parserModel.GIOVANNI3)
  })

  test('applies blanket NIRMS value from NIRMS Only header when row-level NIRMS is absent', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue({
      pages: [
        {
          pageInfo: { num: 1 },
          content: [
            { x: 471.46, y: 147.26, str: 'RMS-GB-000149-002', width: 70 },
            { x: 480, y: 285.77, str: 'NIRMS Only', width: 30 },
            { x: 480, y: 303.77, str: 'N', width: 5 },
            { x: 174.38, y: 285.29, str: 'DESCRIPTION', width: 36 },
            { x: 257.33, y: 285.77, str: 'Commodity Code', width: 44 },
            { x: 317.11, y: 282.29, str: 'Country of', width: 27 },
            { x: 322.75, y: 289.25, str: 'Origin', width: 15 },
            { x: 357.55, y: 285.77, str: 'Quantity', width: 21 },
            { x: 389.59, y: 285.77, str: 'Net Weight (KG)', width: 41 },
            { x: 30, y: 303.77, str: '1', width: 5 },
            { x: 145.22, y: 303.77, str: 'HAM AND CHEESE TORT', width: 60 },
            { x: 265.13, y: 303.77, str: '1902209990', width: 44 },
            { x: 312.67, y: 303.77, str: 'IT', width: 7 },
            { x: 340, y: 303.77, str: '20', width: 9 },
            { x: 380, y: 303.77, str: '48', width: 9 }
          ]
        }
      ]
    })

    const result = await parse(Buffer.from('mock-pdf'))

    expect(result.parserModel).toBe(parserModel.GIOVANNI3)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].nirms).toBe('N')
  })

  test('detects NIRMS Only header with spacing variation', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue({
      pages: [
        {
          pageInfo: { num: 1 },
          content: [
            { x: 471.46, y: 147.26, str: 'RMS-GB-000149-002', width: 70 },
            { x: 480, y: 285.77, str: 'NIRMS  ONLY', width: 33 },
            { x: 480, y: 303.77, str: 'NIRMS', width: 18 },
            { x: 174.38, y: 285.29, str: 'DESCRIPTION', width: 36 },
            { x: 257.33, y: 285.77, str: 'Commodity Code', width: 44 },
            { x: 317.11, y: 282.29, str: 'Country of', width: 27 },
            { x: 322.75, y: 289.25, str: 'Origin', width: 15 },
            { x: 357.55, y: 285.77, str: 'Quantity', width: 21 },
            { x: 389.59, y: 285.77, str: 'Net Weight (KG)', width: 41 },
            { x: 30, y: 303.77, str: '1', width: 5 },
            { x: 145.22, y: 303.77, str: 'HAM AND CHEESE TORT', width: 60 },
            { x: 265.13, y: 303.77, str: '1902209990', width: 44 },
            { x: 312.67, y: 303.77, str: 'IT', width: 7 },
            { x: 340, y: 303.77, str: '20', width: 9 },
            { x: 380, y: 303.77, str: '48', width: 9 }
          ]
        }
      ]
    })

    const result = await parse(Buffer.from('mock-pdf'))

    expect(result.parserModel).toBe(parserModel.GIOVANNI3)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].nirms).toBe('NIRMS')
    expect(result.blanketNirms).toBe(false)
  })
})
