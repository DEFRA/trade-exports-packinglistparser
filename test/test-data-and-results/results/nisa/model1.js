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
        commodity_code: '2005995090',
        description: 'DAIRYLEA DUNKERS JUMBO PM80P',
        nature_of_products: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        number_of_packages: 2,
        total_net_weight_kg: 2.5,
        total_net_weight_unit: 'KG',
        nirms: 'N'
      },
      {
        commodity_code: '0403209300',
        description: 'NISA BROCCOLI',
        nature_of_products: '900 - VEGETABLES PREPACK-C',
        number_of_packages: 1,
        total_net_weight_kg: 2,
        total_net_weight_unit: 'KG',
        nirms: 'N'
      }
    ],
    establishment_numbers: ['RMS-GB-000025-001'],
    registration_approval_number: 'RMS-GB-000025-001',
    parserModel: parserModel.NISA1
  },
  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '1602321990',
        description: 'CO OP BRITISH CHICKEN POPPERS',
        nature_of_products: '790 - PASTRY - C',
        number_of_packages: 4,
        total_net_weight_kg: 2.4,
        total_net_weight_unit: 'KG',
        nirms: 'N'
      },
      {
        commodity_code: '1604207055',
        description: 'CO OP TUNA MAYONNAISE SANDWICH',
        nature_of_products: '710 - SANDWICHES - C',
        number_of_packages: 4,
        total_net_weight_kg: 3.2,
        total_net_weight_unit: 'KG',
        nirms: 'N'
      }
    ],
    establishment_numbers: ['RMS-GB-000025-001'],
    registration_approval_number: 'RMS-GB-000025-001',
    parserModel: parserModel.NISA1
  },
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'No of packages is missing in sheet "Customer Order" row 2.\nTotal net weight is missing in sheet "Customer Order" row 3.\n'
    },
    items: [
      {
        commodity_code: '2005995090',
        description: 'DAIRYLEA DUNKERS JUMBO PM80P',
        nature_of_products: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        number_of_packages: null,
        total_net_weight_kg: 2.5,
        total_net_weight_unit: 'KG',
        nirms: 'N'
      },
      {
        commodity_code: '0403209300',
        description: 'NISA BROCCOLI',
        nature_of_products: '900 - VEGETABLES PREPACK-C',
        number_of_packages: 1,
        total_net_weight_kg: null,
        total_net_weight_unit: 'KG',
        nirms: 'N'
      }
    ],
    establishment_numbers: ['RMS-GB-000025-001'],
    registration_approval_number: 'RMS-GB-000025-001',
    parserModel: parserModel.NISA1
  },
  emptyTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: null,
        description: null,
        nature_of_products: null,
        number_of_packages: null,
        total_net_weight_kg: null,
        total_net_weight_unit: null,
        nirms: null
      }
    ],
    establishment_numbers: ['RMS-GB-000025-001'],
    registration_approval_number: 'RMS-GB-000025-001',
    parserModel: parserModel.NISA1
  },
  multipleRms: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasonsDescriptions.MULTIPLE_RMS
    },
    items: [
      {
        commodity_code: '2005995090',
        description: 'DAIRYLEA DUNKERS JUMBO PM80P',
        nature_of_products: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        number_of_packages: 2,
        total_net_weight_kg: 2.5,
        total_net_weight_unit: 'KG',
        nirms: 'N'
      },
      {
        commodity_code: '0403209300',
        description: 'NISA BROCCOLI',
        nature_of_products: '900 - VEGETABLES PREPACK-C',
        number_of_packages: 1,
        total_net_weight_kg: 2,
        total_net_weight_unit: 'KG',
        nirms: 'N'
      }
    ],
    establishment_numbers: ['RMS-GB-000025-001', 'RMS-GB-000025-002'],
    registration_approval_number: 'RMS-GB-000025-001',
    parserModel: parserModel.NISA1
  },
  missingKgunit: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'Net Weight Unit of Measure (kg) not found.\n'
    },
    items: [
      {
        commodity_code: '2005995090',
        description: 'DAIRYLEA DUNKERS JUMBO PM80P',
        nature_of_products: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        number_of_packages: 2,
        total_net_weight_kg: 2.5,
        total_net_weight_unit: null,
        nirms: 'N'
      },
      {
        commodity_code: '0403209300',
        description: 'NISA BROCCOLI',
        nature_of_products: '900 - VEGETABLES PREPACK-C',
        number_of_packages: 1,
        total_net_weight_kg: 2,
        total_net_weight_unit: null,
        nirms: 'N'
      }
    ],
    establishment_numbers: ['RMS-GB-000025-001'],
    registration_approval_number: 'RMS-GB-000025-001',
    parserModel: parserModel.NISA1
  }
}
