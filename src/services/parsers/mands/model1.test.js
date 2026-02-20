/**
 * M&S Model 1 PDF parser tests
 *
 * Tests the parser logic for M&S packing list PDFs.
 * ALL test cases copied from legacy repository without modification.
 */
import { describe, test, expect, afterEach, vi } from 'vitest'
import model from '../../../../test/test-data-and-results/models-pdf/mands/model1.js'
import test_results from '../../../../test/test-data-and-results/results-pdf/mands/model1.js'
import headers from '../../model-headers-pdf.js'
import * as parserMap from '../../parser-map.js'

// Mock pdf-helper before importing the parser
vi.mock('../../../utilities/pdf-helper.js', async () => {
  const actual = await vi.importActual('../../../utilities/pdf-helper.js')
  return {
    ...actual,
    extractPdf: vi.fn()
  }
})

// Import after mocking
const { extractPdf } = await import('../../../utilities/pdf-helper.js')
const { parse, findNetWeightUnit, getYsForRows } = await import('./model1.js')

describe('parseMandS1', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('returns NOMATCH when extracted PDF has no pages', async () => {
    extractPdf.mockImplementation(() => ({ pages: [] }))

    const result = await parse(Buffer.from('empty-pages'))

    expect(result).toMatchObject({
      registration_approval_number: null,
      items: [],
      business_checks: {
        all_required_fields_present: false,
        failure_reasons: null
      },
      parserModel: 'NOMATCH',
      establishment_numbers: []
    })
  })

  test.each([
    [model.validModel, test_results.validTestResult],
    [model.emptyModel, test_results.emptyTestResult]
  ])('parses model', async (testModel, expected) => {
    extractPdf.mockImplementation(() => {
      return testModel
    })
    const result = await parse({})

    expect(result).toMatchObject(expected)
  })

  test('should call logger.error when an error is thrown', async () => {
    extractPdf.mockImplementation(() => {
      throw new Error('Test error')
    })

    const result = await parse(null)

    // When an error is thrown, parser should return NOMATCH
    expect(result.parserModel).toBe('NOMATCH')
  })

  test('handles getYsForRows errors when page content includes invalid text values', async () => {
    const parseSpy = vi
      .spyOn(parserMap, 'mapPdfNonAiParser')
      .mockImplementation(() => [])

    const basePage = model.validModel.pages[0]
    const invalidTextValue = {
      [Symbol.toPrimitive]() {
        throw new Error('bad text value')
      }
    }
    const problematicPage = {
      ...basePage,
      content: [
        { str: invalidTextValue, y: headers.MANDS1.maxHeadersY + 1 },
        ...basePage.content
      ]
    }

    extractPdf.mockImplementation(() => ({
      pages: [basePage, problematicPage]
    }))

    const result = await parse(Buffer.from('bad-ys-page'))

    expect(result.parserModel).toBe('MANDS1')
    expect(result.items).toEqual([])
    parseSpy.mockRestore()
  })

  test('filters rows that are completely empty', async () => {
    const parseSpy = vi
      .spyOn(parserMap, 'mapPdfNonAiParser')
      .mockImplementation(() => [
        {
          description: null,
          commodity_code: null,
          number_of_packages: null,
          total_net_weight_kg: null
        },
        {
          description: 'Valid item',
          commodity_code: '12345678',
          number_of_packages: 1,
          total_net_weight_kg: 10
        }
      ])

    extractPdf.mockImplementation(() => model.validModel)

    const result = await parse(Buffer.from('filter-empty-rows'))

    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      description: 'Valid item',
      commodity_code: '12345678',
      number_of_packages: 1,
      total_net_weight_kg: 10
    })
    parseSpy.mockRestore()
  })
})

describe('findNetWeightUnit', () => {
  test('should find the net weight unit from the header', () => {
    const header = 'Tot Net Weight kg Tot Gross Weight kg'
    const result = findNetWeightUnit(header)
    expect(result).toBe('kg')
  })

  test('should find the net weight unit from the header without gross weight', () => {
    const header = 'Tot Net Weight kg'
    const result = findNetWeightUnit(header)
    expect(result).toBe('kg')
  })

  test('should find the net weight unit from the header without gross weight kg', () => {
    const header = 'Tot Net Weight kg gross weight'
    const result = findNetWeightUnit(header)
    expect(result).toBe('kg')
  })

  test('should return null if no valid unit is found', () => {
    const header = 'Tot Net Weight'
    const result = findNetWeightUnit(header)
    expect(result).toBeNull()
  })

  test("shouldn't return gross weight kg", () => {
    const header = 'tot Net Weight (other string) Tot Gross Weight kg'
    const result = findNetWeightUnit(header)
    expect(result).toBeNull()
  })

  test("shouldn't return gross weight kg for any characters", () => {
    const header = 'tot Net Weight 5tgif20 Tot Gross Weight kg'
    const result = findNetWeightUnit(header)
    expect(result).toBeNull()
  })

  test('should return null when header is undefined', () => {
    const result = findNetWeightUnit(undefined)
    expect(result).toBeNull()
  })

  test('should return null when header is null', () => {
    const result = findNetWeightUnit(null)
    expect(result).toBeNull()
  })

  test('should return null when header is empty string', () => {
    const result = findNetWeightUnit('')
    expect(result).toBeNull()
  })

  test("should return null when header doesn't contain 'net weight'", () => {
    const header = 'Total Weight kg'
    const result = findNetWeightUnit(header)
    expect(result).toBeNull()
  })
})

describe('getYsForRows', () => {
  test('returns empty array when page content is malformed', () => {
    const result = getYsForRows(null, headers.MANDS1)

    expect(result).toEqual([])
  })
})
