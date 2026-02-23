import { describe, it, expect } from 'vitest'
import { parse, isHeaderRow } from './model1.js'
import parserModel from '../../parser-model.js'

const REGISTRATION_APPROVAL_NUMBER = 'RMS-GB-000156-001'
const DESCRIPTION_OF_GOODS_HEADER = 'Description of Goods'
const COMMODITY_CODE_HEADER = 'Commodity code'
const NUMBER_OF_PACKAGES_HEADER = 'No. of pkgs'
const ITEM_NET_WEIGHT_HEADER = 'Item Net Weight'
const NATURE_OF_PRODUCT_HEADER = 'Nature of Product'
const TYPE_OF_TREATMENT_HEADER = 'Type of Treatment'

const validModel = {
  PackingList_Extract: [
    {
      A: DESCRIPTION_OF_GOODS_HEADER,
      B: COMMODITY_CODE_HEADER,
      C: NUMBER_OF_PACKAGES_HEADER,
      D: 'Item Net Weight kg',
      E: NATURE_OF_PRODUCT_HEADER,
      F: TYPE_OF_TREATMENT_HEADER,
      G: 'Country of Origin',
      H: 'NIRMS / NON NIRMS'
    },
    {
      A: 'Fresh Beef Mince',
      B: '02013000',
      C: '10',
      D: '50.5',
      E: 'Meat Products',
      F: 'Chilled',
      G: 'IE',
      H: 'NIRMS',
      I: REGISTRATION_APPROVAL_NUMBER
    }
  ]
}

const validHeadersNoData = {
  PackingList_Extract: [
    {
      I: REGISTRATION_APPROVAL_NUMBER
    },
    {
      A: DESCRIPTION_OF_GOODS_HEADER,
      B: COMMODITY_CODE_HEADER,
      C: NUMBER_OF_PACKAGES_HEADER,
      D: ITEM_NET_WEIGHT_HEADER,
      E: NATURE_OF_PRODUCT_HEADER,
      F: TYPE_OF_TREATMENT_HEADER,
      G: 'Country of Origin',
      H: 'NIRMS / NON NIRMS'
    }
  ]
}

describe('TURNERS1 parser', () => {
  it('parses valid model', () => {
    const result = parse(validModel)

    expect(result.parserModel).toBe(parserModel.TURNERS1)
    expect(result.registration_approval_number).toBe(
      REGISTRATION_APPROVAL_NUMBER
    )
    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].description).toBe('Fresh Beef Mince')
    expect(result.items[0].commodity_code).toBe('02013000')
  })

  it('parses valid headers with no data', () => {
    const result = parse(validHeadersNoData)

    expect(result.parserModel).toBe(parserModel.TURNERS1)
    expect(result.registration_approval_number).toBe(
      REGISTRATION_APPROVAL_NUMBER
    )
    expect(result.items).toHaveLength(0)
  })

  it('returns NOMATCH when parse throws', () => {
    const result = parse(null)

    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.items).toEqual([])
    expect(result.registration_approval_number).toBeNull()
  })
})

describe('isHeaderRow function', () => {
  it('returns true when all headers match patterns', () => {
    const headerItem = {
      description: DESCRIPTION_OF_GOODS_HEADER,
      commodity_code: COMMODITY_CODE_HEADER,
      number_of_packages: NUMBER_OF_PACKAGES_HEADER,
      total_net_weight_kg: ITEM_NET_WEIGHT_HEADER,
      nature_of_products: NATURE_OF_PRODUCT_HEADER,
      type_of_treatment: TYPE_OF_TREATMENT_HEADER
    }

    expect(isHeaderRow(headerItem)).toBe(true)
  })

  it('returns false when one header does not match pattern', () => {
    const item = {
      description: DESCRIPTION_OF_GOODS_HEADER,
      commodity_code: 'Invalid Header',
      number_of_packages: NUMBER_OF_PACKAGES_HEADER,
      total_net_weight_kg: ITEM_NET_WEIGHT_HEADER,
      nature_of_products: NATURE_OF_PRODUCT_HEADER,
      type_of_treatment: TYPE_OF_TREATMENT_HEADER
    }

    expect(isHeaderRow(item)).toBe(false)
  })

  it('handles non-string values gracefully', () => {
    const item = {
      description: 123,
      commodity_code: COMMODITY_CODE_HEADER,
      number_of_packages: NUMBER_OF_PACKAGES_HEADER,
      total_net_weight_kg: ITEM_NET_WEIGHT_HEADER,
      nature_of_products: NATURE_OF_PRODUCT_HEADER,
      type_of_treatment: TYPE_OF_TREATMENT_HEADER
    }

    expect(() => isHeaderRow(item)).not.toThrow()
    expect(isHeaderRow(item)).toBe(false)
  })
})
