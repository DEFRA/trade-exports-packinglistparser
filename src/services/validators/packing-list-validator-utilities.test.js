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
  getItemFailureMessage,
  isValidIsoCode,
  isIneligibleItem
} from './packing-list-validator-utilities.js'
import failureReasons from './packing-list-failure-reasons.js'
import { config } from '../../config.js'
import { getIneligibleItemsCache } from '../cache/ineligible-items-cache.js'

// Mock the config module
vi.mock('../../config.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'mdmIntegration') {
        return { enabled: false } // Default to disabled for tests to use static data
      }
      return {}
    })
  }
}))

// Mock the cache modules
vi.mock('../cache/iso-codes-cache.js', () => ({
  getIsoCodesCache: vi.fn(() => null) // Return null to use static data in tests
}))

vi.mock('../cache/ineligible-items-cache.js', () => ({
  getIneligibleItemsCache: vi.fn(() => null) // Return null to use static data in tests
}))

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
    ['', false], // Empty value should be handled by hasMissingNirms
    ['Cafe-Exempt', false], // Valid Cafe-Exempt value
    ['cafe-exempt', false], // Valid Cafe-Exempt value (lowercase)
    ['Café-Exempt', false], // Valid Café-Exempt value (accented)
    ['Cafe Exempt', false], // Valid Cafe Exempt value (space separator)
    ['café exempt', false] // Valid café exempt value (accented, space separator)
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
  test.each([
    ['null', null],
    ['undefined', undefined],
    ['empty string', '']
  ])('should return true for %s', (_, value) => {
    expect(isNullOrEmptyString(value)).toBe(true)
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
  test.each([
    ['green lane', 'green lane', true],
    ['green lane with trailing text', 'Green Lane Traffic', true],
    ['null input', null, false],
    ['empty string input', '', false],
    ['undefined input', undefined, false],
    ['Cafe-Exempt hyphenated', 'Cafe-Exempt', true],
    ['cafe-exempt lowercase hyphenated', 'cafe-exempt', true],
    ['Café-Exempt accented hyphenated', 'Café-Exempt', true],
    ['café-exempt lowercase accented hyphenated', 'café-exempt', true],
    ['Cafe Exempt spaced', 'Cafe Exempt', true],
    ['café exempt lowercase accented spaced', 'café exempt', true],
    ['CafeExempt missing separator', 'CafeExempt', false],
    [
      'Cafe-exempt with trailing text still matches unanchored pattern',
      'Cafe-exempt extra text invalid',
      true
    ]
  ])('isNirms: %s', (_, value, expected) => {
    expect(isNirms(value)).toBe(expected)
  })

  test.each([
    ['red lane', 'red lane', true],
    ['red lane with trailing text', 'Red Lane Traffic', true],
    ['Non nirms', 'Non nirms', true],
    ['Not – NIRMS', 'Not – NIRMS', true],
    ['Not nirms', 'Not nirms', true],
    ['Not-nirms', 'Not-nirms', true],
    ['Nont-nirms', 'Nont-nirms', false],
    ['Nont nirms', 'Nont nirms', false],
    ['Not- nirms', 'Not- nirms', false],
    ['null input', null, false],
    ['empty string input', '', false],
    ['undefined input', undefined, false]
  ])('isNotNirms: %s', (_, value, expected) => {
    expect(isNotNirms(value)).toBe(expected)
  })
})

describe('wrongTypeForPackages edge cases', () => {
  test.each([
    ['negative number', -5, true],
    ['negative numeric string', '-10', true],
    ['zero', 0, false],
    ['positive integer', 100, false]
  ])('should evaluate %s', (_, number_of_packages, expected) => {
    expect(wrongTypeForPackages({ number_of_packages })).toBe(expected)
  })
})

describe('wrongTypeNetWeight edge cases', () => {
  test.each([
    ['negative number', -5, true],
    ['negative numeric string', '-10', true],
    ['zero', 0, false],
    ['positive decimal', 100.5, false]
  ])('should evaluate %s', (_, total_net_weight_kg, expected) => {
    expect(wrongTypeNetWeight({ total_net_weight_kg })).toBe(expected)
  })
})

