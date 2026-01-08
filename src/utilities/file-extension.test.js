import { describe, it, expect } from 'vitest'
import { matches, isExcel } from './file-extension.js'
import matcherResult from '../services/matcher-result.js'

describe('file-extension-check', () => {
  it.each([
    ['test-file.xls', 'xls', matcherResult.CORRECT],
    ['test-file.xlsX', 'xlsx', matcherResult.CORRECT],
    ['test-file.xlsX', 'xLsx', matcherResult.CORRECT],
    ['test-file.Xls', 'xls', matcherResult.CORRECT],
    ['test-file.csv', 'csv', matcherResult.CORRECT],
    ['test-file.Csv', 'csv', matcherResult.CORRECT],
    ['test-file.CsV', 'cSV', matcherResult.CORRECT],
    ['car', 'xls', matcherResult.WRONG_EXTENSION],
    ['car.abc', 'xls', matcherResult.WRONG_EXTENSION]
  ])(
    "matches: when the input is '%s' and the extension is '%s', the result should be '%s'",
    (filename, extension, expected) => {
      expect(matches(filename, extension)).toBe(expected)
    }
  )

  it.each([
    ['test-file.xls', true],
    ['test-file.xlsx', true],
    ['test-file.csv', false],
    ['test-file.pdf', false],
    ['test-file.abc', false],
    ['test-file', false]
  ])(
    "isExcel: when the input is '%s', the result should be '%s'",
    (filename, expected) => {
      expect(isExcel(filename)).toBe(expected)
    }
  )
})
