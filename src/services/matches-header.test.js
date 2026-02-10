import { describe, it, expect, beforeEach, vi } from 'vitest'
import { matchesHeader } from './matches-header.js'
import matcherResult from './matcher-result.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import * as regex from '../utilities/regex.js'

// Mock dependencies with shared instances
vi.mock('../common/helpers/logging/logger.js', () => {
  const mockLoggerInstance = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
  return {
    createLogger: vi.fn(() => mockLoggerInstance)
  }
})

vi.mock('../utilities/regex.js', () => ({
  testAllPatterns: vi.fn()
}))

const mockLogger = createLogger()

describe('matchesHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('successful header matching', () => {
    it('should return CORRECT when a row matches all regex patterns', () => {
      const regexHeaders = [/pattern1/, /pattern2/]
      const packingListSheet = [
        { col1: 'no match', col2: 'nothing' },
        { col1: 'pattern1 data', col2: 'pattern2 data' },
        { col1: 'another row', col2: 'more data' }
      ]

      vi.mocked(regex.testAllPatterns)
        .mockReturnValueOnce(false) // First row doesn't match
        .mockReturnValueOnce(true) // Second row matches

      const result = matchesHeader(regexHeaders, packingListSheet)

      expect(result).toBe(matcherResult.CORRECT)
      expect(regex.testAllPatterns).toHaveBeenCalledTimes(2)
      expect(regex.testAllPatterns).toHaveBeenCalledWith(
        regexHeaders,
        packingListSheet[0]
      )
      expect(regex.testAllPatterns).toHaveBeenCalledWith(
        regexHeaders,
        packingListSheet[1]
      )
    })

    it('should return CORRECT on first row match', () => {
      const regexHeaders = [/header/, /name/]
      const packingListSheet = [
        { col1: 'header', col2: 'name' },
        { col1: 'data', col2: 'value' }
      ]

      vi.mocked(regex.testAllPatterns).mockReturnValueOnce(true)

      const result = matchesHeader(regexHeaders, packingListSheet)

      expect(result).toBe(matcherResult.CORRECT)
      expect(regex.testAllPatterns).toHaveBeenCalledTimes(1)
    })

    it('should return CORRECT when matching on last row', () => {
      const regexHeaders = [/test/]
      const packingListSheet = [
        { col1: 'no' },
        { col1: 'match' },
        { col1: 'here' },
        { col1: 'test data' }
      ]

      vi.mocked(regex.testAllPatterns)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)

      const result = matchesHeader(regexHeaders, packingListSheet)

      expect(result).toBe(matcherResult.CORRECT)
      expect(regex.testAllPatterns).toHaveBeenCalledTimes(4)
    })
  })

  describe('no header match', () => {
    it('should return WRONG_HEADER when no rows match all patterns', () => {
      const regexHeaders = [/pattern1/, /pattern2/]
      const packingListSheet = [
        { col1: 'no match', col2: 'nothing' },
        { col1: 'still no match', col2: 'nope' },
        { col1: 'another row', col2: 'more data' }
      ]

      vi.mocked(regex.testAllPatterns).mockReturnValue(false)

      const result = matchesHeader(regexHeaders, packingListSheet)

      expect(result).toBe(matcherResult.WRONG_HEADER)
      expect(regex.testAllPatterns).toHaveBeenCalledTimes(3)
    })

    it('should return WRONG_HEADER for empty packing list sheet', () => {
      const regexHeaders = [/pattern/]
      const packingListSheet = []

      const result = matchesHeader(regexHeaders, packingListSheet)

      expect(result).toBe(matcherResult.WRONG_HEADER)
      expect(regex.testAllPatterns).not.toHaveBeenCalled()
    })

    it('should return WRONG_HEADER when patterns partially match', () => {
      const regexHeaders = [/header/, /name/, /date/]
      const packingListSheet = [
        { col1: 'header', col2: 'name' }, // Missing 'date'
        { col1: 'name', col2: 'date' } // Missing 'header'
      ]

      vi.mocked(regex.testAllPatterns).mockReturnValue(false)

      const result = matchesHeader(regexHeaders, packingListSheet)

      expect(result).toBe(matcherResult.WRONG_HEADER)
    })
  })

  describe('error handling', () => {
    it('should return GENERIC_ERROR when testAllPatterns throws an error', () => {
      const regexHeaders = [/pattern/]
      const packingListSheet = [{ col1: 'data' }]
      const testError = new Error('Test error from regex')
      testError.stack = 'Error stack trace'

      vi.mocked(regex.testAllPatterns).mockImplementation(() => {
        throw testError
      })

      const result = matchesHeader(regexHeaders, packingListSheet)

      expect(result).toBe(matcherResult.GENERIC_ERROR)
      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          error: {
            message: 'Test error from regex',
            stack_trace: 'Error stack trace'
          }
        },
        'Error in matchesHeader()'
      )
    })

    it('should return GENERIC_ERROR when iteration throws an error', () => {
      const regexHeaders = [/pattern/]
      const packingListSheet = [{ col1: 'data1' }, { col1: 'data2' }]
      const testError = new Error('Iteration error')
      testError.stack = 'Stack trace for iteration error'

      vi.mocked(regex.testAllPatterns)
        .mockReturnValueOnce(false)
        .mockImplementationOnce(() => {
          throw testError
        })

      const result = matchesHeader(regexHeaders, packingListSheet)

      expect(result).toBe(matcherResult.GENERIC_ERROR)
      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          error: {
            message: 'Iteration error',
            stack_trace: 'Stack trace for iteration error'
          }
        },
        'Error in matchesHeader()'
      )
    })

    it('should return GENERIC_ERROR and log error without stack trace', () => {
      const regexHeaders = [/pattern/]
      const packingListSheet = [{ col1: 'data' }]
      const testError = new Error('Error without stack')
      testError.stack = undefined

      vi.mocked(regex.testAllPatterns).mockImplementation(() => {
        throw testError
      })

      const result = matchesHeader(regexHeaders, packingListSheet)

      expect(result).toBe(matcherResult.GENERIC_ERROR)
      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          error: {
            message: 'Error without stack',
            stack_trace: undefined
          }
        },
        'Error in matchesHeader()'
      )
    })

    it('should handle TypeError when accessing row properties', () => {
      const regexHeaders = [/pattern/]
      const packingListSheet = [null]
      const testError = new TypeError('Cannot read properties of null')
      testError.stack = 'TypeError stack trace'

      vi.mocked(regex.testAllPatterns).mockImplementation(() => {
        throw testError
      })

      const result = matchesHeader(regexHeaders, packingListSheet)

      expect(result).toBe(matcherResult.GENERIC_ERROR)
      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          error: {
            message: 'Cannot read properties of null',
            stack_trace: 'TypeError stack trace'
          }
        },
        'Error in matchesHeader()'
      )
    })
  })

  describe('edge cases', () => {
    it('should handle single regex pattern and single row', () => {
      const regexHeaders = [/name/]
      const packingListSheet = [{ column: 'name' }]

      vi.mocked(regex.testAllPatterns).mockReturnValue(true)

      const result = matchesHeader(regexHeaders, packingListSheet)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('should handle multiple regex patterns', () => {
      const regexHeaders = [
        /header1/,
        /header2/,
        /header3/,
        /header4/,
        /header5/
      ]
      const packingListSheet = [
        {
          col1: 'header1',
          col2: 'header2',
          col3: 'header3',
          col4: 'header4',
          col5: 'header5'
        }
      ]

      vi.mocked(regex.testAllPatterns).mockReturnValue(true)

      const result = matchesHeader(regexHeaders, packingListSheet)

      expect(result).toBe(matcherResult.CORRECT)
    })

    it('should handle rows with many columns', () => {
      const regexHeaders = [/target/]
      const packingListSheet = [
        {
          col1: 'a',
          col2: 'b',
          col3: 'c',
          col4: 'd',
          col5: 'e',
          col6: 'f',
          col7: 'g',
          col8: 'h',
          col9: 'i',
          col10: 'target value'
        }
      ]

      vi.mocked(regex.testAllPatterns).mockReturnValue(true)

      const result = matchesHeader(regexHeaders, packingListSheet)

      expect(result).toBe(matcherResult.CORRECT)
    })
  })
})
