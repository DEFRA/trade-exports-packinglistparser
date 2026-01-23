import { describe, test, expect, vi } from 'vitest'
import {
  hasMissingDescription,
  hasInvalidProductCode,
  hasMissingIdentifier,
  hasMissingNetWeight,
  hasMissingPackages,
  hasMissingNirms,
  hasInvalidNirms,
  hasMissingCoO,
  hasInvalidCoO,
  hasIneligibleItems,
  wrongTypeForPackages,
  wrongTypeNetWeight,
  removeBadData,
  removeEmptyItems,
  isNullOrEmptyString,
  hasMissingNetWeightUnit,
  isNirms,
  isNotNirms,
  getItemFailureMessage
} from './packing-list-validator-utilities.js'
import failureReasons from './packing-list-failure-reasons.js' 

// Mock the data files
vi.mock('../data/data-iso-codes.json', () => ({
  default: ['VALID_ISO', 'INELIGIBLE_ITEM_ISO']
}))

vi.mock('../data/data-ineligible-items.json', () => ({
  default: [
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO',
      commodity_code: '123',
      type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT'
    },
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO',
      commodity_code: 'INELIGIBLE_ITEM_COMMODITY_1',
      type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT'
    },
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO',
      commodity_code: 'INELIGIBLE_ITEM_COMMODITY_2'
    },
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO', // GB
      commodity_code: 'INELIGIBLE_ITEM_COMMODITY_3', // mango
      type_of_treatment: '!INELIGIBLE_ITEM_TREATMENT' // !processed
    },
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO', // GB
      commodity_code: 'INELIGIBLE_ITEM_COMMODITY_3', // mango
      type_of_treatment: '!INELIGIBLE_ITEM_TREATMENT_2' // !dried
    },
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO', // GB
      commodity_code: 'INELIGIBLE_ITEM_COMMODITY_3', // mango
      type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT_3' // unprocessed
    }
  ]
}))

