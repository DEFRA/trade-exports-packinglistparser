import { describe, test, expect } from 'vitest'
import parserCombine from './parser-combine.js'

describe('combineParser', () => {
  test('parses valid json', () => {
    const registrationApprovalNumber = 'test'
    const items = [
      {
        description: 'test desc',
        nature_of_products: 'products',
        type_of_treatment: 'teatment',
        commodity_code: 123,
        number_of_packages: 1,
        total_net_weight_kg: 1.2
      }
    ]
    const mockHeader = {
      findUnitInHeader: false,
      validateCountryOfOrigin: false,
      blanketNirms: false
    }
    const packingListJson = {
      registration_approval_number: registrationApprovalNumber,
      items,
      business_checks: {
        all_required_fields_present: true,
        failure_reasons: null
      },
      parserModel: 'TEST',
      establishment_numbers: [],
      unitInHeader: false,
      validateCountryOfOrigin: false,
      blanketNirms: false
    }

    const result = parserCombine.combine(
      registrationApprovalNumber,
      items,
      true,
      'TEST',
      [],
      mockHeader
    )

    expect(result).toMatchObject(packingListJson)
  })

  test('returns correct structure with null header', () => {
    const registrationApprovalNumber = 'RMS-GB-000001-001'
    const items = [
      {
        description: 'Product',
        commodity_code: '123456',
        number_of_packages: 5,
        total_net_weight_kg: 10.5
      }
    ]

    const result = parserCombine.combine(
      registrationApprovalNumber,
      items,
      true,
      'MODEL1',
      ['RMS-GB-000001-001'],
      null
    )

    expect(result).toMatchObject({
      registration_approval_number: 'RMS-GB-000001-001',
      items,
      business_checks: {
        all_required_fields_present: true,
        failure_reasons: null
      },
      parserModel: 'MODEL1',
      establishment_numbers: ['RMS-GB-000001-001'],
      unitInHeader: false,
      validateCountryOfOrigin: false,
      blanketNirms: false
    })
  })

  test('returns correct structure with validation flags', () => {
    const registrationApprovalNumber = 'RMS-GB-000002-002'
    const items = []
    const mockHeader = {
      findUnitInHeader: true,
      validateCountryOfOrigin: true,
      blanketNirms: {
        regex: /NIRMS/i,
        value: 'NIRMS'
      }
    }

    const result = parserCombine.combine(
      registrationApprovalNumber,
      items,
      false,
      'MODEL2',
      ['RMS-GB-000002-002', 'RMS-GB-000002-003'],
      mockHeader
    )

    expect(result).toMatchObject({
      registration_approval_number: 'RMS-GB-000002-002',
      items: [],
      business_checks: {
        all_required_fields_present: false,
        failure_reasons: null
      },
      parserModel: 'MODEL2',
      establishment_numbers: ['RMS-GB-000002-002', 'RMS-GB-000002-003'],
      unitInHeader: true,
      validateCountryOfOrigin: true,
      blanketNirms: {
        regex: /NIRMS/i,
        value: 'NIRMS'
      }
    })
  })

  test('handles empty establishment numbers array', () => {
    const result = parserCombine.combine(null, [], false, 'NOMATCH', [], null)

    expect(result).toMatchObject({
      registration_approval_number: null,
      items: [],
      business_checks: {
        all_required_fields_present: false,
        failure_reasons: null
      },
      parserModel: 'NOMATCH',
      establishment_numbers: [],
      unitInHeader: false,
      validateCountryOfOrigin: false,
      blanketNirms: false
    })
  })

  test('uses default empty array for establishment numbers when not provided', () => {
    const result = parserCombine.combine(
      'RMS-GB-000003-001',
      [],
      true,
      'MODEL3'
    )

    expect(result).toMatchObject({
      registration_approval_number: 'RMS-GB-000003-001',
      items: [],
      business_checks: {
        all_required_fields_present: true,
        failure_reasons: null
      },
      parserModel: 'MODEL3',
      establishment_numbers: [],
      unitInHeader: false,
      validateCountryOfOrigin: false,
      blanketNirms: false
    })
  })

  test('extracts validation flags from header correctly', () => {
    const mockHeader = {
      findUnitInHeader: true,
      validateCountryOfOrigin: false,
      blanketNirms: false,
      someOtherProperty: 'ignored'
    }

    const result = parserCombine.combine(
      'RMS-GB-000004-001',
      [],
      true,
      'MODEL4',
      [],
      mockHeader
    )

    expect(result.unitInHeader).toBe(true)
    expect(result.validateCountryOfOrigin).toBe(false)
    expect(result.blanketNirms).toBe(false)
    expect(result).not.toHaveProperty('someOtherProperty')
  })
})
