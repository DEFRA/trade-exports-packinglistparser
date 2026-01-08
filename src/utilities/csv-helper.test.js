/**
 * CSV Helper Tests
 *
 * Tests for CSV file detection and conversion utilities.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isCsv, convertCsvToJson } from './csv-helper.js'
import * as csvUtility from './csv-utility.js'

// Mock the csv-utility module
vi.mock('./csv-utility.js', () => ({
  convertCsvToJson: vi.fn()
}))

describe('isCsv', () => {
  it('should return true for .csv files', () => {
    expect(isCsv('test.csv')).toBe(true)
  })

  it('should return true for .csv files with uppercase extension', () => {
    expect(isCsv('test.CSV')).toBe(true)
  })

  it('should return true for .csv files with mixed case extension', () => {
    expect(isCsv('test.CsV')).toBe(true)
  })

  it('should return false for .xlsx files', () => {
    expect(isCsv('test.xlsx')).toBe(false)
  })

  it('should return false for .xls files', () => {
    expect(isCsv('test.xls')).toBe(false)
  })

  it('should return false for .pdf files', () => {
    expect(isCsv('test.pdf')).toBe(false)
  })

  it('should return false for .txt files', () => {
    expect(isCsv('test.txt')).toBe(false)
  })

  it('should return false for files with no extension', () => {
    expect(isCsv('test')).toBe(false)
  })

  it('should handle filenames with paths', () => {
    expect(isCsv('/path/to/test.csv')).toBe(true)
    expect(isCsv('/path/to/test.pdf')).toBe(false)
  })

  it('should handle filenames with multiple dots', () => {
    expect(isCsv('test.file.name.csv')).toBe(true)
    expect(isCsv('test.file.name.xlsx')).toBe(false)
  })

  it('should return false for files that contain csv but do not end with it', () => {
    expect(isCsv('test.csv.backup')).toBe(false)
    expect(isCsv('test.csv.old')).toBe(false)
    expect(isCsv('csvfile.txt')).toBe(false)
  })

  it('should handle Windows-style paths', () => {
    expect(isCsv('C:\\Users\\test\\file.csv')).toBe(true)
    expect(isCsv('C:\\Users\\test\\file.xlsx')).toBe(false)
  })

  it('should handle empty string', () => {
    expect(isCsv('')).toBe(false)
  })

  it('should handle filenames with special characters', () => {
    expect(isCsv('test-file_2023.csv')).toBe(true)
    expect(isCsv('test (1).csv')).toBe(true)
    expect(isCsv('test@file.csv')).toBe(true)
  })
})

describe('convertCsvToJson', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call convertCsvToJsonUtil with Buffer input', async () => {
    const mockBuffer = Buffer.from('col1,col2\nval1,val2')
    const mockResult = [
      ['col1', 'col2'],
      ['val1', 'val2']
    ]

    vi.mocked(csvUtility.convertCsvToJson).mockResolvedValue(mockResult)

    const result = await convertCsvToJson(mockBuffer)

    expect(csvUtility.convertCsvToJson).toHaveBeenCalledWith(mockBuffer)
    expect(result).toEqual(mockResult)
  })

  it('should call convertCsvToJsonUtil with string path input', async () => {
    const mockFilePath = '/path/to/file.csv'
    const mockResult = [
      ['header1', 'header2'],
      ['data1', 'data2']
    ]

    vi.mocked(csvUtility.convertCsvToJson).mockResolvedValue(mockResult)

    const result = await convertCsvToJson(mockFilePath)

    expect(csvUtility.convertCsvToJson).toHaveBeenCalledWith(mockFilePath)
    expect(result).toEqual(mockResult)
  })

  it('should handle Readable stream input', async () => {
    const mockStream = { readable: true }
    const mockResult = [['col1'], ['val1']]

    vi.mocked(csvUtility.convertCsvToJson).mockResolvedValue(mockResult)

    const result = await convertCsvToJson(mockStream)

    expect(csvUtility.convertCsvToJson).toHaveBeenCalledWith(mockStream)
    expect(result).toEqual(mockResult)
  })

  it('should return empty array for empty CSV', async () => {
    const mockBuffer = Buffer.from('')
    const mockResult = []

    vi.mocked(csvUtility.convertCsvToJson).mockResolvedValue(mockResult)

    const result = await convertCsvToJson(mockBuffer)

    expect(result).toEqual([])
  })

  it('should handle CSV with headers only', async () => {
    const mockBuffer = Buffer.from('header1,header2,header3')
    const mockResult = [['header1', 'header2', 'header3']]

    vi.mocked(csvUtility.convertCsvToJson).mockResolvedValue(mockResult)

    const result = await convertCsvToJson(mockBuffer)

    expect(result).toEqual([['header1', 'header2', 'header3']])
  })

  it('should handle multi-line CSV data', async () => {
    const mockBuffer = Buffer.from(
      'col1,col2\nrow1val1,row1val2\nrow2val1,row2val2'
    )
    const mockResult = [
      ['col1', 'col2'],
      ['row1val1', 'row1val2'],
      ['row2val1', 'row2val2']
    ]

    vi.mocked(csvUtility.convertCsvToJson).mockResolvedValue(mockResult)

    const result = await convertCsvToJson(mockBuffer)

    expect(result).toHaveLength(3)
    expect(result).toEqual(mockResult)
  })

  it('should return result from convertCsvToJsonUtil', async () => {
    const mockInput = Buffer.from('test')
    const mockResult = [['test', 'data']]

    vi.mocked(csvUtility.convertCsvToJson).mockResolvedValue(mockResult)

    const result = await convertCsvToJson(mockInput)

    expect(result).toBe(mockResult)
  })

  it('should propagate errors from convertCsvToJsonUtil', async () => {
    const mockBuffer = Buffer.from('invalid')
    const mockError = new Error('CSV parsing error')

    vi.mocked(csvUtility.convertCsvToJson).mockRejectedValue(mockError)

    await expect(convertCsvToJson(mockBuffer)).rejects.toThrow(
      'CSV parsing error'
    )
  })

  it('should be called only once per invocation', async () => {
    const mockBuffer = Buffer.from('test')
    vi.mocked(csvUtility.convertCsvToJson).mockResolvedValue([])

    await convertCsvToJson(mockBuffer)

    expect(csvUtility.convertCsvToJson).toHaveBeenCalledTimes(1)
  })
})
