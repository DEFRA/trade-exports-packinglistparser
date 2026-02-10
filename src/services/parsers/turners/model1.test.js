import { describe, it, expect } from 'vitest'
import { parse, isHeaderRow } from './model1.js'
import parserModel from '../../parser-model.js'

const validModel = {
  PackingList_Extract: [
    {
      A: 'Description of Goods',
      B: 'Commodity code',
      C: 'No. of pkgs',
      D: 'Item Net Weight kg',
      E: 'Nature of Product',
      F: 'Type of Treatment',
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
      I: 'RMS-GB-000156-001'
    }
  ]
}

const validHeadersNoData = {
  PackingList_Extract: [
    {
      I: 'RMS-GB-000156-001'
    },
    {
      A: 'Description of Goods',
      B: 'Commodity code',
      C: 'No. of pkgs',
      D: 'Item Net Weight',
      E: 'Nature of Product',
      F: 'Type of Treatment',
      G: 'Country of Origin',
      H: 'NIRMS / NON NIRMS'
    }
  ]
}

describe('TURNERS1 parser', () => {
  it('parses valid model', () => {
    const result = parse(validModel)

    expect(result.parserModel).toBe(parserModel.TURNERS1)
    expect(result.registration_approval_number).toBe('RMS-GB-000156-001')
    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].description).toBe('Fresh Beef Mince')
    expect(result.items[0].commodity_code).toBe('02013000')
  })

  it('parses valid headers with no data', () => {
    const result = parse(validHeadersNoData)

    expect(result.parserModel).toBe(parserModel.TURNERS1)
    expect(result.registration_approval_number).toBe('RMS-GB-000156-001')
    expect(result.items).toHaveLength(0)
  })
})

describe('isHeaderRow function', () => {
  it('returns true when all headers match patterns', () => {
    const headerItem = {
      description: 'Description of Goods',
      commodity_code: 'Commodity code',
      number_of_packages: 'No. of pkgs',
      total_net_weight_kg: 'Item Net Weight',
      nature_of_products: 'Nature of Product',
      type_of_treatment: 'Type of Treatment'
    }

    expect(isHeaderRow(headerItem)).toBe(true)
  })

  it('returns false when one header does not match pattern', () => {
    const item = {
      description: 'Description of Goods',
      commodity_code: 'Invalid Header',
      number_of_packages: 'No. of pkgs',
      total_net_weight_kg: 'Item Net Weight',
      nature_of_products: 'Nature of Product',
      type_of_treatment: 'Type of Treatment'
    }

    expect(isHeaderRow(item)).toBe(false)
  })

  it('handles non-string values gracefully', () => {
    const item = {
      description: 123,
      commodity_code: 'Commodity code',
      number_of_packages: 'No. of pkgs',
      total_net_weight_kg: 'Item Net Weight',
      nature_of_products: 'Nature of Product',
      type_of_treatment: 'Type of Treatment'
    }

    expect(() => isHeaderRow(item)).not.toThrow()
    expect(isHeaderRow(item)).toBe(false)
  })
})