describe('validator function tests', () => {
  test.each([
    ['Pc', null, null, false],
    [null, 'np', 'tt', false],
    [null, null, null, true],
    [null, 'np', null, true],
    [null, null, 'tp', true]
  ])(
    'hasMissingIdentifier',
    (commodity_code, nature_of_products, type_of_treatment, expected) => {
      const item = { commodity_code, nature_of_products, type_of_treatment }
      expect(hasMissingIdentifier(item)).toBe(expected)
    }
  )

  test.each([
    [undefined, false],
    [null, false],
    ['text', true],
    ['1d1', true],
    ['1 1d1', true],
    ['0123', false],
    [' 12 3 ', false],
    [123, false]
  ])('hasInvalidProductCode', (commodity_code, expected) => {
    expect(hasInvalidProductCode({ commodity_code })).toBe(expected)
  })

  test.each([
    ['a description', false],
    [null, true]
  ])('hasMissingDescription', (description, expected) => {
    const item = { description }
    expect(hasMissingDescription(item)).toBe(expected)
  })

  test.each([
    [1, false],
    ['a string', false],
    [null, true]
  ])('hasMissingNetWeight', (total_net_weight_kg, expected) => {
    const item = { total_net_weight_kg }
    expect(hasMissingNetWeight(item)).toBe(expected)
  })

  test.each([
    [1, false],
    ['a string', false],
    [null, true]
  ])('hasMissingPackages', (number_of_packages, expected) => {
    const item = { number_of_packages }
    expect(hasMissingPackages(item)).toBe(expected)
  })

  test.each([
    [1, false],
    ['1', false],
    ['a string', true],
    [null, false],
    ['', false]
  ])('wrongTypeNetWeight', (total_net_weight_kg, expected) => {
    const item = { total_net_weight_kg }
    expect(wrongTypeNetWeight(item)).toBe(expected)
  })

  test.each([
    [1, false],
    ['1', false],
    ['a string', true],
    [null, false]
  ])('wrongTypeForPackages', (number_of_packages, expected) => {
    const item = { number_of_packages }
    expect(wrongTypeForPackages(item)).toBe(expected)
  })

  test.each([
    [null, true], // Null value
    ['', true], // Empty value
    ['NIRMS', false] // Value
  ])('hasMissingNirms', (nirms, expected) => {
    const item = { nirms }
    expect(hasMissingNirms(item)).toBe(expected)
  })

  test.each([
    ['INVALID ', true], // Invalid Value
    ['ni rms', true], // Invalid Value
    [1, true], // No string value
    ['Yes', false], // Valid Value
    ['NIRMS', false], // Valid Value
    ['Green', false], // Valid Value
    ['Y', false], // Valid Value
    ['G', false], // Valid Value
    ['No', false], // Valid Value
    ['Non-NIRMS', false], // Valid Value
    ['Non NIRMS', false], // Valid Value
    ['Red', false], // Valid Value
    ['N', false], // Valid Value
    ['R', false], // Valid Value
    ['nirms', false], // Case insensitive
    ['', false] // Empty value should be handled by hasMissingNirms
  ])('hasInvalidNirms', (nirms, expected) => {
    const item = { nirms }
    expect(hasInvalidNirms(item)).toBe(expected)
  })

  test.each([
    ['NIRMS', null, true], // Nirms, missing value
    ['NON-NIRMS', null, false], // Non-NIRMS, missing value
    ['NIRMS', 'VALID_ISO', false] // Nirms, valid value
  ])('hasMissingCoO', (nirms, country_of_origin, expected) => {
    const item = { nirms, country_of_origin }
    expect(hasMissingCoO(item)).toBe(expected)
  })

  test.each([
    ['NIRMS', 'INVALID_ISO', true], // Nirms, invalid value
    ['NIRMS', 0, true], // Nirms, invalid value
    ['NIRMS', 'VALID_ISO INELIGIBLE_ITEM_ISO', true], // Nirms, Multiple ISO codes not comma separated
    ['NIRMS', 'VALID_ISO, INVALID_ISO', true], // Nirms, Multiple ISO codes comma separated, one invalid
    ['NON-NIRMS', null, false], // Non-NIRMS, missing value, should be handled by hasMissingCoO
    ['NIRMS', 'VALID_ISO', false], // Nirms, valid value
    ['NIRMS', 'X', false], // Nirms, Specific 'X' value, should be ignored
    ['NIRMS', 'x', false], // Nirms, Specific 'x' value, should be ignored
    ['NIRMS', 'VALID_ISO, INELIGIBLE_ITEM_ISO', false] // Nirms, Multiple ISO codes comma separated
  ])('hasInvalidCoO', (nirms, country_of_origin, expected) => {
    const item = { nirms, country_of_origin }
    expect(hasInvalidCoO(item)).toBe(expected)
  })

  test.each([
    [
      'NIRMS',
      'INELIGIBLE_ITEM_ISO',
      'INELIGIBLE_ITEM_COMMODITY_1',
      'INELIGIBLE_ITEM_TREATMENT',
      true
    ], // Exact matching value with treatment type
    [
      'NIRMS',
      'VALID_ISO, INELIGIBLE_ITEM_ISO',
      'INELIGIBLE_ITEM_COMMODITY_1',
      'INELIGIBLE_ITEM_TREATMENT',
      true
    ], // Matching value with multiple countries of origin
    [
      'NIRMS',
      'INELIGIBLE_ITEM_ISO',
      'INELIGIBLE_ITEM_COMMODITY_1_EXTRA',
      'INELIGIBLE_ITEM_TREATMENT',
      true
    ], // Matching value with longer commodity code that starts with value in ineligible item list
    [
      'nirms',
      'INELIGIBLE_ITEM_ISO',
      'INELIGIBLE_ITEM_COMMODITY_1',
      'INELIGIBLE_ITEM_TREATMENT',
      true
    ], // Exact matching value with treatment type case insensitive
    ['NIRMS', 'INELIGIBLE_ITEM_ISO', 'INELIGIBLE_ITEM_COMMODITY_1', null, true], // no treatment type specified in packing list, treatment type specified in ineligible item list
    ['NIRMS', 'INELIGIBLE_ITEM_ISO', 'INELIGIBLE_ITEM_COMMODITY_2', null, true], // Exact matching value without treatment type specified in ineligible item list
    [
      'NIRMS',
      'INELIGIBLE_ITEM_ISO',
      'INELIGIBLE_ITEM_COMMODITY_2',
      'INELIGIBLE_ITEM_TREATMENT',
      true
    ], // Matching value with optional treatment type
    [
      'NON-NIRMS',
      'INELIGIBLE_ITEM_ISO',
      'INELIGIBLE_ITEM_COMMODITY_1',
      'INELIGIBLE_ITEM_TREATMENT',
      false
    ], // NON NIRMS entry
    [
      'NIRMS',
      'INELIGIBLE_ITEM_ISO',
      'INELIGIBLE_ITEM_COMMODITY_3',
      'INELIGIBLE_ITEM_TREATMENT',
      false
    ], // not ineligible as !INELIGIBLE_ITEM_TREATMENT
    [
      'NIRMS',
      'INELIGIBLE_ITEM_ISO',
      'INELIGIBLE_ITEM_COMMODITY_3',
      'INELIGIBLE_ITEM_TREATMENT_2',
      false
    ], // not ineligible as !INELIGIBLE_ITEM_TREATMENT_2
    [
      'NIRMS',
      'INELIGIBLE_ITEM_ISO',
      'INELIGIBLE_ITEM_COMMODITY_3',
      'INELIGIBLE_ITEM_TREATMENT_3',
      true
    ], // ineligible as INELIGIBLE_ITEM_TREATMENT_3
    [
      'NIRMS',
      'INELIGIBLE_ITEM_ISO',
      'INELIGIBLE_ITEM_COMMODITY_3',
      'INELIGIBLE_ITEM_TREATMENT_4',
      true
    ], // ineligible from !INELIGIBLE_ITEM_TREATMENT_2 or !INELIGIBLE_ITEM_TREATMENT
    ['NIRMS', 'INELIGIBLE_ITEM_ISO', 'INELIGIBLE_ITEM_COMMODITY_3', null, true] // ineligible when no treatment type provided as !INELIGIBLE_ITEM_TREATMENT_2 or !INELIGIBLE_ITEM_TREATMENT
  ])(
    'hasIneligibleItems',
    (nirms, country_of_origin, commodity_code, type_of_treatment, expected) => {
      const item = {
        nirms,
        country_of_origin,
        commodity_code,
        type_of_treatment
      }

      expect(hasIneligibleItems(item)).toBe(expected)
    }
  )
})

