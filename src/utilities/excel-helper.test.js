import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isExcel, convertExcelToJson } from './excel-helper.js'
import * as excelUtility from './excel-utility.js'

// Mock the excel-utility module
vi.mock('./excel-utility.js', () => ({
  convertExcelToJson: vi.fn()
}))

describe('isExcel', () => {
  it('should return true for .xls files', () => {
    expect(isExcel('test.xls')).toBe(true)
  })

  it('should return true for .xlsx files', () => {
    expect(isExcel('test.xlsx')).toBe(true)
  })

  it('should return true for .xls files with uppercase extension', () => {
    expect(isExcel('test.XLS')).toBe(true)
  })

  it('should return true for .xlsx files with uppercase extension', () => {
    expect(isExcel('test.XLSX')).toBe(true)
  })

  it('should return true for .xls files with mixed case extension', () => {
    expect(isExcel('test.XlS')).toBe(true)
  })

  it('should return true for .xlsx files with mixed case extension', () => {
    expect(isExcel('test.XlSx')).toBe(true)
  })

  it('should return false for .pdf files', () => {
    expect(isExcel('test.pdf')).toBe(false)
  })

  it('should return false for .csv files', () => {
    expect(isExcel('test.csv')).toBe(false)
  })

  it('should return false for .txt files', () => {
    expect(isExcel('test.txt')).toBe(false)
  })

  it('should return false for .doc files', () => {
    expect(isExcel('test.doc')).toBe(false)
  })

  it('should return false for files with no extension', () => {
    expect(isExcel('test')).toBe(false)
  })

  it('should handle filenames with paths', () => {
    expect(isExcel('/path/to/test.xlsx')).toBe(true)
    expect(isExcel('/path/to/test.pdf')).toBe(false)
  })

  it('should handle filenames with multiple dots', () => {
    expect(isExcel('test.file.name.xls')).toBe(true)
    expect(isExcel('test.file.name.xlsx')).toBe(true)
    expect(isExcel('test.file.name.pdf')).toBe(false)
  })

  it('should return false for files that contain xls but do not end with it', () => {
    expect(isExcel('test.xlsx.backup')).toBe(false)
    expect(isExcel('test.xls.old')).toBe(false)
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
