/**
 * Unit tests for parser selector functions
 */
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { getExcelParser, getCsvParser } from './parsers.js'
import matcherResult from '../matcher-result.js'

// Mock the dependencies
vi.mock('../model-parsers.js', () => {
  const mockExcelParser1 = {
    matches: vi.fn(),
    parse: vi.fn(),
    name: 'EXCEL_PARSER_1'
  }

  const mockExcelParser2 = {
    matches: vi.fn(),
    parse: vi.fn(),
    name: 'EXCEL_PARSER_2'
  }

  const mockCsvParser1 = {
    matches: vi.fn(),
    parse: vi.fn(),
    name: 'CSV_PARSER_1'
  }

  const mockNoRemosParser = {
    matches: vi.fn(),
    parse: vi.fn(),
    name: 'missing remos parser'
  }

  const mockNoRemosCsvParser = {
    matches: vi.fn(),
    parse: vi.fn(),
    name: 'missing remos parser'
  }

  return {
    parsersExcel: {
      PARSER1: mockExcelParser1,
      PARSER2: mockExcelParser2
    },
    parsersCsv: {
      CSV_PARSER1: mockCsvParser1
    },
    parsersPdf: {},
    parsersPdfNonAi: {},
    noMatchParsers: {
      NOREMOS: mockNoRemosParser,
      NOREMOSCSV: mockNoRemosCsvParser,
      NOREMOSPDF: {
        matches: vi.fn(),
        parse: vi.fn()
      },
      UNRECOGNISED: {
        parse: vi.fn()
      }
    }
  }
})

vi.mock('../matcher-result.js', () => ({
  default: {
    CORRECT: 4,
    WRONG_EXTENSION: 0,
    WRONG_ESTABLISHMENT_NUMBER: 1,
    WRONG_HEADER: 2,
    GENERIC_ERROR: 3,
    EMPTY_FILE: 5
  }
}))

vi.mock('../model-headers.js', () => ({
  default: {
    PARSER1: { deprecated: false },
    PARSER2: { deprecated: false }
  }
}))

vi.mock('../model-headers-csv.js', () => ({
  default: {
    CSV_PARSER1: { deprecated: false }
  }
}))

vi.mock('../model-headers-pdf.js', () => ({
  default: {}
}))