describe('removeEmptyItems', () => {
  test.each([
    [
      'return true for length greater than 0',
      [
        {
          description: 1234,
          nature_of_products: null,
          type_of_treatment: 'Type C',
          commodity_code: 'Text',
          number_of_packages: 'Text',
          total_net_weight_kg: 'Text'
        }
      ],
      1
    ],
    [
      'return empty for null item',
      [
        {
          description: null,
          nature_of_products: null,
          type_of_treatment: null,
          commodity_code: null,
          number_of_packages: null,
          total_net_weight_kg: null
        }
      ],
      0
    ],
    [
      'return empty for null item with row_location',
      [
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
      0
    ],
    [
      'multiple items',
      [
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
      1
    ]
  ])('%s', (_, items, expectedLength) => {
    const result = removeEmptyItems(items)

    expect(result).toHaveLength(expectedLength)
  })
})

describe('getItemFailureMessage', () => {
  const buildValidItem = (overrides = {}) => ({
    commodity_code: '12345678',
    description: 'Test Product',
    number_of_packages: 10,
    total_net_weight_kg: 5.5,
    total_net_weight_unit: 'kg',
    ...overrides
  })

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

  test.each([
    ['item has no failures', {}, false, false],
    [
      'unit in header is true and unit is missing',
      { total_net_weight_unit: null },
      false,
      true
    ],
    [
      'country of origin validation is disabled',
      { nirms: null, country_of_origin: null },
      false,
      false
    ]
  ])(
    'should return null when %s',
    (_, overrides, validateCountryOfOrigin, unitInHeader) => {
      const result = getItemFailureMessage(
        buildValidItem(overrides),
        validateCountryOfOrigin,
        unitInHeader
      )

      expect(result).toBeNull()
    }
  )

  test.each([
    [
      'identifier is missing',
      {
        commodity_code: null,
        nature_of_products: null,
        type_of_treatment: null
      },
      false,
      false,
      'Identifier is missing'
    ],
    [
      'product code is invalid',
      { commodity_code: 'ABC123' },
      false,
      false,
      'Product code is invalid'
    ],
    [
      'product description is missing',
      { description: null },
      false,
      false,
      'Product description is missing'
    ],
    [
      'number of packages is missing',
      { number_of_packages: null },
      false,
      false,
      'No of packages is missing'
    ],
    [
      'number of packages is invalid',
      { number_of_packages: 'invalid' },
      false,
      false,
      'No of packages is invalid'
    ],
    [
      'net weight is missing',
      { total_net_weight_kg: null },
      false,
      false,
      'Total net weight is missing'
    ],
    [
      'net weight is invalid',
      { total_net_weight_kg: 'invalid' },
      false,
      false,
      'Total net weight is invalid'
    ],
    [
      'net weight unit is missing when unitInHeader is false',
      { total_net_weight_unit: null },
      false,
      false,
      'Net Weight Unit of Measure (kg) not found'
    ],
    [
      'NIRMS is missing when country of origin validation is enabled',
      { nirms: null },
      true,
      false,
      'NIRMS/Non-NIRMS goods not specified'
    ],
    [
      'NIRMS is invalid when country of origin validation is enabled',
      { nirms: 'invalid' },
      true,
      false,
      'Invalid entry for NIRMS/Non-NIRMS goods'
    ],
    [
      'country of origin is missing for NIRMS',
      { nirms: 'NIRMS', country_of_origin: null },
      true,
      false,
      'Missing Country of Origin'
    ],
    [
      'country of origin is invalid for NIRMS',
      { nirms: 'NIRMS', country_of_origin: 'INVALID_ISO' },
      true,
      false,
      'Invalid Country of Origin ISO Code'
    ],
    [
      'item is ineligible',
      {
        commodity_code: 'INELIGIBLE_ITEM_COMMODITY_1',
        nirms: 'NIRMS',
        country_of_origin: 'INELIGIBLE_ITEM_ISO',
        type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT'
      },
      true,
      false,
      'Prohibited item identified on the packing list'
    ]
  ])(
    'should include expected failure message when %s',
    (_, overrides, validateCountryOfOrigin, unitInHeader, expectedMessage) => {
      const result = getItemFailureMessage(
        buildValidItem(overrides),
        validateCountryOfOrigin,
        unitInHeader
      )

      expect(result).toContain(expectedMessage)
    }
  )

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

describe('MDM Integration Coverage Tests', () => {
  test('hasInvalidCoO with null value should return false', () => {
    const item = { nirms: 'NIRMS', country_of_origin: null }
    expect(hasInvalidCoO(item)).toBe(false)
  })

  test('hasInvalidCoO with non-string value should return true (invalid)', () => {
    const item = { nirms: 'NIRMS', country_of_origin: 123 }
    expect(hasInvalidCoO(item)).toBe(true) // Numbers are considered invalid
  })

  test('hasInvalidCoO with empty string should return false', () => {
    const item = { nirms: 'NIRMS', country_of_origin: '' }
    expect(hasInvalidCoO(item)).toBe(false)
  })
})

describe('isValidIsoCode edge cases', () => {
  test('should return false for null', () => {
    expect(isValidIsoCode(null)).toBe(false)
  })

  test('should return false for undefined', () => {
    expect(isValidIsoCode(undefined)).toBe(false)
  })

  test('should return false for empty string', () => {
    expect(isValidIsoCode('')).toBe(false)
  })

  test('should return false for non-string (number)', () => {
    expect(isValidIsoCode(123)).toBe(false)
  })

  test('should return false for non-string (object)', () => {
    expect(isValidIsoCode({})).toBe(false)
  })
})

describe('isIneligibleItem direct tests for MDM cache coverage', () => {
  test.each([[null], ['']])(
    'should return false when country_of_origin is null or empty: %p',
    (countryOfOrigin) => {
      vi.mocked(config.get).mockReturnValueOnce({ enabled: false })

      const result = isIneligibleItem(
        countryOfOrigin,
        'INELIGIBLE_ITEM_COMMODITY_1',
        'INELIGIBLE_ITEM_TREATMENT'
      )

      expect(result).toBe(false)
    }
  )

  test('should use MDM cache when enabled (array format)', () => {
    // Enable MDM and provide cache data
    vi.mocked(config.get).mockReturnValueOnce({ enabled: true })
    vi.mocked(getIneligibleItemsCache).mockReturnValueOnce([
      {
        country_of_origin: 'TEST',
        commodity_code: '777',
        type_of_treatment: 'TEST_TYPE'
      }
    ])

    const result = isIneligibleItem('TEST', '777', 'TEST_TYPE')
    expect(result).toBe(true)
  })

  test('should use MDM cache when enabled (object format)', () => {
    // Enable MDM and provide cache data in object format
    vi.mocked(config.get).mockReturnValueOnce({ enabled: true })
    vi.mocked(getIneligibleItemsCache).mockReturnValueOnce({
      ineligibleItems: [
        {
          country_of_origin: 'TEST2',
          commodity_code: '666',
          type_of_treatment: 'TEST_TYPE2'
        }
      ]
    })

    const result = isIneligibleItem('TEST2', '666', 'TEST_TYPE2')
    expect(result).toBe(true)
  })

  test('should fallback to static data when MDM enabled but cache returns null', () => {
    // Enable MDM but cache returns null
    vi.mocked(config.get).mockReturnValueOnce({ enabled: true })
    vi.mocked(getIneligibleItemsCache).mockReturnValueOnce(null)

    const result = isIneligibleItem(
      'INELIGIBLE_ITEM_ISO',
      '123',
      'INELIGIBLE_ITEM_TREATMENT'
    )
    expect(result).toBe(true) // Should use static data
  })

  test('should use static data when MDM is disabled', () => {
    // Disable MDM
    vi.mocked(config.get).mockReturnValueOnce({ enabled: false })

    const result = isIneligibleItem(
      'INELIGIBLE_ITEM_ISO',
      '123',
      'INELIGIBLE_ITEM_TREATMENT'
    )
    expect(result).toBe(true)
  })
})
