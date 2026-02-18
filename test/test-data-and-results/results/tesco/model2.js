/**
 * Tesco Model 2 test results
 */

import parserModel from '../../../../src/services/parser-model.js'
import failureReasons from '../../../../src/services/validators/packing-list-failure-reasons.js'

export default {
  validTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '0804500000',
        description: 'Tesco Mango ME BOS (120g x 8)7-8-20-36-39-77',
        nature_of_products: 'Chilled',
        number_of_packages: '4',
        total_net_weight_kg: '3.84',
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'BR',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '0804500000',
        description: 'Tesco Mango ME BOS (250g x 8)13-14-23-32-42-80',
        nature_of_products: 'Chilled',
        number_of_packages: '28',
        total_net_weight_kg: '56',
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'BR',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000015-009'],
    registration_approval_number: 'RMS-GB-000015-009',
    parserModel: parserModel.TESCO2
  },
  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '0709200010',
        description: 'TS Asp Bundles 180g',
        nature_of_products: 'Chilled',
        number_of_packages: '144',
        total_net_weight_kg: '25.92',
        type_of_treatment: 'Raw',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'GB',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '0709200010',
        description: 'TS Asp Tips Exp 125g',
        nature_of_products: 'Chilled',
        number_of_packages: '90',
        total_net_weight_kg: '11.25',
        type_of_treatment: 'Raw',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'PE',
        nirms: 'Non NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000015-009'],
    registration_approval_number: 'RMS-GB-000015-009',
    parserModel: parserModel.TESCO2
  },
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'Total net weight is missing in sheet "Sheet2" row 3.\n'
    },
    items: [
      {
        commodity_code: '0804500000',
        description: 'Tesco Mango ME BOS (120g x 8)7-8-20-36-39-77',
        nature_of_products: 'Chilled',
        number_of_packages: '4',
        total_net_weight_kg: null,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'BR',
        nirms: 'NIRMS'
      },
      {
        commodity_code: null,
        description: 'Tesco Mango ME BOS (250g x 8)13-14-23-32-42-80',
        nature_of_products: 'Chilled',
        number_of_packages: '28',
        total_net_weight_kg: '56',
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'BR',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000015-009'],
    registration_approval_number: 'RMS-GB-000015-009',
    parserModel: parserModel.TESCO2
  },
  emptyTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: null
    },
    items: [],
    establishment_numbers: [],
    registration_approval_number: null,
    parserModel: 'no-match',
    unitInHeader: false,
    validateCountryOfOrigin: false,
    blanketNirms: false
  },
  multipleRms: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasons.MULTIPLE_RMS
    },
    items: [
      {
        commodity_code: '0804500000',
        description: 'Tesco Mango ME BOS (120g x 8)7-8-20-36-39-77',
        nature_of_products: 'Chilled',
        number_of_packages: '4',
        total_net_weight_kg: '3.84',
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'kgs'
      },
      {
        commodity_code: '0804500000',
        description: 'Tesco Mango ME BOS (250g x 8)13-14-23-32-42-80',
        nature_of_products: 'Chilled',
        number_of_packages: '28',
        total_net_weight_kg: '56',
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'kgs'
      }
    ],
    establishment_numbers: ['RMS-GB-000015-009', 'RMS-GB-000015-010'],
    registration_approval_number: 'RMS-GB-000015-009',
    parserModel: parserModel.TESCO2
  },
  missingKgunit: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'Net Weight Unit of Measure (kg) not found.\n'
    },
    items: [
      {
        commodity_code: '0804500000',
        description: 'Tesco Mango ME BOS (120g x 8)7-8-20-36-39-77',
        nature_of_products: 'Chilled',
        number_of_packages: '4',
        total_net_weight_kg: '3.84',
        type_of_treatment: 'Processed',
        total_net_weight_unit: null
      },
      {
        commodity_code: '0804500000',
        description: 'Tesco Mango ME BOS (250g x 8)13-14-23-32-42-80',
        nature_of_products: 'Chilled',
        number_of_packages: '28',
        total_net_weight_kg: '56',
        type_of_treatment: 'Processed',
        total_net_weight_unit: null
      }
    ],
    establishment_numbers: ['RMS-GB-000015-009'],
    registration_approval_number: 'RMS-GB-000015-009',
    parserModel: parserModel.TESCO2
  },
  missingRow: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '0804500000',
        description: 'Tesco Mango ME BOS (120g x 8)7-8-20-36-39-77',
        nature_of_products: 'Chilled',
        number_of_packages: '4',
        total_net_weight_kg: '3.84',
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG'
      }
    ],
    establishment_numbers: ['RMS-GB-000015-009'],
    registration_approval_number: 'RMS-GB-000015-009',
    parserModel: parserModel.TESCO2
  },

  // === Country of Origin (CoO) Validation Test Results ===

  // BAC1: NOT within NIRMS Scheme - passes validation
  nonNirmsResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '0123456789',
        description: 'Test Product',
        nature_of_products: 'Chilled',
        number_of_packages: '10',
        total_net_weight_kg: '5.00',
        type_of_treatment: 'Raw',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'GB',
        nirms: 'Non NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000015-009'],
    registration_approval_number: 'RMS-GB-000015-009',
    parserModel: parserModel.TESCO2
  },

  // BAC2: Null NIRMS value - validation errors
  nullNirmsResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: ['NIRMS/Non-NIRMS goods not specified for line 1']
    },
    items: [
      {
        commodity_code: '0123456789',
        description: 'Test Product',
        nature_of_products: 'Chilled',
        number_of_packages: '10',
        total_net_weight_kg: '5.00',
        type_of_treatment: 'Raw',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'GB',
        nirms: null
      }
    ],
    establishment_numbers: ['RMS-GB-000015-009'],
    registration_approval_number: 'RMS-GB-000015-009',
    parserModel: parserModel.TESCO2
  },

  // BAC3: Invalid NIRMS value - validation errors
  invalidNirmsResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: ['Invalid entry for NIRMS/Non-NIRMS goods for line 1']
    },
    items: [
      {
        commodity_code: '0123456789',
        description: 'Test Product',
        nature_of_products: 'Chilled',
        number_of_packages: '10',
        total_net_weight_kg: '5.00',
        type_of_treatment: 'Raw',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'GB',
        nirms: 'INVALID_NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000015-009'],
    registration_approval_number: 'RMS-GB-000015-009',
    parserModel: parserModel.TESCO2
  },

  // BAC4: Null NIRMS value, more than 3 - validation errors with summary
  nullNirmsMultipleResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: expect.arrayContaining([
        expect.stringContaining(
          'NIRMS/Non-NIRMS goods not specified for line 1'
        ),
        expect.stringContaining(
          'NIRMS/Non-NIRMS goods not specified for line 2'
        ),
        expect.stringContaining(
          'NIRMS/Non-NIRMS goods not specified for line 3'
        ),
        expect.stringContaining('in addition to')
      ])
    }
  },

  // BAC5: Invalid NIRMS value, more than 3 - validation errors with summary
  invalidNirmsMultipleResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: expect.arrayContaining([
        expect.stringContaining(
          'Invalid entry for NIRMS/Non-NIRMS goods for line 1'
        ),
        expect.stringContaining(
          'Invalid entry for NIRMS/Non-NIRMS goods for line 2'
        ),
        expect.stringContaining(
          'Invalid entry for NIRMS/Non-NIRMS goods for line 3'
        ),
        expect.stringContaining('in addition to')
      ])
    }
  },

  // BAC6: Null CoO Value - validation errors
  nullCooResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: ['Missing Country of Origin for line 1']
    },
    items: [
      {
        commodity_code: '0123456789',
        description: 'Test Product',
        nature_of_products: 'Chilled',
        number_of_packages: '10',
        total_net_weight_kg: '5.00',
        type_of_treatment: 'Raw',
        total_net_weight_unit: 'kgs',
        country_of_origin: null,
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000015-009'],
    registration_approval_number: 'RMS-GB-000015-009',
    parserModel: parserModel.TESCO2
  },

  // BAC7: Invalid CoO Value - validation errors
  invalidCooResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: ['Invalid Country of Origin ISO Code for line 1']
    },
    items: [
      {
        commodity_code: '0123456789',
        description: 'Test Product',
        nature_of_products: 'Chilled',
        number_of_packages: '10',
        total_net_weight_kg: '5.00',
        type_of_treatment: 'Raw',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'INVALID_ISO',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000015-009'],
    registration_approval_number: 'RMS-GB-000015-009',
    parserModel: parserModel.TESCO2
  },

  // BAC8: Null CoO Value, more than 3 - validation errors with summary
  nullCooMultipleResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: expect.arrayContaining([
        expect.stringContaining('Missing Country of Origin for line 1'),
        expect.stringContaining('Missing Country of Origin for line 2'),
        expect.stringContaining('Missing Country of Origin for line 3'),
        expect.stringContaining('in addition to')
      ])
    }
  },

  // BAC9: Invalid CoO Value, more than 3 - validation errors with summary
  invalidCooMultipleResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: expect.arrayContaining([
        expect.stringContaining(
          'Invalid Country of Origin ISO Code for line 1'
        ),
        expect.stringContaining(
          'Invalid Country of Origin ISO Code for line 2'
        ),
        expect.stringContaining(
          'Invalid Country of Origin ISO Code for line 3'
        ),
        expect.stringContaining('in addition to')
      ])
    }
  },

  // BAC10: CoO Value is X or x - passes validation
  cooPlaceholderXResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '0123456789',
        description: 'Test Product',
        nature_of_products: 'Chilled',
        number_of_packages: '10',
        total_net_weight_kg: '5.00',
        type_of_treatment: 'Raw',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'X',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000015-009'],
    registration_approval_number: 'RMS-GB-000015-009',
    parserModel: parserModel.TESCO2
  },

  // BAC11: Item Present on Prohibited Item List (Treatment Type specified) - validation errors
  prohibitedItemsWithTreatmentResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: [
        'Prohibited item identified on the packing list for line 1'
      ]
    },
    items: [
      {
        commodity_code: '1234',
        description: 'Test Product',
        nature_of_products: 'Chilled',
        number_of_packages: '10',
        total_net_weight_kg: '5.00',
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'PROHIBITED_ITEM_ISO',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000015-009'],
    registration_approval_number: 'RMS-GB-000015-009',
    parserModel: parserModel.TESCO2
  },

  // BAC12: Item Present on Prohibited Item List, more than 3 (Treatment Type specified) - validation errors with summary
  prohibitedItemsMultipleWithTreatmentResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: expect.arrayContaining([
        expect.stringContaining(
          'Prohibited item identified on the packing list for line 1'
        ),
        expect.stringContaining(
          'Prohibited item identified on the packing list for line 2'
        ),
        expect.stringContaining(
          'Prohibited item identified on the packing list for line 3'
        ),
        expect.stringContaining('in addition to')
      ])
    }
  },

  // BAC13: Item Present on Prohibited Item List (no Treatment Type specified) - validation errors
  prohibitedItemsNoTreatmentResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: [
        'Prohibited item identified on the packing list for line 1'
      ]
    },
    items: [
      {
        commodity_code: '1234',
        description: 'Test Product',
        nature_of_products: 'Chilled',
        number_of_packages: '10',
        total_net_weight_kg: '5.00',
        type_of_treatment: null,
        total_net_weight_unit: 'kgs',
        country_of_origin: 'PROHIBITED_ITEM_ISO',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000015-009'],
    registration_approval_number: 'RMS-GB-000015-009',
    parserModel: parserModel.TESCO2
  },

  // BAC14: Item Present on Prohibited Item List, more than 3 (no Treatment Type specified) - validation errors with summary
  prohibitedItemsMultipleNoTreatmentResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: expect.arrayContaining([
        expect.stringContaining(
          'Prohibited item identified on the packing list for line 1'
        ),
        expect.stringContaining(
          'Prohibited item identified on the packing list for line 2'
        ),
        expect.stringContaining(
          'Prohibited item identified on the packing list for line 3'
        ),
        expect.stringContaining('in addition to')
      ])
    }
  },

  // Valid CoO Model with all fields properly set
  validCooResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '0123456789',
        description: 'Valid Test Product 1',
        nature_of_products: 'Chilled',
        number_of_packages: '10',
        total_net_weight_kg: '5.00',
        type_of_treatment: 'Raw',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'VALID_ISO',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '0987654321',
        description: 'Valid Test Product 2',
        nature_of_products: 'Frozen',
        number_of_packages: '15',
        total_net_weight_kg: '7.00',
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'GB',
        nirms: 'Non NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000015-009'],
    registration_approval_number: 'RMS-GB-000015-009',
    parserModel: parserModel.TESCO2
  }
}
