import Hapi from '@hapi/hapi'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { STATUS_CODES } from './statuscodes.js'
import path from 'node:path'
import { testRoute } from './test-parse.js'
import { parsePackingList } from '../services/parser-service.js'
import { convertExcelToJson } from '../utilities/excel-utility.js'
import { convertCsvToJson } from '../utilities/csv-utility.js'
import { isCsv, isPdf } from '../utilities/file-extension.js'
import fs from 'node:fs'

const { mockPdfExtractBuffer } = vi.hoisted(() => ({
  mockPdfExtractBuffer: vi.fn()
}))

const MOCK_PDF_CONTENT = 'mock pdf content'
const INVALID_FILENAME_ERROR_MESSAGE = 'Invalid filename'
const DEFAULT_FILENAME_QUERY = 'filename=test-file.xlsx'
const PDF_FILENAME_QUERY = 'filename=test-file.pdf'

vi.mock('../services/parser-service.js', () => ({
  parsePackingList: vi.fn()
}))

vi.mock('../utilities/excel-utility.js', () => ({
  convertExcelToJson: vi.fn()
}))

vi.mock('../utilities/csv-utility.js', () => ({
  convertCsvToJson: vi.fn()
}))

vi.mock('../utilities/file-extension.js', () => ({
  isCsv: vi.fn(),
  isPdf: vi.fn()
}))

vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(),
    statSync: vi.fn()
  }
}))

vi.mock('pdf.js-extract', () => ({
  PDFExtract: vi.fn(() => ({
    extractBuffer: mockPdfExtractBuffer
  }))
}))

let server
let mockRequest, mockH, mockResponse, plDirectory

async function injectTestParse(query = DEFAULT_FILENAME_QUERY) {
  return server.inject({
    method: 'GET',
    url: `/test-parse?${query}`
  })
}

