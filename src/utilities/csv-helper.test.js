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
  it.each([
    ['.csv files', 'test.csv', true],
    ['.csv files with uppercase extension', 'test.CSV', true],
    ['.csv files with mixed case extension', 'test.CsV', true],
    ['.xlsx files', 'test.xlsx', false],
    ['.xls files', 'test.xls', false],
    ['.pdf files', 'test.pdf', false],
    ['.txt files', 'test.txt', false],
    ['files with no extension', 'test', false],
    ['filenames with paths (csv)', '/path/to/test.csv', true],
    ['filenames with paths (pdf)', '/path/to/test.pdf', false],
    ['filenames with multiple dots (csv)', 'test.file.name.csv', true],
    ['filenames with multiple dots (xlsx)', 'test.file.name.xlsx', false],
    [
      'files that contain csv but do not end with it (backup)',
      'test.csv.backup',
      false
    ],
    [
      'files that contain csv but do not end with it (old)',
      'test.csv.old',
      false
    ],
    [
      'files that contain csv but do not end with it (name contains csv)',
      'csvfile.txt',
      false
    ],
    ['Windows-style paths (csv)', 'C:\\Users\\test\\file.csv', true],
    ['Windows-style paths (xlsx)', 'C:\\Users\\test\\file.xlsx', false],
    ['empty string', '', false],
    [
      'filenames with special characters (hyphen and underscore)',
      'test-file_2023.csv',
      true
    ],
    ['filenames with special characters (parentheses)', 'test (1).csv', true],
    ['filenames with special characters (symbol)', 'test@file.csv', true]
  ])('should handle %s', (_, filename, expected) => {
    expect(isCsv(filename)).toBe(expected)
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