describe('removeBadData', () => {
  test('Number of pkgs and total net weight are both NaN', () => {
    const packingList = {
      registration_approval_number: 'RMS-GB-000022-999',
      items: [
        {
          description: 1234,
          nature_of_products: null,
          type_of_treatment: 'Type C',
          commodity_code: 'Text',
          number_of_packages: 'Text',
          total_net_weight_kg: 'Text'
        }
      ],
      business_checks: {
        all_required_fields_present: false
      }
    }

    const result = removeBadData(packingList.items)

    expect(result[0].number_of_packages).toBeNull()
    expect(result[0].total_net_weight_kg).toBeNull()
  })

  test('Number of pkgs and total net weight are both numbers', () => {
    const packingList = {
      registration_approval_number: 'RMS-GB-000022-998',
      items: [
        {
          description: 'CONTIGO AUTO-POP BOTTLE 720ML',
          nature_of_products: null,
          type_of_treatment: 'Ambient',
          commodity_code: '9617000000',
          number_of_packages: 1,
          total_net_weight_kg: 1.4155
        }
      ],
      business_checks: {
        all_required_fields_present: true
      }
    }

    const result = removeBadData(packingList.items)

    expect(result[0].number_of_packages).toBe(1)
    expect(result[0].total_net_weight_kg).toBe(1.4155)
  })
})

describe('isValidIsoCode edge cases', () => {
  test('should handle case-insensitive matching with mocked data', () => {
    // isValidIsoCode is tested indirectly through hasInvalidCoO
    expect(
      hasInvalidCoO({ nirms: 'NIRMS', country_of_origin: 'valid_iso' })
    ).toBe(false)
    expect(
      hasInvalidCoO({ nirms: 'NIRMS', country_of_origin: 'VALID_ISO' })
    ).toBe(false)
  })

  test('should trim whitespace in country codes', () => {
    expect(
      hasInvalidCoO({ nirms: 'NIRMS', country_of_origin: '  VALID_ISO  ' })
    ).toBe(false)
  })
})

describe('isNullOrEmptyString', () => {
  test('should return true for null', () => {
    expect(isNullOrEmptyString(null)).toBe(true)
  })

  test('should return true for undefined', () => {
    expect(isNullOrEmptyString(undefined)).toBe(true)
  })

  test('should return true for empty string', () => {
    expect(isNullOrEmptyString('')).toBe(true)
  })

  test('should return false for non-empty values', () => {
    expect(isNullOrEmptyString('value')).toBe(false)
    expect(isNullOrEmptyString(0)).toBe(false)
    expect(isNullOrEmptyString(false)).toBe(false)
  })
})

