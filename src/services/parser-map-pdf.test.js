import { describe, it, expect, vi } from 'vitest'
import {
  mapPdfNonAiParser,
  extractBlanketValuesPdf,
  deriveBoundaryFromRegex,
  discoverHeaderBoundaries,
  expandBoundariesToMidpoints
} from './parser-map-pdf.js'

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

    // Match is "Co. of Origin" (13 chars) at index 0
    // charWidth = 121.84 / 31 ≈ 3.93
    // x1 = 204.42 + 0 * 3.93 ≈ 204
    // x2 = 204.42 + 13 * 3.93 ≈ 255
    expect(result.x1).toBe(204)
    expect(result.x2).toBeGreaterThan(result.x1)
  })

  it('should return proportional boundary for partial match in middle of string', () => {
    const item = {
      x: 204.42,
      str: 'Co. of Origin EU Commodity Code',
      width: 121.84
    }
    const result = deriveBoundaryFromRegex(item, /EU Commodity( Code)?/i)

    // Match is "EU Commodity Code" (17 chars) at index 14
    // charWidth = 121.84 / 31 ≈ 3.93
    // x1 = 204.42 + 14 * 3.93 ≈ 259
    // x2 = 204.42 + (14 + 17) * 3.93 ≈ 326
    expect(result.x1).toBeGreaterThan(250)
    expect(result.x2).toBeGreaterThan(result.x1)
  })

  it('should produce non-overlapping boundaries for adjacent matches in same string', () => {
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
    // Packages (rightmost): x1 = midpoint, x2 padded right
    expect(result.number_of_packages.x1).toBe(Math.floor((431 + 448) / 2))
    expect(result.number_of_packages.x2).toBe(496)
  })

  it('should handle real M&S boundaries including NIRMS', () => {
    const boundaries = {
      description: { x1: 75, x2: 151 },
      commodity_code: { x1: 249, x2: 326 },
      number_of_packages: { x1: 332, x2: 375 },
      total_net_weight_kg: { x1: 380, x2: 395 },
      nirms: { x1: 399.62, x2: 421 }
    }

    const result = expandBoundariesToMidpoints(boundaries)

    // NIRMS should be between total_net_weight_kg and right edge
    expect(result.nirms).toBeDefined()
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