describe('Test Parse Route', () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    server = Hapi.server()
    server.route(testRoute)
    await server.initialize()

    // Default to Excel path unless a test explicitly sets CSV/PDF behavior.
    isCsv.mockReturnValue(false)
    isPdf.mockReturnValue(false)
    fs.statSync.mockReturnValue({ isFile: () => true })

    plDirectory = path.join(process.cwd(), '/src/packing-lists/')
    mockResponse = { code: vi.fn() }
    mockH = { response: vi.fn().mockReturnValue(mockResponse) }
    mockRequest = { query: { filename: 'test-file.xlsx' } }
  })

  afterEach(async () => {
    await server.stop()
  })

  it('should have correct route configuration', () => {
    expect(testRoute.method).toBe('GET')
    expect(testRoute.path).toBe('/test-parse')
    expect(typeof testRoute.handler).toBe('function')
  })

  describe('handler via server.inject', () => {
    it('should return success response when excel parsing succeeds', async () => {
      const mockPayload = {
        Sheet1: [
          { A: 'Header1', B: 'Header2' },
          { A: 'Data1', B: 'Data2' }
        ]
      }
      const mockResult = {
        parserModel: 'MODEL1',
        items: [{ description: 'Item 1' }],
        business_checks: {
          all_required_fields_present: true
        }
      }
      const expectedFilePath = path.join(
        process.cwd(),
        '/src/packing-lists/test-file.xlsx'
      )

      convertExcelToJson.mockReturnValue(mockPayload)
      parsePackingList.mockResolvedValue(mockResult)

      const response = await injectTestParse(DEFAULT_FILENAME_QUERY)

      expect(response.statusCode).toBe(STATUS_CODES.OK)
      expect(JSON.parse(response.payload)).toEqual({
        success: true,
        result: mockResult
      })
      expect(convertExcelToJson).toHaveBeenCalledWith({
        sourceFile: expectedFilePath
      })
      expect(parsePackingList).toHaveBeenCalledWith(
        mockPayload,
        expectedFilePath
      )
    })

    it('should return error response when convertExcelToJson throws error', async () => {
      const error = new Error('Failed to read Excel file')

      convertExcelToJson.mockImplementation(() => {
        throw error
      })

      await testRoute.handler(mockRequest, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to read Excel file'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(
        STATUS_CODES.INTERNAL_SERVER_ERROR
      )
    })

    it('should return error response when parsePackingList throws error', async () => {
      const mockPayload = { Sheet1: [] }
      const error = new Error('Parsing failed')

      convertExcelToJson.mockReturnValue(mockPayload)
      parsePackingList.mockRejectedValue(error)

      await testRoute.handler(mockRequest, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        success: false,
        error: 'Parsing failed'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(
        STATUS_CODES.INTERNAL_SERVER_ERROR
      )
    })

    it('should sanitize file path to prevent traversal attacks', async () => {
      mockRequest.query.filename = 'subdir/nested-file.xlsx'
      const mockPayload = { Sheet1: [] }
      const mockResult = { items: [] }
      // Should strip the subdirectory and only use basename
      const expectedFilePath = path.join(plDirectory, 'nested-file.xlsx')

      convertExcelToJson.mockReturnValue(mockPayload)
      parsePackingList.mockResolvedValue(mockResult)

      await testRoute.handler(mockRequest, mockH)

      expect(convertExcelToJson).toHaveBeenCalledWith({
        sourceFile: expectedFilePath
      })
    })

    it('should prevent path traversal attacks', async () => {
      mockRequest.query.filename = '../../etc/passwd'
      const mockPayload = { Sheet1: [] }
      const mockResult = { items: [] }
      // Should strip the path traversal and only use basename
      const expectedFilePath = path.join(plDirectory, 'passwd')

      convertExcelToJson.mockReturnValue(mockPayload)
      parsePackingList.mockResolvedValue(mockResult)

      await testRoute.handler(mockRequest, mockH)

      expect(convertExcelToJson).toHaveBeenCalledWith({
        sourceFile: expectedFilePath
      })
    })

    it('should handle generic errors gracefully', async () => {
      const error = new Error('Unexpected error')

      convertExcelToJson.mockImplementation(() => {
        throw error
      })

      await testRoute.handler(mockRequest, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        success: false,
        error: 'Unexpected error'
      })
      expect(mockResponse.code).toHaveBeenCalledWith(
        STATUS_CODES.INTERNAL_SERVER_ERROR
      )
    })

    it('should process complete workflow for valid packing list', async () => {
      const mockPayload = {
        Sheet1: [
          { A: 'Description', B: 'Quantity', C: 'Weight' },
          { A: 'Product 1', B: '10', C: '50.5' },
          { A: 'Product 2', B: '5', C: '25.0' }
        ]
      }
      const mockResult = {
        parserModel: 'ASDA3',
        items: [
          {
            description: 'Product 1',
            number_of_packages: '10',
            total_net_weight_kg: '50.5'
          },
          {
            description: 'Product 2',
            number_of_packages: '5',
            total_net_weight_kg: '25.0'
          }
        ],
        business_checks: {
          all_required_fields_present: true,
          failure_reasons: null
        }
      }

      convertExcelToJson.mockReturnValue(mockPayload)
      parsePackingList.mockResolvedValue(mockResult)

      await testRoute.handler(mockRequest, mockH)

      expect(convertExcelToJson).toHaveBeenCalledTimes(1)
      expect(parsePackingList).toHaveBeenCalledTimes(1)
      expect(mockH.response).toHaveBeenCalledWith({
        success: true,
        result: mockResult
      })
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })

    it('should handle CSV files correctly', async () => {
      mockRequest.query.filename = 'test-file.csv'
      const mockCsvBuffer = Buffer.from('header1,header2\nvalue1,value2')
      const mockCsvPayload = [{ header1: 'value1', header2: 'value2' }]
      const mockResult = {
        parserModel: 'ICELAND2',
        items: [{ description: 'Item 1' }]
      }
      const expectedFilePath = path.join(
        process.cwd(),
        '/src/packing-lists/test-file.csv'
      )

      isCsv.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(mockCsvBuffer)
      convertCsvToJson.mockResolvedValue(mockCsvPayload)
      parsePackingList.mockResolvedValue(mockResult)

      const response = await injectTestParse('filename=test-file.csv')

      expect(response.statusCode).toBe(STATUS_CODES.OK)
      expect(JSON.parse(response.payload)).toEqual({
        success: true,
        result: mockResult
      })
      expect(fs.readFileSync).toHaveBeenCalledWith(expectedFilePath)
      expect(convertCsvToJson).toHaveBeenCalledWith(mockCsvBuffer)
      expect(parsePackingList).toHaveBeenCalledWith(
        mockCsvPayload,
        expectedFilePath
      )
    })

    it('should return PDF JSON when returnPdfJson=true and file is pdf', async () => {
      const expectedFilePath = path.join(
        process.cwd(),
        '/src/packing-lists/test-file.pdf'
      )
      const pdfExtractResult = { pages: [{ content: [] }] }

      isPdf.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(MOCK_PDF_CONTENT)
      mockPdfExtractBuffer.mockResolvedValue(pdfExtractResult)

      const response = await injectTestParse(
        `${PDF_FILENAME_QUERY}&returnPdfJson=true`
      )

      expect(response.statusCode).toBe(STATUS_CODES.OK)
      expect(JSON.parse(response.payload)).toEqual({
        success: true,
        result: pdfExtractResult
      })
      expect(fs.readFileSync).toHaveBeenCalledWith(expectedFilePath)
      expect(mockPdfExtractBuffer).toHaveBeenCalledWith(MOCK_PDF_CONTENT)
      expect(parsePackingList).not.toHaveBeenCalled()
    })

    it('should return 400 when returnPdfJson=true but file is not pdf', async () => {
      isPdf.mockReturnValue(false)

      const response = await injectTestParse(
        `${DEFAULT_FILENAME_QUERY}&returnPdfJson=true`
      )

      expect(response.statusCode).toBe(STATUS_CODES.BAD_REQUEST)
      expect(JSON.parse(response.payload)).toEqual({
        success: false,
        error: INVALID_FILENAME_ERROR_MESSAGE
      })
    })

    it('should return 400 for invalid filename path traversal', async () => {
      fs.statSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory')
      })

      const response = await injectTestParse('filename=../secrets.txt')

      expect(response.statusCode).toBe(STATUS_CODES.BAD_REQUEST)
      expect(JSON.parse(response.payload)).toEqual({
        success: false,
        error: INVALID_FILENAME_ERROR_MESSAGE
      })
      expect(parsePackingList).not.toHaveBeenCalled()
    })

    it('should return 500 when parser throws', async () => {
      convertExcelToJson.mockReturnValue({ Sheet1: [] })
      parsePackingList.mockRejectedValue(new Error('Parser failed'))

      const response = await injectTestParse(DEFAULT_FILENAME_QUERY)

      expect(response.statusCode).toBe(STATUS_CODES.INTERNAL_SERVER_ERROR)
      expect(JSON.parse(response.payload)).toEqual({
        success: false,
        error: 'Parser failed'
      })
    })

    it('should return 500 when reading pdf fails for pdf json extraction', async () => {
      isPdf.mockReturnValue(true)
      fs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT')
      })

      const response = await injectTestParse(
        `${PDF_FILENAME_QUERY}&returnPdfJson=true`
      )

      expect(response.statusCode).toBe(STATUS_CODES.INTERNAL_SERVER_ERROR)
      expect(JSON.parse(response.payload)).toEqual({
        success: false,
        error: 'Failed to extract PDF JSON'
      })
    })

    it('should return 400 when query validation fails for missing filename', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/test-parse'
      })

      expect(response.statusCode).toBe(STATUS_CODES.BAD_REQUEST)
      expect(parsePackingList).not.toHaveBeenCalled()
    })

    it('should return 400 when query validation fails for invalid returnPdfJson', async () => {
      const response = await injectTestParse(
        `${DEFAULT_FILENAME_QUERY}&returnPdfJson=invalid`
      )

      expect(response.statusCode).toBe(STATUS_CODES.BAD_REQUEST)
      expect(parsePackingList).not.toHaveBeenCalled()
    })

    it('should return 400 when filename is not a string (direct handler call covers non-string guard)', async () => {
      const mockResponseObj = { code: vi.fn() }
      const mockH = {
        response: vi.fn().mockReturnValue(mockResponseObj)
      }
      const mockRequest = { query: { filename: null } }

      await testRoute.handler(mockRequest, mockH)

      expect(mockH.response).toHaveBeenCalledWith({
        success: false,
        error: INVALID_FILENAME_ERROR_MESSAGE
      })
      expect(mockResponseObj.code).toHaveBeenCalledWith(
        STATUS_CODES.BAD_REQUEST
      )
    })

    it('should return 400 when fs.statSync throws during file resolution', async () => {
      fs.statSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory')
      })

      const response = await injectTestParse(DEFAULT_FILENAME_QUERY)

      expect(response.statusCode).toBe(STATUS_CODES.BAD_REQUEST)
      expect(JSON.parse(response.payload)).toEqual({
        success: false,
        error: INVALID_FILENAME_ERROR_MESSAGE
      })
    })

    it('should parse pdf file and return result when returnPdfJson is not set', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf bytes')
      const mockResult = {
        parserModel: 'MANDS1',
        items: [{ description: 'PDF Item' }]
      }
      const expectedFilePath = path.join(
        process.cwd(),
        '/src/packing-lists/test-file.pdf'
      )

      isPdf.mockReturnValue(true)
      isCsv.mockReturnValue(false)
      fs.readFileSync.mockReturnValue(mockPdfBuffer)
      parsePackingList.mockResolvedValue(mockResult)

      const response = await injectTestParse(PDF_FILENAME_QUERY)

      expect(response.statusCode).toBe(STATUS_CODES.OK)
      expect(JSON.parse(response.payload)).toEqual({
        success: true,
        result: mockResult
      })
      expect(fs.readFileSync).toHaveBeenCalledWith(expectedFilePath)
      expect(parsePackingList).toHaveBeenCalledWith(
        mockPdfBuffer,
        expectedFilePath
      )
    })
  })
})
