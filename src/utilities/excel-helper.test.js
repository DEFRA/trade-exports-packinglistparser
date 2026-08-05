import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isExcel, convertExcelToJson } from './excel-helper.js'
import * as excelUtility from './excel-utility.js'

// Mock the excel-utility module
vi.mock('./excel-utility.js', () => ({
  convertExcelToJson: vi.fn()
}))

describe('isExcel', () => {
  it.each([
    ['.xls files', 'test.xls', true],
    ['.xlsx files', 'test.xlsx', true],
    ['.xls files with uppercase extension', 'test.XLS', true],
    ['.xlsx files with uppercase extension', 'test.XLSX', true],
    ['.xls files with mixed case extension', 'test.XlS', true],
    ['.xlsx files with mixed case extension', 'test.XlSx', true],
    ['.pdf files', 'test.pdf', false],
    ['.csv files', 'test.csv', false],
    ['.txt files', 'test.txt', false],
    ['.doc files', 'test.doc', false],
    ['files with no extension', 'test', false],
    ['filenames with paths (xlsx)', '/path/to/test.xlsx', true],
    ['filenames with paths (pdf)', '/path/to/test.pdf', false],
    ['filenames with multiple dots (xls)', 'test.file.name.xls', true],
    ['filenames with multiple dots (xlsx)', 'test.file.name.xlsx', true],
    ['filenames with multiple dots (pdf)', 'test.file.name.pdf', false],
    [
      'files that contain xls but do not end with it (xlsx backup)',
      'test.xlsx.backup',
      false
    ],
    [
      'files that contain xls but do not end with it (xls old)',
      'test.xls.old',
      false
    ]
  ])('should handle %s', (_, filename, expected) => {
    expect(isExcel(filename)).toBe(expected)
  })
})

describe('convertExcelToJson', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call convertExcelToJsonUtil with provided options', () => {
    const mockOptions = {
      source: Buffer.from('test data'),
      sheetName: 'Sheet1'
    }

    const mockResult = {
      Sheet1: [
        { A: 'Header1', B: 'Header2' },
        { A: 'Data1', B: 'Data2' }
      ]
    }

    vi.mocked(excelUtility.convertExcelToJson).mockReturnValue(mockResult)

    const result = convertExcelToJson(mockOptions)

    expect(excelUtility.convertExcelToJson).toHaveBeenCalledWith(mockOptions)
    expect(result).toEqual(mockResult)
  })

  it('should handle options with sourceFile path', () => {
    const mockOptions = {
      sourceFile: '/path/to/file.xlsx'
    }

    const mockResult = {
      Sheet1: [{ A: 'Test' }]
    }

    vi.mocked(excelUtility.convertExcelToJson).mockReturnValue(mockResult)

    const result = convertExcelToJson(mockOptions)

    expect(excelUtility.convertExcelToJson).toHaveBeenCalledWith(mockOptions)
    expect(result).toEqual(mockResult)
  })

  it('should handle options with Buffer source', () => {
    const mockBuffer = Buffer.from('excel file content')
    const mockOptions = {
      source: mockBuffer
    }

    const mockResult = {
      Sheet1: [{ A: 'Data' }],
      Sheet2: [{ B: 'More Data' }]
    }

    vi.mocked(excelUtility.convertExcelToJson).mockReturnValue(mockResult)

    const result = convertExcelToJson(mockOptions)

    expect(excelUtility.convertExcelToJson).toHaveBeenCalledWith(mockOptions)
    expect(result).toEqual(mockResult)
  })

  it('should return result from convertExcelToJsonUtil', () => {
    const mockOptions = {}
    const mockResult = { Sheet1: [] }

    vi.mocked(excelUtility.convertExcelToJson).mockReturnValue(mockResult)

    const result = convertExcelToJson(mockOptions)

    expect(result).toBe(mockResult)
  })

  it('should pass through empty options object', () => {
    const mockOptions = {}
    const mockResult = {}

    vi.mocked(excelUtility.convertExcelToJson).mockReturnValue(mockResult)

    convertExcelToJson(mockOptions)

    expect(excelUtility.convertExcelToJson).toHaveBeenCalledTimes(1)
    expect(excelUtility.convertExcelToJson).toHaveBeenCalledWith(mockOptions)
  })
})