describe('getExcelParser', () => {
  let mockParsers
  let mockNoRemosParser

  beforeEach(async () => {
    const modelParsers = await import('../model-parsers.js')
    mockParsers = modelParsers.parsersExcel
    mockNoRemosParser = modelParsers.noMatchParsers.NOREMOS

    // Reset all mocks
    vi.clearAllMocks()
  })

  test('should return matched Excel parser when REMOS is valid and parser matches', () => {
    const packingList = { data: 'test data' }
    const filename = 'test.xlsx'

    // Mock REMOS validation passes
    mockNoRemosParser.matches.mockReturnValue(true)

    // Mock first parser matches
    mockParsers.PARSER1.matches.mockReturnValue(matcherResult.CORRECT)

    const result = getExcelParser(packingList, filename)

    expect(mockNoRemosParser.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
    expect(mockParsers.PARSER1.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
    expect(result).toBe(mockParsers.PARSER1)
    expect(result.name).toBe('EXCEL_PARSER_1')
  })

  test('should return NOREMOS parser when REMOS validation fails', () => {
    const packingList = { data: 'test data' }
    const filename = 'test.xlsx'

    // Mock REMOS validation fails
    mockNoRemosParser.matches.mockReturnValue(false)

    const result = getExcelParser(packingList, filename)

    expect(mockNoRemosParser.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
    expect(mockParsers.PARSER1.matches).not.toHaveBeenCalled()
    expect(result).toBe(mockNoRemosParser)
    expect(result.name).toBe('missing remos parser')
  })

  test('should try second parser when first parser does not match', () => {
    const packingList = { data: 'test data' }
    const filename = 'test.xlsx'

    // Mock REMOS validation passes
    mockNoRemosParser.matches.mockReturnValue(true)

    // Mock first parser does not match
    mockParsers.PARSER1.matches.mockReturnValue(matcherResult.WRONG_HEADER)

    // Mock second parser matches
    mockParsers.PARSER2.matches.mockReturnValue(matcherResult.CORRECT)

    const result = getExcelParser(packingList, filename)

    expect(mockParsers.PARSER1.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
    expect(mockParsers.PARSER2.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
    expect(result).toBe(mockParsers.PARSER2)
    expect(result.name).toBe('EXCEL_PARSER_2')
  })

  test('should return null when REMOS is valid but no parser matches', () => {
    const packingList = { data: 'test data' }
    const filename = 'test.xlsx'

    // Mock REMOS validation passes
    mockNoRemosParser.matches.mockReturnValue(true)

    // Mock all parsers do not match
    mockParsers.PARSER1.matches.mockReturnValue(matcherResult.WRONG_HEADER)
    mockParsers.PARSER2.matches.mockReturnValue(matcherResult.WRONG_HEADER)

    const result = getExcelParser(packingList, filename)

    expect(mockParsers.PARSER1.matches).toHaveBeenCalled()
    expect(mockParsers.PARSER2.matches).toHaveBeenCalled()
    expect(result).toBeNull()
  })

  test('should skip deprecated parsers', async () => {
    const packingList = { data: 'test data' }
    const filename = 'test.xlsx'

    // Update headers mock to mark PARSER1 as deprecated
    vi.doMock('../model-headers.js', () => ({
      default: {
        PARSER1: { deprecated: true },
        PARSER2: { deprecated: false }
      }
    }))

    // Reimport to get updated mock
    const { getExcelParser: getExcelParserUpdated } = await import(
      './parsers.js?update=1'
    )

    // Mock REMOS validation passes
    mockNoRemosParser.matches.mockReturnValue(true)

    // Mock second parser matches
    mockParsers.PARSER2.matches.mockReturnValue(matcherResult.CORRECT)

    const result = getExcelParserUpdated(packingList, filename)

    // PARSER1 should not be called because it's deprecated
    expect(mockParsers.PARSER1.matches).not.toHaveBeenCalled()
    expect(mockParsers.PARSER2.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
    expect(result).toBe(mockParsers.PARSER2)
  })

  test('should return first matching parser when multiple parsers match', () => {
    const packingList = { data: 'test data' }
    const filename = 'test.xlsx'

    // Mock REMOS validation passes
    mockNoRemosParser.matches.mockReturnValue(true)

    // Mock both parsers match
    mockParsers.PARSER1.matches.mockReturnValue(matcherResult.CORRECT)
    mockParsers.PARSER2.matches.mockReturnValue(matcherResult.CORRECT)

    const result = getExcelParser(packingList, filename)

    expect(mockParsers.PARSER1.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
    // PARSER2 should not be checked because PARSER1 already matched
    expect(mockParsers.PARSER2.matches).not.toHaveBeenCalled()
    expect(result).toBe(mockParsers.PARSER1)
  })

  test('should handle empty packing list', () => {
    const packingList = {}
    const filename = 'test.xlsx'

    // Mock REMOS validation fails for empty list
    mockNoRemosParser.matches.mockReturnValue(false)

    const result = getExcelParser(packingList, filename)

    expect(result).toBe(mockNoRemosParser)
    expect(result.name).toBe('missing remos parser')
  })

  test('should handle null packing list', () => {
    const packingList = null
    const filename = 'test.xlsx'

    // Mock REMOS validation fails for null
    mockNoRemosParser.matches.mockReturnValue(false)

    const result = getExcelParser(packingList, filename)

    expect(mockNoRemosParser.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
    expect(result).toBe(mockNoRemosParser)
  })

  test('should pass filename to both REMOS validator and parser matcher', () => {
    const packingList = { data: 'test data' }
    const filename = 'retailer-specific.xlsx'

    // Mock REMOS validation passes
    mockNoRemosParser.matches.mockReturnValue(true)

    // Mock parser matches
    mockParsers.PARSER1.matches.mockReturnValue(matcherResult.CORRECT)

    getExcelParser(packingList, filename)

    expect(mockNoRemosParser.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
    expect(mockParsers.PARSER1.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
  })

  test('should handle parser returning non-CORRECT match result', () => {
    const packingList = { data: 'test data' }
    const filename = 'test.xlsx'

    // Mock REMOS validation passes
    mockNoRemosParser.matches.mockReturnValue(true)

    // Mock parser returns different error codes
    mockParsers.PARSER1.matches.mockReturnValue(matcherResult.WRONG_EXTENSION)
    mockParsers.PARSER2.matches.mockReturnValue(matcherResult.EMPTY_FILE)

    const result = getExcelParser(packingList, filename)

    expect(mockParsers.PARSER1.matches).toHaveBeenCalled()
    expect(mockParsers.PARSER2.matches).toHaveBeenCalled()
    expect(result).toBeNull()
  })
})

describe('getCsvParser', () => {
  let mockCsvParsers
  let mockNoRemosCsvParser

  beforeEach(async () => {
    const modelParsers = await import('../model-parsers.js')
    mockCsvParsers = modelParsers.parsersCsv
    mockNoRemosCsvParser = modelParsers.noMatchParsers.NOREMOSCSV

    // Reset all mocks
    vi.clearAllMocks()
  })

  test('should return matched CSV parser when REMOS is valid and parser matches', () => {
    const packingList = { data: 'test csv data' }
    const filename = 'test.csv'

    // Mock REMOS validation passes
    mockNoRemosCsvParser.matches.mockReturnValue(true)

    // Mock CSV parser matches
    mockCsvParsers.CSV_PARSER1.matches.mockReturnValue(matcherResult.CORRECT)

    const result = getCsvParser(packingList, filename)

    expect(mockNoRemosCsvParser.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
    expect(mockCsvParsers.CSV_PARSER1.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
    expect(result).toBe(mockCsvParsers.CSV_PARSER1)
    expect(result.name).toBe('CSV_PARSER_1')
  })

  test('should return NOREMOSCSV parser when REMOS validation fails', () => {
    const packingList = { data: 'test csv data' }
    const filename = 'test.csv'

    // Mock REMOS validation fails
    mockNoRemosCsvParser.matches.mockReturnValue(false)

    const result = getCsvParser(packingList, filename)

    expect(mockNoRemosCsvParser.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
    expect(mockCsvParsers.CSV_PARSER1.matches).not.toHaveBeenCalled()
    expect(result).toBe(mockNoRemosCsvParser)
    expect(result.name).toBe('missing remos parser')
  })

  test('should return null when REMOS is valid but CSV parser does not match', () => {
    const packingList = { data: 'test csv data' }
    const filename = 'test.csv'

    // Mock REMOS validation passes
    mockNoRemosCsvParser.matches.mockReturnValue(true)

    // Mock CSV parser does not match
    mockCsvParsers.CSV_PARSER1.matches.mockReturnValue(
      matcherResult.WRONG_HEADER
    )

    const result = getCsvParser(packingList, filename)

    expect(mockCsvParsers.CSV_PARSER1.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
    expect(result).toBeNull()
  })

  test('should handle empty CSV packing list', () => {
    const packingList = {}
    const filename = 'test.csv'

    // Mock REMOS validation fails for empty list
    mockNoRemosCsvParser.matches.mockReturnValue(false)

    const result = getCsvParser(packingList, filename)

    expect(result).toBe(mockNoRemosCsvParser)
    expect(result.name).toBe('missing remos parser')
  })

  test('should pass filename to both REMOS validator and CSV parser matcher', () => {
    const packingList = { data: 'test csv data' }
    const filename = 'retailer-specific.csv'

    // Mock REMOS validation passes
    mockNoRemosCsvParser.matches.mockReturnValue(true)

    // Mock CSV parser matches
    mockCsvParsers.CSV_PARSER1.matches.mockReturnValue(matcherResult.CORRECT)

    getCsvParser(packingList, filename)

    expect(mockNoRemosCsvParser.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
    expect(mockCsvParsers.CSV_PARSER1.matches).toHaveBeenCalledWith(
      packingList,
      filename
    )
  })
})
