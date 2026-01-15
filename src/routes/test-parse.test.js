import { describe, it, expect, beforeEach, vi } from 'vitest'
import { STATUS_CODES } from './statuscodes.js'
import path from 'node:path'
import { testRoute } from './test-parse.js'
import { parsePackingList } from '../services/parser-service.js'
import { convertExcelToJson } from '../utilities/excel-utility.js'
import { isPdf } from '../utilities/file-extension.js'
import fs from 'node:fs/promises'

// Mock the dependencies - must be before imports
vi.mock('../services/parser-service.js', () => ({
  parsePackingList: vi.fn()
}))

vi.mock('../utilities/excel-utility.js', () => ({
  convertExcelToJson: vi.fn()
}))

vi.mock('../utilities/file-extension.js', () => ({
  isPdf: vi.fn()
}))

vi.mock('node:fs/promises', () => ({
  default: {
    readFile: vi.fn()
  }
}))

describe('Test Parse Route', () => {
  let mockRequest
  let mockH
  let mockResponse
  const plDirectory = path.join(process.cwd(), '/src/packing-lists/')

  beforeEach(() => {
    mockResponse = {
      code: vi.fn().mockReturnThis()
    }
    mockH = {
      response: vi.fn().mockReturnValue(mockResponse)
    }
    mockRequest = {
      query: {
        filename: 'test-file.xlsx'
      }
    }

    vi.clearAllMocks()
  })

  it('should have correct route configuration', () => {
    expect(testRoute.method).toBe('GET')
    expect(testRoute.path).toBe('/test-parse')
    expect(typeof testRoute.handler).toBe('function')
  })

  describe('handler', () => {
    it('should return success response when parsing succeeds', async () => {
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
      const expectedFilePath = path.join(plDirectory, 'test-file.xlsx')

      convertExcelToJson.mockReturnValue(mockPayload)
      parsePackingList.mockResolvedValue(mockResult)

      await testRoute.handler(mockRequest, mockH)

      expect(convertExcelToJson).toHaveBeenCalledWith({
        sourceFile: expectedFilePath
      })
      expect(parsePackingList).toHaveBeenCalledWith(
        mockPayload,
        expectedFilePath
      )
      expect(mockH.response).toHaveBeenCalledWith({
        success: true,
        result: mockResult
      })
      expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
    })

    it('should handle different filenames correctly', async () => {
      mockRequest.query.filename = 'different-file.xls'
      const mockPayload = { Sheet1: [] }
      const mockResult = { parserModel: 'NOMATCH', items: [] }
      const expectedFilePath = path.join(plDirectory, 'different-file.xls')

      convertExcelToJson.mockReturnValue(mockPayload)
      parsePackingList.mockResolvedValue(mockResult)

      await testRoute.handler(mockRequest, mockH)

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

    it('should handle file path construction correctly', async () => {
      mockRequest.query.filename = 'subdir/nested-file.xlsx'
      const mockPayload = { Sheet1: [] }
      const mockResult = { items: [] }
      const expectedFilePath = path.join(plDirectory, 'subdir/nested-file.xlsx')

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

    // PDF-specific tests
    describe('PDF handling', () => {
      it('should successfully parse a PDF file', async () => {
        mockRequest.query.filename = 'test-packing-list.pdf'
        const mockPdfBuffer = Buffer.from('mock pdf content')
        const mockResult = {
          parserModel: 'GIOVANNI3',
          items: [{ description: 'Product A', number_of_packages: '5' }],
          business_checks: {
            all_required_fields_present: true
          },
          establishment_numbers: ['RMS-GB-000149-002']
        }
        const expectedFilePath = path.join(plDirectory, 'test-packing-list.pdf')

        isPdf.mockReturnValue(true)
        fs.readFile.mockResolvedValue(mockPdfBuffer)
        parsePackingList.mockResolvedValue(mockResult)

        await testRoute.handler(mockRequest, mockH)

        expect(isPdf).toHaveBeenCalledWith('test-packing-list.pdf')
        expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath)
        expect(parsePackingList).toHaveBeenCalledWith(
          mockPdfBuffer,
          expectedFilePath
        )
        expect(mockH.response).toHaveBeenCalledWith({
          success: true,
          result: mockResult
        })
        expect(mockResponse.code).toHaveBeenCalledWith(STATUS_CODES.OK)
      })

      it('should return error when PDF file cannot be read', async () => {
        mockRequest.query.filename = 'missing.pdf'
        const error = new Error('ENOENT: no such file or directory')

        isPdf.mockReturnValue(true)
        fs.readFile.mockRejectedValue(error)

        await testRoute.handler(mockRequest, mockH)

        expect(mockH.response).toHaveBeenCalledWith({
          success: false,
          error: 'ENOENT: no such file or directory'
        })
        expect(mockResponse.code).toHaveBeenCalledWith(
          STATUS_CODES.INTERNAL_SERVER_ERROR
        )
      })

      it('should handle PDF parsing errors gracefully', async () => {
        mockRequest.query.filename = 'corrupt.pdf'
        const mockPdfBuffer = Buffer.from('corrupted pdf')
        const error = new Error('PDF extraction failed')

        isPdf.mockReturnValue(true)
        fs.readFile.mockResolvedValue(mockPdfBuffer)
        parsePackingList.mockRejectedValue(error)

        await testRoute.handler(mockRequest, mockH)

        expect(mockH.response).toHaveBeenCalledWith({
          success: false,
          error: 'PDF extraction failed'
        })
        expect(mockResponse.code).toHaveBeenCalledWith(
          STATUS_CODES.INTERNAL_SERVER_ERROR
        )
      })
    })
  })
})
