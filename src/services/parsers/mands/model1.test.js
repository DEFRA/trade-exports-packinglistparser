/**
 * M&S Model 1 PDF parser tests
 *
 * Tests the parser logic for M&S packing list PDFs.
 * ALL test cases copied from legacy repository without modification.
 */
import { describe, test, expect, afterEach, vi } from 'vitest'
import model from '../../../../test/test-data-and-results/models-pdf/mands/model1.js'
import test_results from '../../../../test/test-data-and-results/results-pdf/mands/model1.js'

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
const { parse, findNetWeightUnit } = await import('./model1.js')

describe('parseMandS1', () => {
  afterEach(() => {
    vi.clearAllMocks()
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
