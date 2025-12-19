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
        commodity_code: null,
        description: '100000261 DAILY CROISSANT CHOCO 1PK',
        nature_of_products: 'Bakery Bought In',
        number_of_packages: 1,
        total_net_weight_kg: 0.059,
        type_of_treatment: 'Ambient Grocery',
        total_net_weight_unit: 'kgs'
      },
      {
        commodity_code: null,
        description: '100000859 ASDA CREPES TOFFEE 180G',
        nature_of_products: 'Bakery Bought In',
        number_of_packages: 1,
        total_net_weight_kg: 0.204,
        type_of_treatment: 'Ambient Grocery',
        total_net_weight_unit: 'kgs'
      }
    ],
    registration_approval_number: 'RMS-GB-000015-006',
    parserModel: parserModel.ASDA3
  },
  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: null,
        description: '100000261 DAILY CROISSANT CHOCO 1PK',
        nature_of_products: 'Bakery Bought In',
        number_of_packages: 1,
        total_net_weight_kg: 0.059,
        type_of_treatment: 'Ambient Grocery',
        total_net_weight_unit: 'kgs'
      },
      {
        commodity_code: null,
        description: '100000859 ASDA CREPES TOFFEE 180G',
        nature_of_products: 'Bakery Bought In',
        number_of_packages: 1,
        total_net_weight_kg: 0.204,
        type_of_treatment: 'Ambient Grocery',
        total_net_weight_unit: 'kgs'
      }
    ],
    registration_approval_number: 'RMS-GB-000015-006',
    parserModel: parserModel.ASDA3
  },
  validParserResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: null,
        description: '100000261 DAILY CROISSANT CHOCO 1PK',
        nature_of_products: 'Bakery Bought In',
        number_of_packages: 1,
        total_net_weight_kg: 0.059,
        type_of_treatment: 'Ambient Grocery',
        total_net_weight_unit: 'kgs'
      },
      {
        commodity_code: null,
        description: '100000859 ASDA CREPES TOFFEE 180G',
        nature_of_products: 'Bakery Bought In',
        number_of_packages: 1,
        total_net_weight_kg: 0.204,
        type_of_treatment: 'Ambient Grocery',
        total_net_weight_unit: 'kgs'
      }
    ],
    registration_approval_number: 'RMS-GB-000015-006',
    parserModel: parserModel.ASDA3
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
        type_of_treatment: null
      }
    ],
    registration_approval_number: null,
    parserModel: parserModel.ASDA3
  },
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Identifier is missing in sheet "Page1_1" row 3 and sheet "Page1_1" row 4.\n'
    },
    items: [
      {
        commodity_code: null,
        description: '100000261 DAILY CROISSANT CHOCO 1PK',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 0.059,
        type_of_treatment: 'Ambient Grocery',
        total_net_weight_unit: 'kgs'
      },
      {
        commodity_code: null,
        description: '100000859 ASDA CREPES TOFFEE 180G',
        nature_of_products: 'Bakery Bought In',
        number_of_packages: 1,
        total_net_weight_kg: 0.204,
        type_of_treatment: null,
        total_net_weight_unit: 'kgs'
      }
    ],
    registration_approval_number: 'RMS-GB-000015-006',
    parserModel: parserModel.ASDA3
  },
  multipleRms: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasonsDescriptions.MULTIPLE_RMS
    },
    items: [
      {
        commodity_code: null,
        description: '100000261 DAILY CROISSANT CHOCO 1PK',
        nature_of_products: 'Bakery Bought In',
        number_of_packages: 1,
        total_net_weight_kg: 0.059,
        type_of_treatment: 'Ambient Grocery',
        total_net_weight_unit: 'kgs'
      },
      {
        commodity_code: null,
        description: '100000859 ASDA CREPES TOFFEE 180G',
        nature_of_products: 'Bakery Bought In',
        number_of_packages: 1,
        total_net_weight_kg: 0.204,
        type_of_treatment: 'Ambient Grocery',
        total_net_weight_unit: 'kgs'
      }
    ],
    establishment_numbers: ['RMS-GB-000015-006', 'RMS-GB-000015-007'],
    registration_approval_number: 'RMS-GB-000015-006',
    parserModel: parserModel.ASDA3
  },
  missingKgunit: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Net Weight Unit of Measure (kg) not found in sheet "Page1_1" row 2 and sheet "Page1_1" row 3.\n'
    },
    items: [
      {
        commodity_code: null,
        description: '100000261 DAILY CROISSANT CHOCO 1PK',
        nature_of_products: 'Bakery Bought In',
        number_of_packages: 1,
        total_net_weight_kg: 0.059,
        type_of_treatment: 'Ambient Grocery',
        total_net_weight_unit: null
      },
      {
        commodity_code: null,
        description: '100000859 ASDA CREPES TOFFEE 180G',
        nature_of_products: 'Bakery Bought In',
        number_of_packages: 1,
        total_net_weight_kg: 0.204,
        type_of_treatment: 'Ambient Grocery',
        total_net_weight_unit: null
      }
    ],
    establishment_numbers: ['RMS-GB-000015-006'],
    registration_approval_number: 'RMS-GB-000015-006',
    parserModel: parserModel.ASDA3
  }
}