describe('hasMissingNetWeightUnit', () => {
  test('should return true when unit is missing', () => {
    expect(hasMissingNetWeightUnit({ total_net_weight_unit: null })).toBe(true)
    expect(hasMissingNetWeightUnit({ total_net_weight_unit: '' })).toBe(true)
    expect(hasMissingNetWeightUnit({ total_net_weight_unit: undefined })).toBe(
      true
    )
  })

  test('should return false when unit is present', () => {
    expect(hasMissingNetWeightUnit({ total_net_weight_unit: 'kg' })).toBe(false)
  })
})

describe('isNirms and isNotNirms', () => {
  test('isNirms should handle green lane variations', () => {
    expect(isNirms('green lane')).toBe(true)
    expect(isNirms('Green Lane Traffic')).toBe(true)
  })

  test('isNotNirms should handle red lane variations', () => {
    expect(isNotNirms('red lane')).toBe(true)
    expect(isNotNirms('Red Lane Traffic')).toBe(true)
  })

  test('isNirms should return false for empty values', () => {
    expect(isNirms(null)).toBe(false)
    expect(isNirms('')).toBe(false)
    expect(isNirms(undefined)).toBe(false)
  })

  test('isNotNirms should return false for empty values', () => {
    expect(isNotNirms(null)).toBe(false)
    expect(isNotNirms('')).toBe(false)
    expect(isNotNirms(undefined)).toBe(false)
  })
})

describe('wrongTypeForPackages edge cases', () => {
  test('should return true for negative numbers', () => {
    expect(wrongTypeForPackages({ number_of_packages: -5 })).toBe(true)
    expect(wrongTypeForPackages({ number_of_packages: '-10' })).toBe(true)
  })

  test('should return false for valid positive numbers', () => {
    expect(wrongTypeForPackages({ number_of_packages: 0 })).toBe(false)
    expect(wrongTypeForPackages({ number_of_packages: 100 })).toBe(false)
  })
})

describe('wrongTypeNetWeight edge cases', () => {
  test('should return true for negative numbers', () => {
    expect(wrongTypeNetWeight({ total_net_weight_kg: -5 })).toBe(true)
    expect(wrongTypeNetWeight({ total_net_weight_kg: '-10' })).toBe(true)
  })

  test('should return false for valid positive numbers', () => {
    expect(wrongTypeNetWeight({ total_net_weight_kg: 0 })).toBe(false)
    expect(wrongTypeNetWeight({ total_net_weight_kg: 100.5 })).toBe(false)
  })
})

describe('removeEmptyItems', () => {
  test('return true for length greater than 0', () => {
    const packingList = {
      registration_approval_number: 'RMS-GB-000022-999',
      items: [
        {
          description: 1234,
          nature_of_products: null,
          type_of_treatment: 'Type C',
          commodity_code: 'Text',
          number_of_packages: 'Text',
          total_net_weight_kg: 'Text'
        }
      ],
      business_checks: {
        all_required_fields_present: false
      }
    }

    const result = removeEmptyItems(packingList.items)

    expect(result.length).toBe(1)
  })

  test('return empty for null item', () => {
    const packingList = {
      registration_approval_number: 'RMS-GB-000022-999',
      items: [
        {
          description: null,
          nature_of_products: null,
          type_of_treatment: null,
          commodity_code: null,
          number_of_packages: null,
          total_net_weight_kg: null
        }
      ],
      business_checks: {
        all_required_fields_present: false
      }
    }

    const result = removeEmptyItems(packingList.items)

    expect(result.length).toBe(0)
  })

  test('return empty for null item with row_location', () => {
    const packingList = {
      registration_approval_number: 'RMS-GB-000022-999',
      items: [
        {
          description: null,
          nature_of_products: null,
          type_of_treatment: null,
          commodity_code: null,
          number_of_packages: null,
          total_net_weight_kg: null,
          row_location: {
            rowNumber: 1
          }
        }
      ],
      business_checks: {
        all_required_fields_present: false
      }
    }

    const result = removeEmptyItems(packingList.items)

    expect(result.length).toBe(0)
  })

  test('multiple items', () => {
    const packingList = {
      registration_approval_number: 'RMS-GB-000022-999',
      items: [
        {
          description: 1234,
          nature_of_products: null,
          type_of_treatment: 'Type C',
          commodity_code: 'Text',
          number_of_packages: 'Text',
          total_net_weight_kg: 'Text'
        },
        {
          description: null,
          nature_of_products: null,
          type_of_treatment: null,
          commodity_code: null,
          number_of_packages: null,
          total_net_weight_kg: null
        }
      ],
      business_checks: {
        all_required_fields_present: false
      }
    }

    const result = removeEmptyItems(packingList.items)

    expect(result.length).toBe(1)
  })
})

