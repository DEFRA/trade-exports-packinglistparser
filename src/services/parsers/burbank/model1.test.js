import { describe, it, expect } from 'vitest'
import { parse, isHeaderRow } from './model1.js'
import parserModel from '../../parser-model.js'

const ESTABLISHMENT_NUMBER = 'RMS-GB-000219-001'
const DESCRIPTION_HEADER = 'Description of goods'
const NATURE_HEADER = 'Nature of Product'
const TREATMENT_HEADER = 'Type of Treatment'
const PACKAGES_HEADER = 'No. of packages'
const NET_WEIGHT_HEADER = 'Item Net Weight (kgs)'
const COMMODITY_CODE_HEADER = 'Commodity code'

const validModel = {
  Revised: [
    { A: 'GC Ref: RMS/2026/1721152382262' },
    {
      A: 'Item',
      B: 'Product code',
      C: COMMODITY_CODE_HEADER,
      F: DESCRIPTION_HEADER,
      G: 'Country of Origin',
      H: PACKAGES_HEADER,
      I: 'Type of packages',
      K: NET_WEIGHT_HEADER,
      M: 'NIIRMS Dispatch number',
      N: NATURE_HEADER,
      O: TREATMENT_HEADER,
      P: 'NIRMS Red/Green Lane'
    },
    {
      A: '1',
      C: '709999090',
      F: 'Herb Lovage x1kg',
      G: 'IT',
      H: '2',
      I: 'Cases',
      K: '2',
      M: ESTABLISHMENT_NUMBER,
      N: 'Chilled',
      O: 'Raw',
      P: 'Green'
    },
    {
      A: '2',
      C: '702000007',
      F: 'Tomato Cherry Mixed x9x250gm',
      G: 'ES',
      H: '10',
      I: 'Cases',
      K: '22.5',
      M: ESTABLISHMENT_NUMBER,
      N: 'Chilled',
      O: 'Raw',
      P: 'Green'
    }
  ],
  References: [{ A: 'Country of Origin', B: 'ISO Code' }],
  Lookups: [{ A: 'Incoterms' }],
  Meursing: [{ I: 'Sucrose' }]
}

const validHeadersNoData = {
  Revised: [
    { M: ESTABLISHMENT_NUMBER },
    {
      C: COMMODITY_CODE_HEADER,
      F: DESCRIPTION_HEADER,
      H: PACKAGES_HEADER,
      K: NET_WEIGHT_HEADER,
      N: NATURE_HEADER,
      O: TREATMENT_HEADER
    }
  ]
}

describe('BURBANK1 parser', () => {
  it('parses valid model', () => {
    const result = parse(validModel)

    expect(result.parserModel).toBe(parserModel.BURBANK1)
    expect(result.registration_approval_number).toBe(ESTABLISHMENT_NUMBER)
    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items.length).toBeGreaterThanOrEqual(1)
    expect(result.items[0].description).toBe('Herb Lovage x1kg')
  })

  it('sets validateCountryOfOrigin to true', () => {
    const result = parse(validModel)

    expect(result.validateCountryOfOrigin).toBe(true)
  })

  it('extracts commodity_code for each item', () => {
    const result = parse(validModel)

    expect(result.items[0].commodity_code).toBe('709999090')
    expect(result.items[1].commodity_code).toBe('702000007')
  })

  it('extracts country_of_origin for each item', () => {
    const result = parse(validModel)

    expect(result.items[0].country_of_origin).toBe('IT')
    expect(result.items[1].country_of_origin).toBe('ES')
  })

  it('extracts NIRMS Green lane value', () => {
    const result = parse(validModel)

    expect(result.items[0].nirms).toBe('Green')
    expect(result.items[1].nirms).toBe('Green')
  })

  it('extracts NIRMS Red lane value', () => {
    const model = buildModelWithItems([buildItem({ P: 'Red', G: 'IT' })])
    const result = parse(model)

    expect(result.items[0].nirms).toBe('Red')
  })

  it('extracts null NIRMS when cell is empty', () => {
    const model = buildModelWithItems([buildItem({ P: null, G: 'IT' })])
    const result = parse(model)

    expect(result.items[0].nirms).toBeNull()
  })

  it('extracts invalid NIRMS value as-is', () => {
    const model = buildModelWithItems([buildItem({ P: 'INVALID', G: 'GB' })])
    const result = parse(model)

    expect(result.items[0].nirms).toBe('INVALID')
  })

  it('extracts null country_of_origin when cell is empty', () => {
    const model = buildModelWithItems([buildItem({ G: null, P: 'Green' })])
    const result = parse(model)

    expect(result.items[0].country_of_origin).toBeNull()
  })

  it('extracts X as a country_of_origin value', () => {
    const model = buildModelWithItems([buildItem({ G: 'X', P: 'Green' })])
    const result = parse(model)

    expect(result.items[0].country_of_origin).toBe('X')
  })

  it('parses valid headers with no data', () => {
    const result = parse(validHeadersNoData)

    expect(result.parserModel).toBe(parserModel.BURBANK1)
    expect(result.registration_approval_number).toBe(ESTABLISHMENT_NUMBER)
    expect(result.items).toHaveLength(0)
  })

  it('returns NOMATCH when parse throws', () => {
    const result = parse(null)

    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.items).toEqual([])
    expect(result.registration_approval_number).toBeNull()
  })

  it('skips invalid sheets during parsing', () => {
    const result = parse(validModel)

    // Should only parse data from the Revised sheet, not References/Lookups/Meursing
    expect(result.parserModel).toBe(parserModel.BURBANK1)
    expect(
      result.items.every((item) => item.description !== 'Country of Origin')
    ).toBe(true)
  })
})

