/**
 * PDF Helper Tests
 *
 * Tests for coordinate-based PDF extraction utilities.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import * as pdfHelper from './pdf-helper.js'
import { PDFExtract } from 'pdf.js-extract'

vi.mock('pdf.js-extract', () => {
  const mockExtractBuffer = vi.fn()
  return {
    PDFExtract: vi.fn(() => ({
      extractBuffer: mockExtractBuffer
    }))
  }
})

vi.mock('../services/model-headers-pdf.js', () => ({
  default: {
    TestHeader: {
      headers: {
        Header1: {
          x: /Header1/,
          headerTextAlignment: 'LL'
        },
        Header2: {
          x: /Header2/,
          headerTextAlignment: 'LL'
        }
      },
      totals: /Totals/i,
      minHeadersY: 1,
      maxHeadersY: 3
    }
  }
}))

describe('getHeaders', () => {
  test('returns correct headers', () => {
    const pageContent = [
      {
        str: 'Header1',
        x: 4,
        y: 1
      },
      {
        str: 'HeaderMax',
        x: 4,
        y: 3
      },
      {
        str: 'Header2',
        x: 6,
        y: 1
      },
      {
        str: ' ',
        x: 7,
        y: 2
      }
    ]

    const expected = {
      4: 'Header1 HeaderMax',
      6: 'Header2'
    }
    const result = pdfHelper.getHeaders(pageContent, 'TestHeader')
    expect(result.toString()).toBe(expected.toString())
  })

  test('filters content by Y coordinate range', () => {
    const pageContent = [
      { str: 'TooLow', x: 1, y: 0 }, // Below minHeadersY (1)
      { str: 'InRange1', x: 2, y: 1 }, // At minHeadersY
      { str: 'InRange2', x: 3, y: 2 }, // Between min and max
      { str: 'InRange3', x: 4, y: 3 }, // At maxHeadersY
      { str: 'TooHigh', x: 5, y: 4 } // Above maxHeadersY (3)
    ]

    const result = pdfHelper.getHeaders(pageContent, 'TestHeader')

    // Should only include items with y between 1 and 3
    expect(result[2]).toBe('InRange1')
    expect(result[3]).toBe('InRange2')
    expect(result[4]).toBe('InRange3')
    expect(result[1]).toBeUndefined()
    expect(result[5]).toBeUndefined()
  })

  test('filters out empty strings', () => {
    const pageContent = [
      { str: 'Valid', x: 1, y: 2 },
      { str: '', x: 2, y: 2 },
      { str: '   ', x: 3, y: 2 },
      { str: 'AlsoValid', x: 4, y: 2 }
    ]

    const result = pdfHelper.getHeaders(pageContent, 'TestHeader')

    expect(result[1]).toBe('Valid')
    expect(result[4]).toBe('AlsoValid')
    expect(result[2]).toBeUndefined()
    expect(result[3]).toBeUndefined()
  })

  test('groups multiple text fragments at same X coordinate', () => {
    const pageContent = [
      { str: 'Part1', x: 10, y: 2 },
      { str: 'Part2', x: 10, y: 2.5 },
      { str: 'Part3', x: 10, y: 2.8 }
    ]

    const result = pdfHelper.getHeaders(pageContent, 'TestHeader')

    expect(result[10]).toBe('Part1 Part2 Part3')
  })

  test('handles empty pageContent', () => {
    const pageContent = []
    const result = pdfHelper.getHeaders(pageContent, 'TestHeader')
    expect(Object.keys(result)).toHaveLength(0)
  })

  test('handles errors gracefully', () => {
    const pageContent = []
    const result = pdfHelper.getHeaders(pageContent, 'NonExistentHeader')
    expect(result).toEqual([])
  })
})

describe('extractEstablishmentNumbers', () => {
  test('returns empty array for empty pdfJson', () => {
    const pdfJson = { pages: [] }
    const result = pdfHelper.extractEstablishmentNumbers(pdfJson)
    expect(result).toEqual([])
  })

  test('extracts single establishment number from pdfJson', () => {
    const pdfJson = {
      pages: [
        {
          content: [{ str: 'RMS-GB-000000-000' }, { str: 'Some other text' }]
        }
      ]
    }

    const expected = ['RMS-GB-000000-000']
    const result = pdfHelper.extractEstablishmentNumbers(pdfJson)
    expect(result).toEqual(expected)
  })

  test('extracts multiple establishment numbers from pdfJson', () => {
    const pdfJson = {
      pages: [
        {
          content: [
            { str: 'RMS-GB-000000-000' },
            { str: 'Some other text' },
            { str: 'RMS-GB-000000-001' }
          ]
        }
      ]
    }

    const expected = ['RMS-GB-000000-000', 'RMS-GB-000000-001']
    const result = pdfHelper.extractEstablishmentNumbers(pdfJson)
    expect(result).toEqual(expected)
  })

  test('extracts establishment numbers across multiple pages', () => {
    const pdfJson = {
      pages: [
        {
          content: [{ str: 'RMS-GB-000000-000' }]
        },
        {
          content: [{ str: 'RMS-GB-000000-001' }]
        }
      ]
    }

    const expected = ['RMS-GB-000000-000', 'RMS-GB-000000-001']
    const result = pdfHelper.extractEstablishmentNumbers(pdfJson)
    expect(result).toEqual(expected)
  })

  test('handles custom regex pattern', () => {
    const pdfJson = {
      pages: [
        {
          content: [{ str: 'RMS-GB-123456-789' }, { str: 'INVALID-FORMAT' }]
        }
      ]
    }

    const customRegex = /RMS-GB-\d{6}-\d{3}/gi
    const result = pdfHelper.extractEstablishmentNumbers(pdfJson, customRegex)
    expect(result).toEqual(['RMS-GB-123456-789'])
  })
})

describe('extractPdf', () => {
  let mockExtractBuffer

  beforeEach(() => {
    vi.clearAllMocks()
    const pdfExtractInstance = new PDFExtract()
    mockExtractBuffer = pdfExtractInstance.extractBuffer
  })

  test('extracts and sanitizes PDF from buffer', async () => {
    const mockBuffer = Buffer.from('test pdf content')
    const mockRawPdfJson = {
      pages: [
        {
          content: [
            { str: 'Header', x: 1, y: 2, width: 5 },
            { str: '', x: 2, y: 3, width: 0 }, // Should be removed
            { str: 'Data', x: 3, y: 1, width: 4 }
          ]
        }
      ]
    }

    mockExtractBuffer.mockResolvedValue(mockRawPdfJson)

    const result = await pdfHelper.extractPdf(mockBuffer)

    expect(mockExtractBuffer).toHaveBeenCalledWith(mockBuffer)
    expect(result.pages[0].content).toHaveLength(2)
    // Verify sorting: y=1 should come before y=2
    expect(result.pages[0].content[0].str).toBe('Data')
    expect(result.pages[0].content[1].str).toBe('Header')
  })

  test('handles multiple pages with sorting and cleanup', async () => {
    const mockBuffer = Buffer.from('multi-page pdf')
    const mockRawPdfJson = {
      pages: [
        {
          content: [
            { str: 'Page1-Item2', x: 2, y: 5, width: 5 },
            { str: '', x: 1, y: 3, width: 0 }, // Should be removed
            { str: 'Page1-Item1', x: 1, y: 3, width: 4 }
          ]
        },
        {
          content: [
            { str: 'Page2-Item2', x: 5, y: 10, width: 3 },
            { str: '', x: 2, y: 8, width: 0 }, // Should be removed
            { str: 'Page2-Item1', x: 2, y: 8, width: 6 }
          ]
        }
      ]
    }

    mockExtractBuffer.mockResolvedValue(mockRawPdfJson)

    const result = await pdfHelper.extractPdf(mockBuffer)

    expect(result.pages).toHaveLength(2)
    // Page 1 should have 2 items (1 removed for width=0)
    expect(result.pages[0].content).toHaveLength(2)
    // Page 2 should have 2 items (1 removed for width=0)
    expect(result.pages[1].content).toHaveLength(2)
    // Verify sorting by y, then x
    expect(result.pages[0].content[0].y).toBe(3)
    expect(result.pages[0].content[1].y).toBe(5)
  })

  test('handles content sorting by y and x coordinates', async () => {
    const mockBuffer = Buffer.from('test')
    const mockRawPdfJson = {
      pages: [
        {
          content: [
            { str: 'D', x: 4, y: 2, width: 1 },
            { str: 'B', x: 2, y: 2, width: 1 },
            { str: 'C', x: 3, y: 2, width: 1 },
            { str: 'A', x: 1, y: 1, width: 1 }
          ]
        }
      ]
    }

    mockExtractBuffer.mockResolvedValue(mockRawPdfJson)

    const result = await pdfHelper.extractPdf(mockBuffer)

    // Should be sorted by y first, then by x
    expect(result.pages[0].content[0].str).toBe('A') // y=1, x=1
    expect(result.pages[0].content[1].str).toBe('B') // y=2, x=2
    expect(result.pages[0].content[2].str).toBe('C') // y=2, x=3
    expect(result.pages[0].content[3].str).toBe('D') // y=2, x=4
  })

  test('handles empty pages', async () => {
    const mockBuffer = Buffer.from('empty pdf')
    const mockRawPdfJson = {
      pages: [
        {
          content: []
        }
      ]
    }

    mockExtractBuffer.mockResolvedValue(mockRawPdfJson)

    const result = await pdfHelper.extractPdf(mockBuffer)

    expect(result.pages[0].content).toEqual([])
  })

  test('removes all elements with width zero', async () => {
    const mockBuffer = Buffer.from('test')
    const mockRawPdfJson = {
      pages: [
        {
          content: [
            { str: '', x: 1, y: 1, width: 0 },
            { str: '', x: 2, y: 2, width: 0 },
            { str: '', x: 3, y: 3, width: 0 },
            { str: 'Valid', x: 4, y: 4, width: 5 }
          ]
        }
      ]
    }

    mockExtractBuffer.mockResolvedValue(mockRawPdfJson)

    const result = await pdfHelper.extractPdf(mockBuffer)

    expect(result.pages[0].content).toHaveLength(1)
    expect(result.pages[0].content[0].str).toBe('Valid')
  })
})
