/**
 * Packing List Column Validator Tests
 *
 * Tests for packing list column-level validation and failure reason generation.
 */

import { describe, test, expect } from 'vitest'
import {
  //validatePackingList,
  validatePackingListByIndexAndType,
  generateFailuresByIndexAndTypes
} from './packing-list-column-validator.js'

describe('validatePackingListByIndexAndType', () => {
  test('valid data', () => {
    const packingList = {
      registration_approval_number: 'RMS/2024/12345',
      items: [
        {
          description: 'description',
          nature_of_products: 'nature of products',
          type_of_treatment: 'type of treatment',
          commodity_code: '012345',
          number_of_packages: 1,
          total_net_weight_kg: 1.2,
          total_net_weight_unit: 'KG'
        }
      ],
      business_checks: {
        all_required_fields_present: true
      },
      establishment_numbers: ['RMS-GB-000000-000']
    }

    const result = validatePackingListByIndexAndType(packingList)

    expect(result.hasAllFields).toBeTruthy()
    expect(result.missingIdentifier.length).toBe(0)
    expect(result.invalidProductCodes.length).toBe(0)
    expect(result.missingDescription.length).toBe(0)
    expect(result.missingPackages.length).toBe(0)
    expect(result.missingNetWeight.length).toBe(0)
    expect(result.invalidPackages.length).toBe(0)
    expect(result.invalidNetWeight.length).toBe(0)
    expect(result.hasRemos).toBeTruthy()
    expect(result.isEmpty).toBeFalsy()
    expect(result.hasSingleRms).toBeTruthy()
    expect(result.missingNetWeightUnit.length).toBe(0)
  })

  test('missing remos number', () => {
    const packingList = {
      registration_approval_number: null,
      items: [
        {
          description: 'description',
          nature_of_products: 'nature of products',
          type_of_treatment: 'type of treatment',
          commodity_code: '012345',
          number_of_packages: 1,
          total_net_weight_kg: 1.2,
          total_net_weight_unit: 'KG'
        }
      ],
      business_checks: {
        all_required_fields_present: true
      },
      establishment_numbers: []
    }

    const result = validatePackingListByIndexAndType(packingList)

    expect(result.hasAllFields).toBeFalsy()
    expect(result.missingIdentifier.length).toBe(0)
    expect(result.invalidProductCodes.length).toBe(0)
    expect(result.missingDescription.length).toBe(0)
    expect(result.missingPackages.length).toBe(0)
    expect(result.missingNetWeight.length).toBe(0)
    expect(result.invalidPackages.length).toBe(0)
    expect(result.invalidNetWeight.length).toBe(0)
    expect(result.hasRemos).toBeFalsy()
    expect(result.isEmpty).toBeFalsy()
    expect(result.hasSingleRms).toBeTruthy()
    expect(result.missingNetWeightUnit.length).toBe(0)
  })

  test('missing commodity code', () => {
    const packingList = {
      registration_approval_number: 'remos',
      items: [
        {
          description: 'description',
          nature_of_products: 'nature of products',
          type_of_treatment: null,
          commodity_code: null,
          number_of_packages: 1,
          total_net_weight_kg: 1.2,
          total_net_weight_unit: 'KG',
          row_location: {
            rowNumber: 1
          }
        }
      ],
      business_checks: {
        all_required_fields_present: true
      },
      establishment_numbers: ['RMS-GB-000000-000']
    }

    const result = validatePackingListByIndexAndType(packingList)

    expect(result.hasAllFields).toBeFalsy()
    expect(result.missingIdentifier.length).toBe(1)
    expect(result.invalidProductCodes.length).toBe(0)
    expect(result.missingDescription.length).toBe(0)
    expect(result.missingPackages.length).toBe(0)
    expect(result.missingNetWeight.length).toBe(0)
    expect(result.invalidPackages.length).toBe(0)
    expect(result.invalidNetWeight.length).toBe(0)
    expect(result.hasRemos).toBeTruthy()
    expect(result.isEmpty).toBeFalsy()
    expect(result.hasSingleRms).toBeTruthy()
    expect(result.missingNetWeightUnit.length).toBe(0)
  })

  test('missing treatment type', () => {
    const packingList = {
      registration_approval_number: 'remos',
      items: [
        {
          description: 'description',
          nature_of_products: 'nature of products',
          type_of_treatment: null,
          commodity_code: null,
          number_of_packages: 1,
          total_net_weight_kg: 1.2,
          total_net_weight_unit: 'KG',
          row_location: {
            rowNumber: 1
          }
        }
      ],
      business_checks: {
        all_required_fields_present: true
      },
      establishment_numbers: ['RMS-GB-000000-000']
    }

    const result = validatePackingListByIndexAndType(packingList)

    expect(result.hasAllFields).toBeFalsy()
    expect(result.missingIdentifier.length).toBe(1)
    expect(result.invalidProductCodes.length).toBe(0)
    expect(result.missingDescription.length).toBe(0)
    expect(result.missingPackages.length).toBe(0)
    expect(result.missingNetWeight.length).toBe(0)
    expect(result.invalidPackages.length).toBe(0)
    expect(result.invalidNetWeight.length).toBe(0)
    expect(result.hasRemos).toBeTruthy()
    expect(result.isEmpty).toBeFalsy()
    expect(result.hasSingleRms).toBeTruthy()
    expect(result.missingNetWeightUnit.length).toBe(0)
  })

  test('missing nature of products', () => {
    const packingList = {
      registration_approval_number: 'remos',
      items: [
        {
          description: 'description',
          nature_of_products: null,
          type_of_treatment: 'treatment type',
          commodity_code: null,
          number_of_packages: 1,
          total_net_weight_kg: 1.2,
          total_net_weight_unit: 'KG',
          row_location: {
            rowNumber: 1
          }
        }
      ],
      business_checks: {
        all_required_fields_present: true
      },
      establishment_numbers: ['RMS-GB-000000-000']
    }

    const result = validatePackingListByIndexAndType(packingList)

    expect(result.hasAllFields).toBeFalsy()
    expect(result.missingIdentifier.length).toBe(1)
    expect(result.invalidProductCodes.length).toBe(0)
    expect(result.missingDescription.length).toBe(0)
    expect(result.missingPackages.length).toBe(0)
    expect(result.missingNetWeight.length).toBe(0)
    expect(result.invalidPackages.length).toBe(0)
    expect(result.invalidNetWeight.length).toBe(0)
    expect(result.hasRemos).toBeTruthy()
    expect(result.isEmpty).toBeFalsy()
    expect(result.hasSingleRms).toBeTruthy()
    expect(result.missingNetWeightUnit.length).toBe(0)
  })

  test('missing description', () => {
    const packingList = {
      registration_approval_number: 'remos',
      items: [
        {
          description: null,
          nature_of_products: 'nature of products',
          type_of_treatment: 'treatment type',
          commodity_code: '123',
          number_of_packages: 1,
          total_net_weight_kg: 1.2,
          total_net_weight_unit: 'KG',
          row_location: {
            rowNumber: 1
          }
        }
      ],
      business_checks: {
        all_required_fields_present: true
      },
      establishment_numbers: ['RMS-GB-000000-000']
    }

    const result = validatePackingListByIndexAndType(packingList)

    expect(result.hasAllFields).toBeFalsy()
    expect(result.missingIdentifier.length).toBe(0)
    expect(result.invalidProductCodes.length).toBe(0)
    expect(result.missingDescription.length).toBe(1)
    expect(result.missingPackages.length).toBe(0)
    expect(result.missingNetWeight.length).toBe(0)
    expect(result.invalidPackages.length).toBe(0)
    expect(result.invalidNetWeight.length).toBe(0)
    expect(result.hasRemos).toBeTruthy()
    expect(result.isEmpty).toBeFalsy()
    expect(result.hasSingleRms).toBeTruthy()
    expect(result.missingNetWeightUnit.length).toBe(0)
  })

  test('missing packages', () => {
    const packingList = {
      registration_approval_number: 'remos',
      items: [
        {
          description: 'description',
          nature_of_products: 'nature of products',
          type_of_treatment: 'treatment type',
          commodity_code: '123',
          number_of_packages: null,
          total_net_weight_unit: 'KG',
          total_net_weight_kg: 1.2,
          row_location: {
            rowNumber: 1
          }
        }
      ],
      business_checks: {
        all_required_fields_present: true
      },
      establishment_numbers: ['RMS-GB-000000-000']
    }

    const result = validatePackingListByIndexAndType(packingList)

    expect(result.hasAllFields).toBeFalsy()
    expect(result.missingIdentifier.length).toBe(0)
    expect(result.invalidProductCodes.length).toBe(0)
    expect(result.missingDescription.length).toBe(0)
    expect(result.missingPackages.length).toBe(1)
    expect(result.missingNetWeight.length).toBe(0)
    expect(result.invalidPackages.length).toBe(0)
    expect(result.invalidNetWeight.length).toBe(0)
    expect(result.hasRemos).toBeTruthy()
    expect(result.isEmpty).toBeFalsy()
    expect(result.hasSingleRms).toBeTruthy()
    expect(result.missingNetWeightUnit.length).toBe(0)
  })

  test('missing net weight', () => {
    const packingList = {
      registration_approval_number: 'remos',
      items: [
        {
          description: 'description',
          nature_of_products: 'nature of products',
          type_of_treatment: 'treatment type',
          commodity_code: '123',
          number_of_packages: 1,
          total_net_weight_kg: null,
          total_net_weight_unit: 'KG',
          row_location: {
            rowNumber: 1
          }
        }
      ],
      business_checks: {
        all_required_fields_present: true
      },
      establishment_numbers: ['RMS-GB-000000-000']
    }

    const result = validatePackingListByIndexAndType(packingList)

    expect(result.hasAllFields).toBeFalsy()
    expect(result.missingIdentifier.length).toBe(0)
    expect(result.invalidProductCodes.length).toBe(0)
    expect(result.missingDescription.length).toBe(0)
    expect(result.missingPackages.length).toBe(0)
    expect(result.missingNetWeight.length).toBe(1)
    expect(result.invalidPackages.length).toBe(0)
    expect(result.invalidNetWeight.length).toBe(0)
    expect(result.hasRemos).toBeTruthy()
    expect(result.isEmpty).toBeFalsy()
    expect(result.hasSingleRms).toBeTruthy()
    expect(result.missingNetWeightUnit.length).toBe(0)
  })

  test('missing net weight unit', () => {
    const packingList = {
      registration_approval_number: 'remos',
      items: [
        {
          description: 'description',
          nature_of_products: 'nature of products',
          type_of_treatment: 'treatment type',
          commodity_code: '123',
          number_of_packages: 1,
          total_net_weight_kg: 1,
          total_net_weight_unit: null,
          row_location: {
            rowNumber: 1
          }
        }
      ],
      business_checks: {
        all_required_fields_present: true
      },
      establishment_numbers: ['RMS-GB-000000-000']
    }

    const result = validatePackingListByIndexAndType(packingList)

    expect(result.hasAllFields).toBeFalsy()
    expect(result.missingIdentifier.length).toBe(0)
    expect(result.invalidProductCodes.length).toBe(0)
    expect(result.missingDescription.length).toBe(0)
    expect(result.missingPackages.length).toBe(0)
    expect(result.missingNetWeight.length).toBe(0)
    expect(result.invalidPackages.length).toBe(0)
    expect(result.invalidNetWeight.length).toBe(0)
    expect(result.hasRemos).toBeTruthy()
    expect(result.isEmpty).toBeFalsy()
    expect(result.missingNetWeightUnit.length).toBe(1)
  })

  test('invalid packages', () => {
    const packingList = {
      registration_approval_number: 'remos',
      items: [
        {
          description: 'description',
          nature_of_products: 'nature of products',
          type_of_treatment: 'treatment type',
          commodity_code: '123',
          number_of_packages: 'potato',
          total_net_weight_kg: 1.2,
          total_net_weight_unit: 'KG',
          row_location: {
            rowNumber: 1
          }
        }
      ],
      business_checks: {
        all_required_fields_present: true
      },
      establishment_numbers: ['RMS-GB-000000-000']
    }

    const result = validatePackingListByIndexAndType(packingList)

    expect(result.hasAllFields).toBeFalsy()
    expect(result.invalidProductCodes.length).toBe(0)
    expect(result.missingIdentifier.length).toBe(0)
    expect(result.missingDescription.length).toBe(0)
    expect(result.missingPackages.length).toBe(0)
    expect(result.missingNetWeight.length).toBe(0)
    expect(result.invalidPackages.length).toBe(1)
    expect(result.invalidNetWeight.length).toBe(0)
    expect(result.hasRemos).toBeTruthy()
    expect(result.isEmpty).toBeFalsy()
    expect(result.hasSingleRms).toBeTruthy()
    expect(result.missingNetWeightUnit.length).toBe(0)
  })

  test('invalid net weight', () => {
    const packingList = {
      registration_approval_number: 'remos',
      items: [
        {
          description: 'description',
          nature_of_products: 'nature of products',
          type_of_treatment: 'treatment type',
          commodity_code: '123',
          number_of_packages: 1,
          total_net_weight_kg: 'potato',
          total_net_weight_unit: 'KG',
          row_location: {
            rowNumber: 1
          }
        }
      ],
      business_checks: {
        all_required_fields_present: true
      },
      establishment_numbers: ['RMS-GB-000000-000']
    }

    const result = validatePackingListByIndexAndType(packingList)

    expect(result.hasAllFields).toBeFalsy()
    expect(result.invalidProductCodes.length).toBe(0)
    expect(result.missingIdentifier.length).toBe(0)
    expect(result.missingDescription.length).toBe(0)
    expect(result.missingPackages.length).toBe(0)
    expect(result.missingNetWeight.length).toBe(0)
    expect(result.invalidPackages.length).toBe(0)
    expect(result.invalidNetWeight.length).toBe(1)
    expect(result.hasRemos).toBeTruthy()
    expect(result.isEmpty).toBeFalsy()
    expect(result.hasSingleRms).toBeTruthy()
    expect(result.missingNetWeightUnit.length).toBe(0)
  })

  test('multiple failures', () => {
    const packingList = {
      registration_approval_number: 'remos',
      items: [
        {
          description: 'description',
          nature_of_products: 'nature of products',
          type_of_treatment: 'treatment type',
          commodity_code: '123',
          number_of_packages: 1,
          total_net_weight_kg: null,
          total_net_weight_unit: 'KG',
          row_location: {
            rowNumber: 1
          }
        },
        {
          description: 12345,
          nature_of_products: null,
          type_of_treatment: null,
          commodity_code: null,
          number_of_packages: 1,
          total_net_weight_kg: 2,
          total_net_weight_unit: 'KG',
          row_location: {
            rowNumber: 2
          }
        },
        {
          description: 12345,
          nature_of_products: null,
          type_of_treatment: 'Type C',
          commodity_code: 'Text',
          number_of_packages: 'Text',
          total_net_weight_kg: 'Text',
          total_net_weight_unit: 'KG',
          row_location: {
            rowNumber: 3
          }
        }
      ],
      business_checks: {
        all_required_fields_present: true
      },
      establishment_numbers: ['RMS-GB-000000-000']
    }

    const result = validatePackingListByIndexAndType(packingList)

    expect(result.hasAllFields).toBeFalsy()
    expect(result.missingIdentifier.length).toBe(1)
    expect(result.invalidProductCodes.length).toBe(1)
    expect(result.missingDescription.length).toBe(0)
    expect(result.missingPackages.length).toBe(0)
    expect(result.missingNetWeight.length).toBe(1)
    expect(result.invalidPackages.length).toBe(1)
    expect(result.invalidNetWeight.length).toBe(1)
    expect(result.hasRemos).toBeTruthy()
    expect(result.isEmpty).toBeFalsy()
    expect(result.hasSingleRms).toBeTruthy()
    expect(result.missingNetWeightUnit.length).toBe(0)
  })
})

