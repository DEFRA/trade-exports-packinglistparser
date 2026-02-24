import parserModel from '../../../../src/services/parser-model.js'

export default {
  validTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '403209300',
        description: 'ACTIVIA DRK FRTS 6X8X115',
        nature_of_products: null,
        number_of_packages: 2,
        total_net_weight_kg: 11.04,
        type_of_treatment: null,
        total_net_weight_unit: null
      },
      {
        commodity_code: '403209100',
        description: 'ACT 00  YE&RD FRU 6X8X115',
        nature_of_products: null,
        number_of_packages: 5,
        total_net_weight_kg: 27.6,
        type_of_treatment: null,
        total_net_weight_unit: null
      }
    ],
    registration_approval_number: 'RMS-GB-000133-000',
    parserModel: parserModel.NUTRICIA2
  },
  invalidTestResultWithNoHeader: {
    business_checks: {
      all_required_fields_present: false
    },
    items: [
      {
        commodity_code: '403209300',
        description: 'ACTIVIA DRK FRTS 6X8X115',
        nature_of_products: null,
        number_of_packages: 2,
        total_net_weight_kg: 11.04,
        type_of_treatment: null,
        total_net_weight_unit: null
      },
      {
        commodity_code: '403209100',
        description: 'ACT 00  YE&RD FRU 6X8X115',
        nature_of_products: null,
        number_of_packages: 5,
        total_net_weight_kg: 27.6,
        type_of_treatment: null,
        total_net_weight_unit: null
      }
    ],
    registration_approval_number: 'RMS-GB-000133-000',
    parserModel: parserModel.NUTRICIA2
  },
  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '403209300',
        description: 'ACTIVIA DRK FRTS 6X8X115',
        nature_of_products: null,
        number_of_packages: 2,
        total_net_weight_kg: 11.04,
        type_of_treatment: null,
        country_of_origin: 'BE',
        total_net_weight_unit: null
      },
      {
        commodity_code: '403209100',
        description: 'ACT 00  YE&RD FRU 6X8X115',
        nature_of_products: null,
        number_of_packages: 5,
        total_net_weight_kg: 27.6,
        type_of_treatment: null,
        country_of_origin: 'FR',
        total_net_weight_unit: null
      }
    ],
    registration_approval_number: 'RMS-GB-000133',
    parserModel: parserModel.NUTRICIA2
  },
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Identifier is missing in sheet "DANONE" row 22.\nTotal net weight is missing in sheet "DANONE" row 23.\n'
    },
    items: [
      {
        commodity_code: null,
        description: 'ACTIVIA DRK FRTS 6X8X115',
        nature_of_products: null,
        number_of_packages: 2,
        total_net_weight_kg: 11.04,
        type_of_treatment: null,
        country_of_origin: 'BE',
        total_net_weight_unit: 'Kg'
      },
      {
        commodity_code: '403209100',
        description: 'ACT 00  YE&RD FRU 6X8X115',
        nature_of_products: null,
        number_of_packages: 5,
        total_net_weight_kg: null,
        type_of_treatment: null,
        country_of_origin: 'FR',
        total_net_weight_unit: 'Kg'
      }
    ],
    registration_approval_number: 'RMS-GB-000133-000',
    parserModel: parserModel.NUTRICIA2
  },
  emptyModelResult: {
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
        type_of_treatment: null,
        country_of_origin: null,
        total_net_weight_unit: null
      }
    ],
    registration_approval_number: null,
    parserModel: parserModel.NUTRICIA2
  }
}