describe('getItemFailureMessage', () => {
  test('multiple failure messages', () => {
    const item = {
      description: null,
      nature_of_products: null,
      type_of_treatment: null,
      commodity_code: null,
      number_of_packages: null,
      total_net_weight_kg: null
    }

    const result = getItemFailureMessage(item)

    expect(result).toEqual(
      `${failureReasons.IDENTIFIER_MISSING}; ${failureReasons.DESCRIPTION_MISSING}; ${failureReasons.PACKAGES_MISSING}; ${failureReasons.NET_WEIGHT_MISSING}; ${failureReasons.NET_WEIGHT_UNIT_MISSING}`
    )
  })

  test('should return null when item has no failures', () => {
    const item = {
      commodity_code: '12345678',
      description: 'Test Product',
      number_of_packages: 10,
      total_net_weight_kg: 5.5,
      total_net_weight_unit: 'kg'
    }
    expect(getItemFailureMessage(item, false, false)).toBeNull()
  })

  test('should return identifier missing message', () => {
    const item = {
      commodity_code: null,
      nature_of_products: null,
      type_of_treatment: null,
      description: 'Test Product',
      number_of_packages: 10,
      total_net_weight_kg: 5.5,
      total_net_weight_unit: 'kg'
    }
    const result = getItemFailureMessage(item, false, false)
    expect(result).toContain('Identifier is missing')
  })

  test('should return invalid product code message', () => {
    const item = {
      commodity_code: 'ABC123',
      description: 'Test Product',
      number_of_packages: 10,
      total_net_weight_kg: 5.5,
      total_net_weight_unit: 'kg'
    }
    const result = getItemFailureMessage(item, false, false)
    expect(result).toContain('Product code is invalid')
  })

  test('should return description missing message', () => {
    const item = {
      commodity_code: '12345678',
      description: null,
      number_of_packages: 10,
      total_net_weight_kg: 5.5,
      total_net_weight_unit: 'kg'
    }
    const result = getItemFailureMessage(item, false, false)
    expect(result).toContain('Product description is missing')
  })

  test('should return packages missing message', () => {
    const item = {
      commodity_code: '12345678',
      description: 'Test Product',
      number_of_packages: null,
      total_net_weight_kg: 5.5,
      total_net_weight_unit: 'kg'
    }
    const result = getItemFailureMessage(item, false, false)
    expect(result).toContain('No of packages is missing')
  })

  test('should return packages invalid message', () => {
    const item = {
      commodity_code: '12345678',
      description: 'Test Product',
      number_of_packages: 'invalid',
      total_net_weight_kg: 5.5,
      total_net_weight_unit: 'kg'
    }
    const result = getItemFailureMessage(item, false, false)
    expect(result).toContain('No of packages is invalid')
  })

  test('should return net weight missing message', () => {
    const item = {
      commodity_code: '12345678',
      description: 'Test Product',
      number_of_packages: 10,
      total_net_weight_kg: null,
      total_net_weight_unit: 'kg'
    }
    const result = getItemFailureMessage(item, false, false)
    expect(result).toContain('Total net weight is missing')
  })

  test('should return net weight invalid message', () => {
    const item = {
      commodity_code: '12345678',
      description: 'Test Product',
      number_of_packages: 10,
      total_net_weight_kg: 'invalid',
      total_net_weight_unit: 'kg'
    }
    const result = getItemFailureMessage(item, false, false)
    expect(result).toContain('Total net weight is invalid')
  })

  test('should return net weight unit missing message when unitInHeader is false', () => {
    const item = {
      commodity_code: '12345678',
      description: 'Test Product',
      number_of_packages: 10,
      total_net_weight_kg: 5.5,
      total_net_weight_unit: null
    }
    const result = getItemFailureMessage(item, false, false)
    expect(result).toContain('Net Weight Unit of Measure (kg) not found')
  })

  test('should NOT return net weight unit missing message when unitInHeader is true', () => {
    const item = {
      commodity_code: '12345678',
      description: 'Test Product',
      number_of_packages: 10,
      total_net_weight_kg: 5.5,
      total_net_weight_unit: null
    }
    const result = getItemFailureMessage(item, false, true)
    expect(result).toBeNull()
  })

  test('should include NIRMS validation when validateCountryOfOrigin is true', () => {
    const item = {
      commodity_code: '12345678',
      description: 'Test Product',
      number_of_packages: 10,
      total_net_weight_kg: 5.5,
      total_net_weight_unit: 'kg',
      nirms: null
    }
    const result = getItemFailureMessage(item, true, false)
    expect(result).toContain('NIRMS/Non-NIRMS goods not specified')
  })

  test('should include invalid NIRMS message when validateCountryOfOrigin is true', () => {
    const item = {
      commodity_code: '12345678',
      description: 'Test Product',
      number_of_packages: 10,
      total_net_weight_kg: 5.5,
      total_net_weight_unit: 'kg',
      nirms: 'invalid'
    }
    const result = getItemFailureMessage(item, true, false)
    expect(result).toContain('Invalid entry for NIRMS/Non-NIRMS goods')
  })

  test('should include missing country of origin message when NIRMS and validateCountryOfOrigin is true', () => {
    const item = {
      commodity_code: '12345678',
      description: 'Test Product',
      number_of_packages: 10,
      total_net_weight_kg: 5.5,
      total_net_weight_unit: 'kg',
      nirms: 'NIRMS',
      country_of_origin: null
    }
    const result = getItemFailureMessage(item, true, false)
    expect(result).toContain('Missing Country of Origin')
  })

  test('should include invalid country of origin message when validateCountryOfOrigin is true', () => {
    const item = {
      commodity_code: '12345678',
      description: 'Test Product',
      number_of_packages: 10,
      total_net_weight_kg: 5.5,
      total_net_weight_unit: 'kg',
      nirms: 'NIRMS',
      country_of_origin: 'INVALID_ISO'
    }
    const result = getItemFailureMessage(item, true, false)
    expect(result).toContain('Invalid Country of Origin ISO Code')
  })

  test('should include prohibited item message when item is ineligible', () => {
    const item = {
      commodity_code: 'INELIGIBLE_ITEM_COMMODITY_1',
      description: 'Test Product',
      number_of_packages: 10,
      total_net_weight_kg: 5.5,
      total_net_weight_unit: 'kg',
      nirms: 'NIRMS',
      country_of_origin: 'INELIGIBLE_ITEM_ISO',
      type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT'
    }
    const result = getItemFailureMessage(item, true, false)
    expect(result).toContain('Prohibited item identified on the packing list')
  })

  test('should combine multiple failures with semicolons', () => {
    const item = {
      commodity_code: null,
      description: null,
      number_of_packages: null,
      total_net_weight_kg: null,
      total_net_weight_unit: null
    }
    const result = getItemFailureMessage(item, false, false)
    expect(result).toContain('Identifier is missing')
    expect(result).toContain('Product description is missing')
    expect(result).toContain('No of packages is missing')
    expect(result).toContain('Total net weight is missing')
    expect(result).toContain('Net Weight Unit of Measure (kg) not found')
    // Check that failures are separated by semicolons
    expect(result?.split(';').length).toBeGreaterThan(1)
  })

  test('should NOT include country of origin validations when validateCountryOfOrigin is false', () => {
    const item = {
      commodity_code: '12345678',
      description: 'Test Product',
      number_of_packages: 10,
      total_net_weight_kg: 5.5,
      total_net_weight_unit: 'kg',
      nirms: null,
      country_of_origin: null
    }
    const result = getItemFailureMessage(item, false, false)
    expect(result).toBeNull()
  })

  test('should handle combination of basic and country of origin failures', () => {
    const item = {
      commodity_code: null,
      description: null,
      number_of_packages: null,
      total_net_weight_kg: null,
      total_net_weight_unit: null,
      nirms: null,
      country_of_origin: null
    }
    const result = getItemFailureMessage(item, true, false)
    expect(result).toContain('Identifier is missing')
    expect(result).toContain('NIRMS/Non-NIRMS goods not specified')
    expect(result?.split(';').length).toBeGreaterThan(1)
  })
})
