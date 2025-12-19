/**
 * PDF Helper Tests
 *
 * Tests for coordinate-based PDF extraction utilities.
 */

import { describe, test, expect, vi } from 'vitest'
import * as pdfHelper from './pdf-helper.js'

vi.mock('pdf.js-extract')

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
  test('is exported and callable', () => {
    expect(pdfHelper.extractPdf).toBeDefined()
    expect(typeof pdfHelper.extractPdf).toBe('function')
  })
})
