import parserModel from '../../../../src/services/parser-model.js'
import failureReasonsDescriptions from '../../../../src/services/validators/packing-list-failure-reasons.js'

export default {
  validTestResult: {
    establishment_numbers: ['RMS-GB-000247-001'],
    registration_approval_number: 'RMS-GB-000247-001',
    items: [
      {
        description: 'CARESS MASSAGE SPONGE 3 PACK',
        nature_of_products: null,
        type_of_treatment: null,
        commodity_code: 3924900090,
        number_of_packages: 1,
        total_net_weight_kg: 0.3,
        total_net_weight_unit: 'KGs'
      },
      {
        description: 'PEPSI MAX 500ML.',
        nature_of_products: null,
        type_of_treatment: null,
        commodity_code: 3004900000,
        number_of_packages: 2,
        total_net_weight_kg: 6.4,
        total_net_weight_unit: 'KGs'
      },
      {
        description: 'DRI-PAK SODA CRYSTALS 1KG.',
        nature_of_products: null,
        type_of_treatment: null,
        commodity_code: 3306900000,
        number_of_packages: 2,
        total_net_weight_kg: 12.16,
        total_net_weight_unit: 'KGs'
      }
    ],
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    parserModel: parserModel.SAVERS1
  },
  validTestResultForMultipleSheets: {
    establishment_numbers: ['RMS-GB-000247-001'],
    registration_approval_number: 'RMS-GB-000247-001',
    items: [
      {
        description: 'PEPSI MAX 330ML CAN',
        nature_of_products: null,
        type_of_treatment: null,
        commodity_code: 2202100000,
        number_of_packages: 1,
        total_net_weight_kg: 9.02,
        total_net_weight_unit: 'KGs'
      },
      {
        description: 'CELTIC SPARKLING WATER 500ML',
        nature_of_products: null,
        type_of_treatment: null,
        commodity_code: 3004900000,
        number_of_packages: 1,
        total_net_weight_kg: 12.87,
        total_net_weight_unit: 'KGs'
      },
      {
        description: 'TIDYZ REFUSE SACKS 50L 50PK',
        nature_of_products: null,
        type_of_treatment: null,
        commodity_code: 3306900000,
        number_of_packages: 1,
        total_net_weight_kg: 8.7,
        total_net_weight_unit: 'KGs'
      },
      {
        description: 'J&J COTTON BUDS X200.',
        nature_of_products: null,
        type_of_treatment: null,
        commodity_code: 9616200000,
        number_of_packages: 5,
        total_net_weight_kg: 2.6,
        total_net_weight_unit: 'KGs'
      }
    ],
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    parserModel: parserModel.SAVERS1
  },
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Product description is missing in sheet "(DO NOT SORT) Packing List" row 6.\n'
    },
    items: [
      {
        description: null,
        commodity_code: 3924900090,
        number_of_packages: 1,
        total_net_weight_kg: 0.3,
        nature_of_products: null,
        type_of_treatment: null,
        total_net_weight_unit: 'KGs'
      }
    ],
    establishment_numbers: ['RMS-GB-000247-001'],
    registration_approval_number: 'RMS-GB-000247-001',
    parserModel: parserModel.SAVERS1
  },
  emptyTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [],
    establishment_numbers: ['RMS-GB-000247-001'],
    registration_approval_number: 'RMS-GB-000247-001',
    parserModel: parserModel.SAVERS1
  },
  failedTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: 'RMS-GB-000247-001',
    parserModel: parserModel.SAVERS1
  },
  multipleRms: {
    establishment_numbers: ['RMS-GB-000247-001', 'RMS-GB-000247-002'],
    registration_approval_number: 'RMS-GB-000247-001',
    items: [
      {
        description: 'CARESS MASSAGE SPONGE 3 PACK',
        nature_of_products: null,
        type_of_treatment: null,
        commodity_code: 3924900090,
        number_of_packages: 1,
        total_net_weight_kg: 0.3,
        total_net_weight_unit: 'KGs'
      },
      {
        description: 'PEPSI MAX 500ML.',
        nature_of_products: null,
        type_of_treatment: null,
        commodity_code: 3004900000,
        number_of_packages: 2,
        total_net_weight_kg: 6.4,
        total_net_weight_unit: 'KGs'
      },
      {
        description: 'DRI-PAK SODA CRYSTALS 1KG.',
        nature_of_products: null,
        type_of_treatment: null,
        commodity_code: 3306900000,
        number_of_packages: 2,
        total_net_weight_kg: 12.16,
        total_net_weight_unit: 'KGs'
      }
    ],
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasonsDescriptions.MULTIPLE_RMS
    },
    parserModel: parserModel.SAVERS1
  },
  missingKgunit: {
    establishment_numbers: ['RMS-GB-000247-001'],
    registration_approval_number: 'RMS-GB-000247-001',
    items: [
      {
        description: 'CARESS MASSAGE SPONGE 3 PACK',
        nature_of_products: null,
        type_of_treatment: null,
        commodity_code: 3924900090,
        number_of_packages: 1,
        total_net_weight_kg: 0.3,
        total_net_weight_unit: null
      },
      {
        description: 'PEPSI MAX 500ML.',
        nature_of_products: null,
        type_of_treatment: null,
        commodity_code: 3004900000,
        number_of_packages: 2,
        total_net_weight_kg: 6.4,
        total_net_weight_unit: null
      },
      {
        description: 'DRI-PAK SODA CRYSTALS 1KG.',
        nature_of_products: null,
        type_of_treatment: null,
        commodity_code: 3306900000,
        number_of_packages: 2,
        total_net_weight_kg: 12.16,
        total_net_weight_unit: null
      }
    ],
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'Net Weight Unit of Measure (kg) not found.\n'
    },
    parserModel: parserModel.SAVERS1
  }
}
