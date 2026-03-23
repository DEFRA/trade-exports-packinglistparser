import { describe, it, expect, vi } from 'vitest'
import {
  mapParser,
  mapPdfNonAiParser,
  extractBlanketValuesPdf,
  deriveBoundaryFromRegex,
  discoverHeaderBoundaries,
  expandBoundariesToMidpoints
} from './parser-map.js'
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
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  })
}))

vi.mock('../common/helpers/logging/error-logger.js', () => ({
  formatError: vi.fn((err) => err)
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

describe('extractBlanketValuesPdf', () => {
  it('should extract value from next row below header within X boundary', () => {
    const pageContent = [
      { x: 375, y: 195, str: 'Type of Treatment' },
      { x: 375, y: 210, str: 'FRESH' }
    ]

    const blanketValue = {
      regex: /Type of Treatment/i,
      x1: 360,
      x2: 400,
      maxHeadersY: 250
    }

    const result = extractBlanketValuesPdf(pageContent, blanketValue)

    expect(result).toBe('FRESH')
  })

  it('should return null when header is not found', () => {
    const pageContent = [{ x: 375, y: 210, str: 'FRESH' }]

    const blanketValue = {
      regex: /Type of Treatment/i,
      x1: 360,
      x2: 400,
      maxHeadersY: 250
    }

    const result = extractBlanketValuesPdf(pageContent, blanketValue)

    expect(result).toBe(null)
  })

  it('should return null when value is outside X boundary', () => {
    const pageContent = [
      { x: 375, y: 195, str: 'Type of Treatment' },
      { x: 100, y: 210, str: 'FRESH' } // x is outside x1-x2 range
    ]

    const blanketValue = {
      regex: /Type of Treatment/i,
      x1: 360,
      x2: 400,
      maxHeadersY: 250
    }

    const result = extractBlanketValuesPdf(pageContent, blanketValue)

    expect(result).toBe(null)
  })

  it('should return null when value Y exceeds maxHeadersY', () => {
    const pageContent = [
      { x: 375, y: 195, str: 'Type of Treatment' },
      { x: 375, y: 260, str: 'FRESH' } // y exceeds maxHeadersY
    ]

    const blanketValue = {
      regex: /Type of Treatment/i,
      x1: 360,
      x2: 400,
      maxHeadersY: 250
    }

    const result = extractBlanketValuesPdf(pageContent, blanketValue)

    expect(result).toBe(null)
  })

  it('should return null when value Y is above header Y', () => {
    const pageContent = [
      { x: 375, y: 195, str: 'Type of Treatment' },
      { x: 375, y: 180, str: 'FRESH' } // y is above header
    ]

    const blanketValue = {
      regex: /Type of Treatment/i,
      x1: 360,
      x2: 400,
      maxHeadersY: 250
    }

    const result = extractBlanketValuesPdf(pageContent, blanketValue)

    expect(result).toBe(null)
  })

  it('should concatenate multiple items at same Y coordinate', () => {
    const pageContent = [
      { x: 375, y: 195, str: 'Type of Treatment' },
      { x: 365, y: 210, str: 'FRESH ' },
      { x: 385, y: 210, str: 'FROZEN' }
    ]

    const blanketValue = {
      regex: /Type of Treatment/i,
      x1: 360,
      x2: 400,
      maxHeadersY: 250
    }

    const result = extractBlanketValuesPdf(pageContent, blanketValue)

    expect(result).toBe('FRESH FROZEN')
  })

  it('should skip empty strings when filtering items', () => {
    const pageContent = [
      { x: 375, y: 195, str: 'Type of Treatment' },
      { x: 370, y: 210, str: '   ' }, // whitespace only
      { x: 375, y: 220, str: 'CHILLED' }
    ]

    const blanketValue = {
      regex: /Type of Treatment/i,
      x1: 360,
      x2: 400,
      maxHeadersY: 250
    }

    const result = extractBlanketValuesPdf(pageContent, blanketValue)

    expect(result).toBe('CHILLED')
  })

  it('should handle items with Y coordinate within 1 pixel tolerance', () => {
    const pageContent = [
      { x: 375, y: 195, str: 'Type of Treatment' },
      { x: 365, y: 210, str: 'FRESH' },
      { x: 385, y: 210.5, str: ' MEAT' } // within 1 pixel
    ]

    const blanketValue = {
      regex: /Type of Treatment/i,
      x1: 360,
      x2: 400,
      maxHeadersY: 250
    }

    const result = extractBlanketValuesPdf(pageContent, blanketValue)

    expect(result).toBe('FRESH MEAT')
  })

  it('should select closest Y coordinate when multiple exist', () => {
    const pageContent = [
      { x: 375, y: 195, str: 'Type of Treatment' },
      { x: 375, y: 210, str: 'FRESH' },
      { x: 375, y: 230, str: 'CHILLED' } // further down, should not be selected
    ]

    const blanketValue = {
      regex: /Type of Treatment/i,
      x1: 360,
      x2: 400,
      maxHeadersY: 250
    }

    const result = extractBlanketValuesPdf(pageContent, blanketValue)

    expect(result).toBe('FRESH')
  })

  it('should return null for empty pageContent array', () => {
    const blanketValue = {
      regex: /Type of Treatment/i,
      x1: 360,
      x2: 400,
      maxHeadersY: 250
    }

    const result = extractBlanketValuesPdf([], blanketValue)

    expect(result).toBe(null)
  })

  it('should return null and handle errors gracefully', () => {
    const blanketValue = {
      regex: null, // will cause error
      x1: 360,
      x2: 400,
      maxHeadersY: 250
    }

    const result = extractBlanketValuesPdf(
      [{ x: 375, y: 195, str: 'Test' }],
      blanketValue
    )

    expect(result).toBe(null)
  })

  it('should return null when value string results in empty after trim', () => {
    const pageContent = [
      { x: 375, y: 195, str: 'Type of Treatment' },
      { x: 375, y: 210, str: '' }
    ]

    const blanketValue = {
      regex: /Type of Treatment/i,
      x1: 360,
      x2: 400,
      maxHeadersY: 250
    }

    const result = extractBlanketValuesPdf(pageContent, blanketValue)

    expect(result).toBe(null)
  })
})

describe('deriveBoundaryFromRegex', () => {
  it('should return full item boundary when match covers entire string', () => {
    const item = { x: 100, str: 'Description of Goods', width: 80 }
    const result = deriveBoundaryFromRegex(item, /Description of Goods/i)

    expect(result).toEqual({ x1: 100, x2: 180 })
  })

  it('should return proportional boundary for partial match at start of string', () => {
    // "Co. of Origin EU Commodity Code" — 31 chars, width 121.84
    const item = {
      x: 204.42,
      str: 'Co. of Origin EU Commodity Code',
      width: 121.84
    }
    const result = deriveBoundaryFromRegex(item, /Co\. of( Origin)?/i)

    // "Co. of Origin" matches at index 0, length 13
    // charWidth = 121.84 / 31 ≈ 3.93
    // x1 = round(204.42 + 0) = 204
    // x2 = round(204.42 + 13 * 3.93) = round(204.42 + 51.09) = 256
    expect(result.x1).toBe(204)
    expect(result.x2).toBeGreaterThan(204)
    expect(result.x2).toBeLessThan(280)
  })

  it('should return proportional boundary for partial match in middle of string', () => {
    const item = {
      x: 204.42,
      str: 'Co. of Origin EU Commodity Code',
      width: 121.84
    }
    const result = deriveBoundaryFromRegex(item, /EU Commodity( Code)?/i)

    // "EU Commodity Code" matches at index 14, length 17
    // charWidth = 121.84 / 31 ≈ 3.93
    // x1 = round(204.42 + 14 * 3.93) = round(204.42 + 55.02) = 259
    // x2 = round(204.42 + 31 * 3.93) = round(204.42 + 121.84) = 326
    expect(result.x1).toBeGreaterThan(250)
    expect(result.x2).toBeGreaterThan(result.x1)
  })

  it('should produce non-overlapping boundaries for two regexes on the same merged item', () => {
    const item = {
      x: 204.42,
      str: 'Co. of Origin EU Commodity Code',
      width: 121.84
    }
    const coBoundary = deriveBoundaryFromRegex(item, /Co\. of( Origin)?/i)
    const ccBoundary = deriveBoundaryFromRegex(item, /EU Commodity( Code)?/i)

    // Country of origin boundary must end before commodity code boundary starts
    expect(coBoundary.x2).toBeLessThanOrEqual(ccBoundary.x1)
  })

  it('should fall back to deriveBoundary when regex does not match', () => {
    const item = { x: 100, str: 'Some text', width: 80 }
    const result = deriveBoundaryFromRegex(item, /No match/i)

    expect(result).toEqual({ x1: 100, x2: 180 })
  })

  it('should fall back to deriveBoundary when string is empty', () => {
    const item = { x: 100, str: '', width: 80 }
    const result = deriveBoundaryFromRegex(item, /test/i)

    expect(result).toEqual({ x1: 100, x2: 180 })
  })

  it('should fall back to deriveBoundary when width is zero', () => {
    const item = { x: 100, str: 'Description of Goods', width: 0 }
    const result = deriveBoundaryFromRegex(item, /Description/i)

    expect(result).toEqual({ x1: 100, x2: 100 })
  })

  it('should handle missing str property', () => {
    const item = { x: 100, width: 80 }
    const result = deriveBoundaryFromRegex(item, /test/i)

    expect(result).toEqual({ x1: 100, x2: 180 })
  })

  it('should handle missing width property', () => {
    const item = { x: 100, str: 'test' }
    const result = deriveBoundaryFromRegex(item, /test/i)

    expect(result).toEqual({ x1: 100, x2: 100 })
  })
})

describe('discoverHeaderBoundaries', () => {
  it('should return boundaries for separate header items', () => {
    const pageContent = [
      { x: 75, y: 219, str: 'Description of Goods', width: 76 },
      { x: 255, y: 219, str: 'EU Commodity Code', width: 74 },
      { x: 339, y: 219, str: 'Treatment Type', width: 55 }
    ]

    const modelHeaders = {
      description: { regex: /Description of Goods/i },
      commodity_code: { regex: /EU Commodity( Code)?/i },
      type_of_treatment: { regex: /Treatment Type/i }
    }

    const result = discoverHeaderBoundaries(pageContent, modelHeaders)

    expect(result).not.toBeNull()
    expect(result.description.x1).toBe(75)
    expect(result.commodity_code.x1).toBe(255)
    expect(result.type_of_treatment.x1).toBe(339)
  })

  it('should return null when a header is missing', () => {
    const pageContent = [
      { x: 75, y: 219, str: 'Description of Goods', width: 76 }
    ]

    const modelHeaders = {
      description: { regex: /Description of Goods/i },
      commodity_code: { regex: /EU Commodity( Code)?/i }
    }

    const result = discoverHeaderBoundaries(pageContent, modelHeaders)

    expect(result).toBeNull()
  })

  it('should produce correct boundaries when headers are merged into one string', () => {
    const pageContent = [
      { x: 75, y: 219, str: 'Description of Goods', width: 76 },
      {
        x: 204.42,
        y: 233.92,
        str: 'Co. of Origin EU Commodity Code',
        width: 121.84
      },
      { x: 339, y: 219, str: 'Treatment Type', width: 55 }
    ]

    const modelHeaders = {
      description: { regex: /Description of Goods/i },
      commodity_code: { regex: /EU Commodity( Code)?/i },
      type_of_treatment: { regex: /Treatment Type/i }
    }

    const result = discoverHeaderBoundaries(pageContent, modelHeaders)

    expect(result).not.toBeNull()
    // Description should use its own item boundary
    expect(result.description.x1).toBe(75)
    // Commodity code should use proportional boundary within the merged string
    // not the whole merged item's x
    expect(result.commodity_code.x1).toBeGreaterThan(204)
    expect(result.type_of_treatment.x1).toBe(339)
  })

  it('should include regex in returned boundaries', () => {
    const pageContent = [
      { x: 75, y: 219, str: 'Description of Goods', width: 76 }
    ]

    const modelHeaders = {
      description: { regex: /Description of Goods/i }
    }

    const result = discoverHeaderBoundaries(pageContent, modelHeaders)

    expect(result.description.regex).toEqual(/Description of Goods/i)
  })
})

describe('expandBoundariesToMidpoints', () => {
  it('should expand boundaries using midpoints between adjacent columns', () => {
    const boundaries = {
      description: { x1: 75, x2: 151 },
      commodity_code: { x1: 255, x2: 326 },
      nirms: { x1: 407, x2: 431 },
      number_of_packages: { x1: 448, x2: 486 }
    }

    const result = expandBoundariesToMidpoints(boundaries)

    // Description (leftmost): x1 padded left, x2 = midpoint with commodity - 1
    expect(result.description.x1).toBe(65)
    expect(result.description.x2).toBe(Math.floor((151 + 255) / 2) - 1)
    // Commodity: between description and nirms
    expect(result.commodity_code.x1).toBe(Math.floor((151 + 255) / 2))
    expect(result.commodity_code.x2).toBe(Math.floor((326 + 407) / 2) - 1)
    // NIRMS: between commodity and packages
    expect(result.nirms.x1).toBe(Math.floor((326 + 407) / 2))
    expect(result.nirms.x2).toBe(Math.floor((431 + 448) / 2) - 1)
    // Number of packages (rightmost): x2 padded right
    expect(result.number_of_packages.x1).toBe(Math.floor((431 + 448) / 2))
    expect(result.number_of_packages.x2).toBe(496)
  })

  it('should allow NIRMS data slightly left of header to be captured', () => {
    const boundaries = {
      type_of_treatment: { x1: 339, x2: 394 },
      nirms: { x1: 407, x2: 431 },
      number_of_packages: { x1: 448, x2: 486 }
    }

    const result = expandBoundariesToMidpoints(boundaries)

    // NIRMS x1 should be at midpoint between type_of_treatment end and nirms start
    // midpoint = floor((394 + 407) / 2) = 400
    expect(result.nirms.x1).toBe(400)
    // Data at x=399.62 rounds to 400, which is >= 400
    expect(Math.round(399.62) >= result.nirms.x1).toBe(true)
  })

  it('should return empty object for empty input', () => {
    const result = expandBoundariesToMidpoints({})
    expect(result).toEqual({})
  })

  it('should preserve additional properties on boundaries', () => {
    const boundaries = {
      description: { x1: 75, x2: 151, regex: /Description/i }
    }

    const result = expandBoundariesToMidpoints(boundaries)

    expect(result.description.regex).toEqual(/Description/i)
  })

  it('should handle single column with edge padding', () => {
    const boundaries = {
      description: { x1: 100, x2: 200 }
    }

    const result = expandBoundariesToMidpoints(boundaries)

    expect(result.description.x1).toBe(90)
    expect(result.description.x2).toBe(210)
  })

  it('should use custom edge padding', () => {
    const boundaries = {
      description: { x1: 100, x2: 200 }
    }

    const result = expandBoundariesToMidpoints(boundaries, 20)

    expect(result.description.x1).toBe(80)
    expect(result.description.x2).toBe(220)
  })

  it('should not produce overlapping boundaries between adjacent columns', () => {
    const boundaries = {
      col_a: { x1: 100, x2: 150 },
      col_b: { x1: 160, x2: 200 },
      col_c: { x1: 210, x2: 260 }
    }

    const result = expandBoundariesToMidpoints(boundaries)

    // col_a.x2 must be strictly less than col_b.x1
    expect(result.col_a.x2).toBeLessThan(result.col_b.x1)
    // col_b.x2 must be strictly less than col_c.x1
    expect(result.col_b.x2).toBeLessThan(result.col_c.x1)
  })

  it('should clamp leftmost x1 to 0 when edge padding exceeds position', () => {
    const boundaries = {
      col_a: { x1: 5, x2: 50 }
    }

    const result = expandBoundariesToMidpoints(boundaries)

    expect(result.col_a.x1).toBe(0)
  })
})
