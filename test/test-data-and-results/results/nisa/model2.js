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
        type_of_treatment: null
      },
      {
        commodity_code: '0403209300',
        description: 'NISA BROCCOLI',
        nature_of_products: '900 - VEGETABLES PREPACK-C',
        number_of_packages: 1,
        total_net_weight_kg: 2,
        total_net_weight_unit: 'KG',
        type_of_treatment: null
      }
    ],
    establishment_numbers: ['RMS-GB-000025-003'],
    registration_approval_number: 'RMS-GB-000025-003',
    parserModel: parserModel.NISA2
  },
  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '2004909880',
        description: 'GREEN ISLE BATTERED ONION RING',
        nature_of_products: '500 - VEGETABLES - F',
        number_of_packages: 9,
        total_net_weight_kg: 63,
        total_net_weight_unit: 'KG',
        type_of_treatment: null
      },
      {
        commodity_code: '2004109900',
        description: 'MCCAIN READY BAKED JACKETS 4PK',
        nature_of_products: '515 - F/P POTATOES - F',
        number_of_packages: 28,
        total_net_weight_kg: 176.4,
        total_net_weight_unit: 'KG',
        type_of_treatment: null
      }
    ],
    establishment_numbers: ['RMS-GB-000025-003'],
    registration_approval_number: 'RMS-GB-000025-003',
    parserModel: parserModel.NISA2
  },
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Identifier is missing in sheet "sheet" row 5.\nTotal net weight is missing in sheet "sheet" row 4.\n'
    },
    items: [
      {
        commodity_code: '2005995090',
        description: 'DAIRYLEA DUNKERS JUMBO PM80P',
        nature_of_products: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        number_of_packages: 2,
        total_net_weight_kg: null,
        total_net_weight_unit: 'KG',
        type_of_treatment: null
      },
      {
        commodity_code: null,
        description: 'NISA BROCCOLI',
        nature_of_products: '900 - VEGETABLES PREPACK-C',
        number_of_packages: 1,
        total_net_weight_kg: 2,
        total_net_weight_unit: 'KG',
        type_of_treatment: null
      }
    ],
    registration_approval_number: 'RMS-GB-000025-003',
    parserModel: parserModel.NISA2
  },
  emptyTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: null,
    parserModel: parserModel.NISA2
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
        type_of_treatment: null
      },
      {
        commodity_code: '0403209300',
        description: 'NISA BROCCOLI',
        nature_of_products: '900 - VEGETABLES PREPACK-C',
        number_of_packages: 1,
        total_net_weight_kg: 2,
        total_net_weight_unit: 'KG',
        type_of_treatment: null
      }
    ],
    establishment_numbers: ['RMS-GB-000025-003', 'RMS-GB-000025-004'],
    registration_approval_number: 'RMS-GB-000025-003',
    parserModel: parserModel.NISA2
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
        type_of_treatment: null
      },
      {
        commodity_code: '0403209300',
        description: 'NISA BROCCOLI',
        nature_of_products: '900 - VEGETABLES PREPACK-C',
        number_of_packages: 1,
        total_net_weight_kg: 2,
        total_net_weight_unit: null,
        type_of_treatment: null
      }
    ],
    establishment_numbers: ['RMS-GB-000025-003'],
    registration_approval_number: 'RMS-GB-000025-003',
    parserModel: parserModel.NISA2
  },
  missingMandatoryData: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Identifier is missing in sheet "sheet" row 5.\nProduct description is missing in sheet "sheet" row 5.\nNo of packages is missing in sheet "sheet" row 5.\nTotal net weight is missing in sheet "sheet" row 5.\n'
    },
    items: [
      {
        commodity_code: '2005995090',
        description: 'DAIRYLEA DUNKERS JUMBO PM80P',
        nature_of_products: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        number_of_packages: 2,
        total_net_weight_kg: 2.5,
        total_net_weight_unit: 'KG',
        type_of_treatment: null
      },
      {
        commodity_code: null,
        description: null,
        nature_of_products: null,
        number_of_packages: null,
        total_net_weight_kg: null,
        total_net_weight_unit: 'KG',
        type_of_treatment: null
      }
    ],
    establishment_numbers: ['RMS-GB-000025-003'],
    registration_approval_number: 'RMS-GB-000025-003',
    parserModel: parserModel.NISA2
  }
}
