import { describe, it, expect, vi } from 'vitest'
import { mapParser, mapPdfNonAiParser } from './parser-map.js'
import * as regex from '../utilities/regex.js'

// Mock dependencies
vi.mock('../utilities/regex.js', () => ({
  test: vi.fn(),
  findUnit: vi.fn(),
  positionFinder: vi.fn()
}))

vi.mock('../utilities/pdf-helper.js', () => ({
  getHeaders: vi.fn()
}))

vi.mock('./model-headers-pdf.js', () => ({
  default: {
    testModel: {
      headers: {
        description: { x1: 0, x2: 100, regex: /Description/i },
        commodity_code: { x1: 100, x2: 200, regex: /Commodity/i },
        total_net_weight_kg: { x1: 200, x2: 300, regex: /Weight/i }
      },
      findUnitInHeader: false
    }
  }
}))

vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    logError: vi.fn(),
    logInfo: vi.fn(),
    logDebug: vi.fn()
  })
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

  it('should extract blanket treatment type from coordinate offset when blanketTreatmentTypeValue is configured', () => {
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
        A: 'Treatment Type:',
        B: 'Frozen'
      }
    ]

    const header = {
      regex: {
        description: /Description/i,
        commodity_code: /Commodity Code/i
      },
      blanketTreatmentTypeValue: {
        regex: /Treatment Type:/i,
        valueCellOffset: { row: 0, col: 1 }
      },
      findUnitInHeader: false
    }

    // Mock positionFinder to return the position of "Treatment Type:"
    vi.mocked(regex.positionFinder).mockReturnValue([2, 'A'])
    vi.mocked(regex.test).mockReturnValue(false)

    const result = mapParser(packingListJson, 0, 1, header)

    expect(result[0].type_of_treatment).toBe('Frozen')
    expect(regex.positionFinder).toHaveBeenCalledWith(
      packingListJson,
      /Treatment Type:/i
    )
  })

  it('should return null for blanket treatment type when position is not found', () => {
    const packingListJson = [
      {
        A: 'Description',
        B: 'Commodity Code'
      },
      {
        A: 'Test Item',
        B: '1234567890'
      }
    ]

    const header = {
      regex: {
        description: /Description/i,
        commodity_code: /Commodity Code/i
      },
      blanketTreatmentTypeValue: {
        regex: /Treatment Type:/i,
        valueCellOffset: { row: 0, col: 1 }
      },
      findUnitInHeader: false
    }

    // Mock positionFinder to return null (position not found)
    vi.mocked(regex.positionFinder).mockReturnValue([null, null])
    vi.mocked(regex.test).mockReturnValue(false)

    const result = mapParser(packingListJson, 0, 1, header)

    expect(result[0].type_of_treatment).toBe(null)
  })

  it('should prefer blanketTreatmentType regex match over blanketTreatmentTypeValue', () => {
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
        A: 'All items are processed',
        B: ''
      }
    ]

    const header = {
      regex: {
        description: /Description/i,
        commodity_code: /Commodity Code/i
      },
      blanketTreatmentType: {
        regex: /All items are processed/i,
        value: 'Processed'
      },
      blanketTreatmentTypeValue: {
        regex: /Treatment Type:/i,
        valueCellOffset: { row: 0, col: 1 }
      },
      findUnitInHeader: false
    }

    // Mock regex.test to return true for blanketTreatmentType
    vi.mocked(regex.test).mockReturnValue(true)

    const result = mapParser(packingListJson, 0, 1, header)

    // Should use blanketTreatmentType value, not call positionFinder
    expect(result[0].type_of_treatment).toBe('Processed')
  })
})

describe('mapPdfNonAiParser', () => {
  it('should be exported as a function', () => {
    expect(typeof mapPdfNonAiParser).toBe('function')
  })

  it('should extract commodity code digits and filter out 2-letter country codes', () => {
    const packingListJson = {
      content: [
        { x: 50, y: 100, str: 'Test Product' },
        { x: 150, y: 100, str: 'GB' }, // 2-letter country code should be filtered
        { x: 250, y: 100, str: '10.5' }
      ],
      pageInfo: { num: 1 }
    }

    const result = mapPdfNonAiParser(packingListJson, 'testModel', [100])

    expect(result[0].commodity_code).toBe(null)
  })

  it('should keep valid commodity codes starting with digits', () => {
    const packingListJson = {
      content: [
        { x: 50, y: 100, str: 'Test Product' },
        { x: 150, y: 100, str: '1234567890' },
        { x: 250, y: 100, str: '10.5' }
      ],
      pageInfo: { num: 1 }
    }

    const result = mapPdfNonAiParser(packingListJson, 'testModel', [100])

    expect(result[0].commodity_code).toBe('1234567890')
  })

  it('should extract first 4-14 digits from commodity code with trailing text', () => {
    const packingListJson = {
      content: [
        { x: 50, y: 100, str: 'Test Product' },
        { x: 150, y: 100, str: '02071290ABC' },
        { x: 250, y: 100, str: '10.5' }
      ],
      pageInfo: { num: 1 }
    }

    const result = mapPdfNonAiParser(packingListJson, 'testModel', [100])

    expect(result[0].commodity_code).toBe('02071290')
  })

  it('should filter out lowercase 2-letter country codes', () => {
    const packingListJson = {
      content: [
        { x: 50, y: 100, str: 'Test Product' },
        { x: 150, y: 100, str: 'gb' }, // lowercase 2-letter country code
        { x: 250, y: 100, str: '10.5' }
      ],
      pageInfo: { num: 1 }
    }

    const result = mapPdfNonAiParser(packingListJson, 'testModel', [100])

    expect(result[0].commodity_code).toBe(null)
  })

  it('should filter out mixed case 2-letter country codes', () => {
    const packingListJson = {
      content: [
        { x: 50, y: 100, str: 'Test Product' },
        { x: 150, y: 100, str: 'Gb' }, // mixed case 2-letter country code
        { x: 250, y: 100, str: '10.5' }
      ],
      pageInfo: { num: 1 }
    }

    const result = mapPdfNonAiParser(packingListJson, 'testModel', [100])

    expect(result[0].commodity_code).toBe(null)
  })

  it('should keep 3-letter codes (not country codes)', () => {
    const packingListJson = {
      content: [
        { x: 50, y: 100, str: 'Test Product' },
        { x: 150, y: 100, str: 'ABC' }, // 3-letter code should be kept
        { x: 250, y: 100, str: '10.5' }
      ],
      pageInfo: { num: 1 }
    }

    const result = mapPdfNonAiParser(packingListJson, 'testModel', [100])

    expect(result[0].commodity_code).toBe('ABC')
  })
})
