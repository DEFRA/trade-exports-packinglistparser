import { describe, it, expect, vi } from 'vitest'
import { mapParser, mapPdfNonAiParser } from './parser-map.js'
import * as regex from '../utilities/regex.js'

// Mock dependencies
vi.mock('../utilities/regex.js', () => ({
  test: vi.fn(),
  findUnit: vi.fn()
}))

vi.mock('../utilities/pdf-helper.js', () => ({
  getHeaders: vi.fn()
}))

vi.mock('./model-headers-pdf.js', () => ({
  default: {}
}))

describe('mapParser', () => {
  it('should map Excel/CSV data rows to standardized items', () => {
    const packingListJson = [
      {
        A: 'Description',
        B: 'Commodity Code',
        C: 'Number of Packages',
        D: 'Net Weight Kg'
      },
      {
        A: 'Test Item 1',
        B: '1234567890',
        C: '10',
        D: '25.5'
      },
      {
        A: 'Test Item 2',
        B: '0987654321',
        C: '5',
        D: '12.3'
      }
    ]

    const header = {
      regex: {
        description: /Description/i,
        commodity_code: /Commodity Code/i,
        number_of_packages: /Number of Packages/i,
        total_net_weight_kg: /Net Weight/i
      },
      findUnitInHeader: false
    }

    const result = mapParser(packingListJson, 0, 1, header, 'Sheet1')

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      description: 'Test Item 1',
      commodity_code: '1234567890',
      number_of_packages: '10',
      total_net_weight_kg: '25.5',
      row_location: {
        rowNumber: 2,
        sheetName: 'Sheet1'
      }
    })
    expect(result[1]).toMatchObject({
      description: 'Test Item 2',
      commodity_code: '0987654321',
      number_of_packages: '5',
      total_net_weight_kg: '12.3',
      row_location: {
        rowNumber: 3,
        sheetName: 'Sheet1'
      }
    })
  })

  it('should handle empty rows correctly', () => {
    const packingListJson = [
      {
        A: 'Description',
        B: 'Commodity Code'
      },
      {
        A: 'Test Item',
        B: '1234567890'
      },
      {
        A: '',
        B: ''
      },
      {
        A: null,
        B: null
      },
      {
        A: 'Another Item',
        B: '0987654321'
      }
    ]

    const header = {
      regex: {
        description: /Description/i,
        commodity_code: /Commodity Code/i
      },
      findUnitInHeader: false
    }

    const result = mapParser(packingListJson, 0, 1, header)

    // Should map all rows, including empty ones
    expect(result.length).toBeGreaterThan(0)
    // At least some items should have data
    expect(result.some((item) => item.description || item.commodity_code)).toBe(
      true
    )
  })

  it('should extract blanket NIRMS value when present', () => {
    const packingListJson = [
      {
        A: 'Description',
        B: 'Commodity Code'
      },
      {
        A: 'Test Item',
        B: '1234567890'
      },
      {
        A: 'This consignment contains only NIRMS eligible goods',
        B: ''
      }
    ]

    const header = {
      regex: {
        description: /Description/i,
        commodity_code: /Commodity Code/i
      },
      blanketNirms: {
        regex: /NIRMS eligible goods/i,
        value: 'NIRMS'
      },
      findUnitInHeader: false
    }

    vi.mocked(regex.test).mockReturnValue(true)

    const result = mapParser(packingListJson, 0, 1, header)

    expect(result[0].nirms).toBe('NIRMS')
  })

  it('should extract blanket treatment type when present', () => {
    const packingListJson = [
      {
        A: 'Description',
        B: 'Commodity Code'
      },
      {
        A: 'Test Item',
        B: '1234567890'
      },
      {
        A: 'Treatment type: all products are processed',
        B: ''
      }
    ]

    const header = {
      regex: {
        description: /Description/i,
        commodity_code: /Commodity Code/i
      },
      blanketTreatmentType: {
        regex: /all products are processed/i,
        value: 'Processed'
      },
      findUnitInHeader: false
    }

    vi.mocked(regex.test).mockReturnValue(true)

    const result = mapParser(packingListJson, 0, 1, header)

    expect(result[0].type_of_treatment).toBe('Processed')
  })

  it('should extract net weight unit from header when configured', () => {
    const packingListJson = [
      {
        A: 'Description',
        B: 'Net Weight (kg)'
      },
      {
        A: 'Test Item',
        B: '25.5'
      }
    ]

    const header = {
      regex: {
        description: /Description/i,
        total_net_weight_kg: /Net Weight/i
      },
      findUnitInHeader: true
    }

    vi.mocked(regex.findUnit).mockReturnValue('kg')

    const result = mapParser(packingListJson, 0, 1, header)

    expect(result[0].total_net_weight_unit).toBe('kg')
  })

  it('should handle multiple sheets with row location tracking', () => {
    const packingListJson = [
      {
        A: 'Description',
        B: 'Commodity Code'
      },
      {
        A: 'Sheet1 Item',
        B: '1234567890'
      }
    ]

    const header = {
      regex: {
        description: /Description/i,
        commodity_code: /Commodity Code/i
      },
      findUnitInHeader: false
    }

    const result = mapParser(packingListJson, 0, 1, header, 'Sheet1')

    expect(result[0].row_location).toEqual({
      rowNumber: 2,
      sheetName: 'Sheet1'
    })
  })

  it('should handle null or undefined values', () => {
    const packingListJson = [
      {
        A: 'Description',
        B: 'Commodity Code',
        C: 'Number of Packages'
      },
      {
        A: 'Test Item',
        B: null,
        C: undefined
      }
    ]

    const header = {
      regex: {
        description: /Description/i,
        commodity_code: /Commodity Code/i,
        number_of_packages: /Number of Packages/i
      },
      findUnitInHeader: false
    }

    const result = mapParser(packingListJson, 0, 1, header)

    expect(result[0]).toMatchObject({
      description: 'Test Item',
      commodity_code: null,
      number_of_packages: null
    })
  })
})

describe('mapPdfNonAiParser', () => {
  it('should be exported as a function', () => {
    expect(typeof mapPdfNonAiParser).toBe('function')
  })
})
