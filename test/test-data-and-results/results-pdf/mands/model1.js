import parserModel from '../../../../src/services/parser-model.js'
import failureReasonsDescriptions from '../../../../src/services/validators/packing-list-failure-reasons.js'

export default {
  validTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        description: 'SB* 220M CAPPUCI CHILLED CUP',
        commodity_code: '2202999990',
        nature_of_products: null,
        number_of_packages: '10',
        total_net_weight_kg: '2.3275',
        type_of_treatment: 'Chilled',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      }
    ],
    registration_approval_number: 'RMS-GB-000008-001',
    parserModel: parserModel.MANDS1
  },
  emptyTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: 'RMS-GB-000008-001',
    parserModel: parserModel.MANDS1
  },
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.IDENTIFIER_MISSING + ' in page 1 row 1.\n'
    },
    items: [
      {
        description: 'SB* 220M CAPPUCI CHILLED CUP',
        commodity_code: null,
        nature_of_products: null,
        number_of_packages: '10',
        total_net_weight_kg: '2.3275',
        type_of_treatment: 'Chilled',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      }
    ],
    registration_approval_number: 'RMS-GB-000008-001',
    parserModel: parserModel.MANDS1
  },
  nonNirmsTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        description: 'Natural Spring Water',
        commodity_code: '2201100011',
        nature_of_products: null,
        number_of_packages: '20',
        total_net_weight_kg: '10.0',
        type_of_treatment: 'Ambient',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      },
      {
        description: 'Organic Apple Juice',
        commodity_code: '2009890011',
        nature_of_products: null,
        number_of_packages: '15',
        total_net_weight_kg: '7.5',
        type_of_treatment: 'Chilled',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      }
    ],
    registration_approval_number: 'RMS-GB-000008-001',
    parserModel: parserModel.MANDS1
  },
  invalidNirmsTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.NIRMS_INVALID + ' in page 1 row 1.\n'
    },
    items: [
      {
        description: 'Invalid NIRMS Product',
        commodity_code: '1234567890',
        nature_of_products: null,
        number_of_packages: '5',
        total_net_weight_kg: '2.5',
        type_of_treatment: 'Ambient',
        total_net_weight_unit: 'Kg',
        nirms: 'maybe'
      }
    ],
    registration_approval_number: 'RMS-GB-000008-001',
    parserModel: parserModel.MANDS1
  },
  missingNirmsTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.NIRMS_MISSING + ' in page 1 row 1.\n'
    },
    items: [
      {
        description: 'Missing NIRMS Product',
        commodity_code: '9876543210',
        nature_of_products: null,
        number_of_packages: '8',
        total_net_weight_kg: '4.0',
        type_of_treatment: 'Frozen',
        total_net_weight_unit: 'Kg',
        nirms: null
      }
    ],
    registration_approval_number: 'RMS-GB-000008-001',
    parserModel: parserModel.MANDS1
  },
  missingCoOTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.COO_MISSING +
        ' in page 1 row 2, page 1 row 3, page 1 row 4 in addition to 1 other location.\n'
    },
    items: [
      {
        description: 'Product with CoO',
        commodity_code: '1111111111',
        nature_of_products: null,
        number_of_packages: '3',
        total_net_weight_kg: '1.5',
        type_of_treatment: 'Ambient',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      },
      {
        description: 'Product missing CoO 1',
        commodity_code: '2222222222',
        nature_of_products: null,
        number_of_packages: '4',
        total_net_weight_kg: '2.0',
        type_of_treatment: 'Chilled',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      },
      {
        description: 'Product missing CoO 2',
        commodity_code: '3333333333',
        nature_of_products: null,
        number_of_packages: '5',
        total_net_weight_kg: '2.5',
        type_of_treatment: 'Frozen',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      },
      {
        description: 'Product missing CoO 3',
        commodity_code: '4444444444',
        nature_of_products: null,
        number_of_packages: '6',
        total_net_weight_kg: '3.0',
        type_of_treatment: 'Ambient',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      },
      {
        description: 'Product missing CoO 4',
        commodity_code: '5555555555',
        nature_of_products: null,
        number_of_packages: '7',
        total_net_weight_kg: '3.5',
        type_of_treatment: 'Chilled',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      }
    ],
    registration_approval_number: 'RMS-GB-000008-001',
    parserModel: parserModel.MANDS1
  },
  invalidCoOTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.COO_INVALID +
        ' in page 1 row 1, page 1 row 2, page 1 row 3 in addition to 3 other locations.\n'
    },
    items: [
      {
        description: 'Invalid CoO Product 1',
        commodity_code: '1111111111',
        nature_of_products: null,
        number_of_packages: '2',
        total_net_weight_kg: '1.0',
        type_of_treatment: 'Ambient',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      },
      {
        description: 'Invalid CoO Product 2',
        commodity_code: '2222222222',
        nature_of_products: null,
        number_of_packages: '3',
        total_net_weight_kg: '1.5',
        type_of_treatment: 'Chilled',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      },
      {
        description: 'Invalid CoO Product 3',
        commodity_code: '3333333333',
        nature_of_products: null,
        number_of_packages: '4',
        total_net_weight_kg: '2.0',
        type_of_treatment: 'Frozen',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      },
      {
        description: 'Invalid CoO Product 4',
        commodity_code: '4444444444',
        nature_of_products: null,
        number_of_packages: '5',
        total_net_weight_kg: '2.5',
        type_of_treatment: 'Ambient',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      },
      {
        description: 'Invalid CoO Product 5',
        commodity_code: '5555555555',
        nature_of_products: null,
        number_of_packages: '6',
        total_net_weight_kg: '3.0',
        type_of_treatment: 'Chilled',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      },
      {
        description: 'Invalid CoO Product 6',
        commodity_code: '6666666666',
        nature_of_products: null,
        number_of_packages: '7',
        total_net_weight_kg: '3.5',
        type_of_treatment: 'Frozen',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      }
    ],
    registration_approval_number: 'RMS-GB-000008-001',
    parserModel: parserModel.MANDS1
  },
  xCoOTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        description: 'Product with X CoO 1',
        commodity_code: '1111111111',
        nature_of_products: null,
        number_of_packages: '10',
        total_net_weight_kg: '5.0',
        type_of_treatment: 'Ambient',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      },
      {
        description: 'Product with X CoO 2',
        commodity_code: '2222222222',
        nature_of_products: null,
        number_of_packages: '15',
        total_net_weight_kg: '7.5',
        type_of_treatment: 'Chilled',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      }
    ],
    registration_approval_number: 'RMS-GB-000008-001',
    parserModel: parserModel.MANDS1
  },
  ineligibleItemsTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.PROHIBITED_ITEM +
        ' in page 1 row 1, page 1 row 2, page 1 row 3.\n'
    },
    items: [
      {
        description: 'Safe Product 1',
        commodity_code: '012',
        nature_of_products: null,
        number_of_packages: '2',
        total_net_weight_kg: '1.0',
        type_of_treatment: 'Ambient',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      },
      {
        description: 'Ineligible Carrot Product',
        commodity_code: '07061000',
        nature_of_products: null,
        number_of_packages: '5',
        total_net_weight_kg: '10.0',
        type_of_treatment: 'Chilled',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      },
      {
        description: 'Safe Product 2',
        commodity_code: '3333333333',
        nature_of_products: null,
        number_of_packages: '3',
        total_net_weight_kg: '1.5',
        type_of_treatment: 'Frozen',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      },
      {
        description: 'Ineligible Celery Product',
        commodity_code: '07094000',
        nature_of_products: null,
        number_of_packages: '8',
        total_net_weight_kg: '15.0',
        type_of_treatment: 'Fresh',
        total_net_weight_unit: 'Kg',
        nirms: 'no'
      }
    ],
    registration_approval_number: 'RMS-GB-000008-001',
    parserModel: parserModel.MANDS1
  }
}