describe('generateFailuresByIndexAndTypes', () => {
  const packingList = {
    registration_approval_number: 'RMS-GB-000000-000',
    items: [],
    business_checks: {
      all_required_fields_present: false
    },
    establishment_numbers: ['RMS-GB-000000-000']
  }

  test('valid data', () => {
    const validationResult = {
      hasAllFields: true,
      hasSingleRms: true
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeTruthy()
    expect(result.failureReasons).toBeFalsy()
  })

  test('no data', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: true,
      hasSingleRms: true,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('No product line data found')
  })

  test('missing identifier', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [{ rowNumber: 1 }],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('Identifier is missing')
  })

  test('missing description', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [{ rowNumber: 1 }],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('Product description is missing')
  })

  test('missing packages', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [{ rowNumber: 1 }],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('No of packages is missing')
  })

  test('missing net weight', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [{ rowNumber: 1 }],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('Total net weight is missing')
  })

  test('missing net weight unit', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [{ rowNumber: 1 }],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain(
      'Net Weight Unit of Measure (kg) not found'
    )
  })

  test('invalid packages', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [{ rowNumber: 1 }],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('No of packages is invalid')
  })

  test('invalid net weight', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [{ rowNumber: 1 }],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('Total net weight is invalid')
  })

  test('invalid product code', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [{ rowNumber: 1 }],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('Product code is invalid')
  })

  test('multiple RMS numbers', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: false,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain(
      'Multiple GB Place of Dispatch (Establishment) numbers found on packing list'
    )
  })

  test('net weight unit missing with unitInHeader true', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [{ rowNumber: 1 }],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const packingListWithHeaderUnit = {
      ...packingList,
      unitInHeader: true
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingListWithHeaderUnit
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain(
      'Net Weight Unit of Measure (kg) not found'
    )
  })

  test('net weight unit missing with unitInHeader false', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [{ rowNumber: 1 }],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const packingListWithoutHeaderUnit = {
      ...packingList,
      unitInHeader: false
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingListWithoutHeaderUnit
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain(
      'Net Weight Unit of Measure (kg) not found'
    )
  })

  test('NIRMS missing with blanketNirms true', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [{ rowNumber: 1 }],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const packingListWithBlanketNirms = {
      ...packingList,
      blanketNirms: true
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingListWithBlanketNirms
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain(
      'NIRMS/Non-NIRMS goods not specified'
    )
  })

  test('NIRMS missing with blanketNirms false', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [{ rowNumber: 1 }],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const packingListWithoutBlanketNirms = {
      ...packingList,
      blanketNirms: false
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingListWithoutBlanketNirms
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain(
      'NIRMS/Non-NIRMS goods not specified'
    )
  })

  test('invalid NIRMS', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [{ rowNumber: 1 }],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain(
      'Invalid entry for NIRMS/Non-NIRMS goods'
    )
  })

  test('missing country of origin', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [{ rowNumber: 1 }],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('Missing Country of Origin')
  })

  test('invalid country of origin', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [{ rowNumber: 1 }],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain(
      'Invalid Country of Origin ISO Code'
    )
  })

  test('ineligible items', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: [{ rowNumber: 1 }]
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain(
      'Prohibited item identified on the packing list'
    )
  })

  test('sheet-aware location formatting with single row', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [{ sheetName: 'Sheet1', rowNumber: 5 }],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('sheet "Sheet1" row 5')
  })

  test('sheet-aware location formatting with two rows', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [
        { sheetName: 'Sheet1', rowNumber: 5 },
        { sheetName: 'Sheet2', rowNumber: 3 }
      ],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain(
      'sheet "Sheet1" row 5 and sheet "Sheet2" row 3'
    )
  })

  test('sheet-aware location formatting with three rows', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [
        { sheetName: 'Sheet1', rowNumber: 5 },
        { sheetName: 'Sheet2', rowNumber: 3 },
        { sheetName: 'Sheet3', rowNumber: 7 }
      ],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain(
      'sheet "Sheet1" row 5, sheet "Sheet2" row 3 and sheet "Sheet3" row 7'
    )
  })

  test('sheet-aware location formatting with more than three rows', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [
        { sheetName: 'Sheet1', rowNumber: 5 },
        { sheetName: 'Sheet2', rowNumber: 3 },
        { sheetName: 'Sheet3', rowNumber: 7 },
        { sheetName: 'Sheet4', rowNumber: 2 },
        { sheetName: 'Sheet5', rowNumber: 9 }
      ],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('in addition to 2 other locations')
  })

  test('page-aware location formatting with single row', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [{ pageNumber: 1, rowNumber: 5 }],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('page 1 row 5')
  })

  test('page-aware location formatting with two rows', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [
        { pageNumber: 1, rowNumber: 5 },
        { pageNumber: 2, rowNumber: 3 }
      ],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('page 1 row 5 and page 2 row 3')
  })

  test('page-aware location formatting with more than three rows', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [
        { pageNumber: 1, rowNumber: 5 },
        { pageNumber: 2, rowNumber: 3 },
        { pageNumber: 3, rowNumber: 7 },
        { pageNumber: 4, rowNumber: 2 }
      ],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('in addition to 1 other locations')
  })

  test('row-only formatting with two rows', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [{ rowNumber: 5 }, { rowNumber: 8 }],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('rows 5 and 8')
  })

  test('row-only formatting with three rows', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [
        { rowNumber: 5 },
        { rowNumber: 8 },
        { rowNumber: 12 }
      ],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('rows 5, 8 and 12')
  })

  test('row-only formatting with more than three rows', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [
        { rowNumber: 5 },
        { rowNumber: 8 },
        { rowNumber: 12 },
        { rowNumber: 15 },
        { rowNumber: 20 }
      ],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain(
      'rows 5, 8, 12 in addition to 2 other locations'
    )
  })

  test('noMatch returns null failure reasons', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      noMatch: true,
      missingRemos: false,
      missingIdentifier: [],
      invalidProductCodes: [],
      missingDescription: [],
      missingPackages: [],
      missingNetWeight: [],
      invalidPackages: [],
      invalidNetWeight: [],
      hasSingleRms: true,
      missingNetWeightUnit: [],
      missingNirms: [],
      invalidNirms: [],
      missingCoO: [],
      invalidCoO: [],
      ineligibleItems: []
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toBeNull()
  })

  test('combined validation failures', () => {
    const validationResult = {
      hasAllFields: false,
      isEmpty: false,
      missingIdentifier: [{ rowNumber: 1 }],
      invalidProductCodes: [{ rowNumber: 2 }],
      missingDescription: [{ rowNumber: 3 }],
      missingPackages: [{ rowNumber: 4 }],
      missingNetWeight: [{ rowNumber: 5 }],
      invalidPackages: [{ rowNumber: 6 }],
      invalidNetWeight: [{ rowNumber: 7 }],
      hasSingleRms: false,
      missingNetWeightUnit: [{ rowNumber: 8 }],
      missingNirms: [{ rowNumber: 9 }],
      invalidNirms: [{ rowNumber: 10 }],
      missingCoO: [{ rowNumber: 11 }],
      invalidCoO: [{ rowNumber: 12 }],
      ineligibleItems: [{ rowNumber: 13 }]
    }

    const result = generateFailuresByIndexAndTypes(
      validationResult,
      packingList
    )

    expect(result.hasAllFields).toBeFalsy()
    expect(result.failureReasons).toContain('Identifier is missing')
    expect(result.failureReasons).toContain('Product code is invalid')
    expect(result.failureReasons).toContain('Product description is missing')
    expect(result.failureReasons).toContain('No of packages is missing')
    expect(result.failureReasons).toContain('Total net weight is missing')
    expect(result.failureReasons).toContain('No of packages is invalid')
    expect(result.failureReasons).toContain('Total net weight is invalid')
    expect(result.failureReasons).toContain('Multiple GB Place of Dispatch')
    expect(result.failureReasons).toContain('Net Weight Unit of Measure')
    expect(result.failureReasons).toContain(
      'NIRMS/Non-NIRMS goods not specified'
    )
    expect(result.failureReasons).toContain(
      'Invalid entry for NIRMS/Non-NIRMS goods'
    )
    expect(result.failureReasons).toContain('Missing Country of Origin')
    expect(result.failureReasons).toContain(
      'Invalid Country of Origin ISO Code'
    )
    expect(result.failureReasons).toContain('Prohibited item identified')
  })
})