describe('isHeaderRow function', () => {
  it('returns true when all headers match patterns', () => {
    const headerItem = {
      description: DESCRIPTION_HEADER,
      nature_of_products: NATURE_HEADER,
      type_of_treatment: TREATMENT_HEADER,
      number_of_packages: PACKAGES_HEADER,
      total_net_weight_kg: NET_WEIGHT_HEADER,
      commodity_code: COMMODITY_CODE_HEADER
    }

    expect(isHeaderRow(headerItem)).toBe(true)
  })

  it('returns false when one header does not match pattern', () => {
    const item = {
      description: DESCRIPTION_HEADER,
      nature_of_products: 'Invalid Header',
      type_of_treatment: TREATMENT_HEADER,
      number_of_packages: PACKAGES_HEADER,
      total_net_weight_kg: NET_WEIGHT_HEADER,
      commodity_code: COMMODITY_CODE_HEADER
    }

    expect(isHeaderRow(item)).toBe(false)
  })

  it('returns false for a data row', () => {
    const dataItem = {
      description: 'Herb Lovage x1kg',
      nature_of_products: 'Chilled',
      type_of_treatment: 'Raw',
      number_of_packages: '2',
      total_net_weight_kg: '2',
      commodity_code: '709999090'
    }

    expect(isHeaderRow(dataItem)).toBe(false)
  })
})

/**
 * Build a Burbank model with custom data items.
 * Produces a workbook-like object with the standard Revised sheet
 * (43 empty rows + 1 header row + N data rows) plus invalid sheets.
 */
function buildModelWithItems(items) {
  const emptyRows = new Array(43).fill({})
  const headerRow = {
    A: 'Item',
    B: 'Product code',
    C: COMMODITY_CODE_HEADER,
    F: DESCRIPTION_HEADER,
    G: 'Country of Origin',
    H: PACKAGES_HEADER,
    I: 'Type of packages',
    K: NET_WEIGHT_HEADER,
    M: 'NIIRMS Dispatch number',
    N: NATURE_HEADER,
    O: TREATMENT_HEADER,
    P: 'NIRMS Red/Green Lane'
  }

  return {
    Revised: [...emptyRows, headerRow, ...items],
    References: [{ A: 'Country of Origin' }],
    Lookups: [{ A: 'Incoterms' }],
    Meursing: [{ I: 'Sucrose' }]
  }
}

/**
 * Build a single data item row with overrides.
 */
function buildItem(overrides = {}) {
  return {
    A: '1',
    C: '709999090',
    F: 'Herb Lovage x1kg',
    G: 'IT',
    H: '2',
    I: 'Cases',
    K: '2',
    M: ESTABLISHMENT_NUMBER,
    N: 'Chilled',
    O: 'Raw',
    P: 'Green',
    ...overrides
  }
}
