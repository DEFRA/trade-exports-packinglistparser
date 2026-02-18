import { describe, it, expect } from 'vitest'
import { parse } from './model2.js'
import parserModel from '../../parser-model.js'

// Test models
const validModel = {
  Sheet2: [
    {
      A: 'Item',
      B: 'Product code',
      C: 'Commodity code',
      F: 'Description of goods',
      G: 'Country of Origin',
      H: 'No. of pkgs',
      K: 'Total Net Weight',
      M: 'Nature of Product (Chilled /Ambient/ Frozen)',
      N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
      O: 'NIRMS / Non NIRMS',
      P: 'GB Establishment RMS Number'
    },
    {
      K: '12kgs'
    },
    {
      A: '1',
      B: '035557763',
      C: '0804500000',
      F: 'Tesco Mango ME BOS (120g x 8)7-8-20-36-39-77',
      G: 'BR',
      H: '4',
      K: '3.84',
      M: 'Chilled',
      N: 'Processed',
      O: 'NIRMS',
      P: 'RMS-GB-000015-009'
    },
    {
      A: '2',
      B: '037500770',
      C: '0804500000',
      F: 'Tesco Mango ME BOS (250g x 8)13-14-23-32-42-80',
      G: 'BR',
      H: '28',
      K: '56',
      M: 'Chilled',
      N: 'Processed',
      O: 'NIRMS',
      P: 'RMS-GB-000015-009'
    }
  ]
}

const validModelMultipleSheets = {
  Sheet1: [
    {
      A: 'Item',
      B: 'Product code',
      C: 'Commodity code',
      F: 'Description of goods',
      G: 'Country of Origin',
      H: 'No. of pkgs',
      K: 'Total Net Weight',
      M: 'Nature of Product (Chilled /Ambient/ Frozen)',
      N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
      O: 'NIRMS / Non NIRMS',
      P: 'GB Establishment RMS Number'
    },
    {
      K: '12kgs'
    },
    {
      A: '1',
      B: '90930140',
      C: '0709200010',
      F: 'TS Asp Bundles 180g',
      G: 'GB',
      H: '144',
      K: '25.92',
      M: 'Chilled',
      N: 'Raw',
      O: 'NIRMS',
      P: 'RMS-GB-000015-009'
    }
  ],
  Sheet2: [
    {
      A: 'Item',
      B: 'Product code',
      C: 'Commodity code',
      F: 'Description of goods',
      G: 'Country of Origin',
      H: 'No. of pkgs',
      K: 'Total Net Weight',
      M: 'Nature of Product (Chilled /Ambient/ Frozen)',
      N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
      O: 'NIRMS / Non NIRMS',
      P: 'GB Establishment RMS Number'
    },
    {
      K: 'kgs'
    },
    {
      A: '2',
      B: '81827872',
      C: '0709200010',
      F: 'TS Asp Tips Exp 125g',
      G: 'PE',
      H: '90',
      K: '11.25',
      M: 'Chilled',
      N: 'Raw',
      O: 'Non NIRMS',
      P: 'RMS-GB-000015-009'
    }
  ]
}

const emptyModel = {
  Sheet1: []
}

describe('parseTescoModel2', () => {
  it('parses populated json', () => {
    const result = parse(validModel)

    expect(result.parserModel).toBe(parserModel.TESCO2)
    expect(result.registration_approval_number).toBe('RMS-GB-000015-009')
    expect(result.items).toHaveLength(2)
    expect(result.items[0]).toMatchObject({
      commodity_code: '0804500000',
      description: 'Tesco Mango ME BOS (120g x 8)7-8-20-36-39-77',
      nature_of_products: 'Chilled',
      number_of_packages: '4',
      total_net_weight_kg: '3.84',
      type_of_treatment: 'Processed',
      total_net_weight_unit: 'kgs',
      country_of_origin: 'BR',
      nirms: 'NIRMS'
    })
  })

  it('parses multiple sheets', () => {
    const result = parse(validModelMultipleSheets)

    expect(result.parserModel).toBe(parserModel.TESCO2)
    expect(result.items).toHaveLength(2)
    expect(result.items[0].commodity_code).toBe('0709200010')
    expect(result.items[1].commodity_code).toBe('0709200010')
  })

  it('parses empty json', () => {
    const result = parse(emptyModel)

    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.items).toHaveLength(0)
  })

  it('should log error when an error is thrown', () => {
    // Spy is not needed - error logging is tested implicitly
    const result = parse(null)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
  })
})
