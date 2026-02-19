/**
 * Boots Model 1 expected test results
 *
 * Expected parser output for corresponding test data models.
 */
import ParserModel from '../../../../src/services/parser-model.js'
import failureReasonsDescriptions from '../../../../src/services/validators/packing-list-failure-reasons.js'

export default {
  validTestResult: {
    registration_approval_number: 'RMS-GB-000084-001',
    items: [
      {
        description: 'Haribo Starmix share bag 160g',
        commodity_code: 1704906500,
        number_of_packages: 12,
        total_net_weight_kg: 1.94,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null
      },
      {
        description: 'Kind bars drk chclt nts&SS 30g 3s',
        commodity_code: 1806310000,
        number_of_packages: 4,
        total_net_weight_kg: 0.46,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null
      },
      {
        description: 'CADBURYS_DAIRY_MILK, FRUIT_NUT',
        commodity_code: 1806321000,
        number_of_packages: 48,
        total_net_weight_kg: 2.4,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null
      },
      {
        description: 'Rhythm 108 mlk choc tab hazel 100g',
        commodity_code: 1806321000,
        number_of_packages: 9,
        total_net_weight_kg: 0.91,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null
      },
      {
        description: 'Kind Dark Choc Bar Nuts & Sea Salt 40g',
        commodity_code: 1806321000,
        number_of_packages: 12,
        total_net_weight_kg: 0.48,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null
      },
      {
        description: 'Kind Pnut Btter & Dark Choc Bar 40g',
        commodity_code: 1806321000,
        number_of_packages: 12,
        total_net_weight_kg: 0.48,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null
      },
      {
        description: 'Galaxy Milk single 42g',
        commodity_code: 1806329000,
        number_of_packages: 24,
        total_net_weight_kg: 1.03,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null
      },
      {
        description: 'Heinz Chocolate Biscotti Stg2 60g',
        commodity_code: 1806329000,
        number_of_packages: 6,
        total_net_weight_kg: 0.36,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null
      }
    ],
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    parserModel: ParserModel.BOOTS1
  },
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Total net weight is missing in sheet "05122024 5223 SSC NI ROUTE1 - A" row 19.\n'
    },
    items: [
      {
        description: 'Haribo Starmix share bag 160g',
        commodity_code: 1704906500,
        number_of_packages: 12,
        total_net_weight_kg: null,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null
      }
    ],
    registration_approval_number: 'RMS-GB-000084-001',
    parserModel: ParserModel.BOOTS1
  },
  emptyTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: 'RMS-GB-000084-001',
    parserModel: ParserModel.BOOTS1
  },
  failedTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: 'RMS-GB-000084-001',
    parserModel: ParserModel.BOOTS1
  },
  multipleRms: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasonsDescriptions.MULTIPLE_RMS
    },
    items: [
      {
        description: 'Haribo Starmix share bag 160g',
        commodity_code: 1704906500,
        number_of_packages: 12,
        total_net_weight_kg: 1.94,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null
      }
    ],
    establishment_numbers: ['RMS-GB-000084-001', 'RMS-GB-000084-002'],
    registration_approval_number: 'RMS-GB-000084-001',
    parserModel: ParserModel.BOOTS1
  },
  missingKgunit: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'Net Weight Unit of Measure (kg) not found.\n'
    },
    items: [
      {
        description: 'Haribo Starmix share bag 160g',
        commodity_code: 1704906500,
        number_of_packages: 12,
        total_net_weight_kg: 1.94,
        total_net_weight_unit: null,
        nature_of_products: null,
        type_of_treatment: null
      }
    ],
    establishment_numbers: ['RMS-GB-000084-001'],
    registration_approval_number: 'RMS-GB-000084-001',
    parserModel: ParserModel.BOOTS1
  }
}
