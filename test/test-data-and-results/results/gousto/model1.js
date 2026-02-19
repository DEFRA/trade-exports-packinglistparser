import parserModel from '../../../../src/services/parser-model.js'

export default {
  validTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '0207141010',
        description: 'Chicken Breast',
        number_of_packages: 100,
        total_net_weight_kg: 250.5,
        nature_of_products: 'Fresh Poultry',
        type_of_treatment: 'Chilled',
        country_of_origin: 'VALID_ISO',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '0201300090',
        description: 'Beef Mince',
        number_of_packages: 50,
        total_net_weight_kg: 125.0,
        nature_of_products: 'Fresh Meat',
        type_of_treatment: 'Frozen',
        country_of_origin: 'VALID_ISO',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      }
    ],
    registration_approval_number: 'RMS-GB-000483-001',
    parserModel: parserModel.GOUSTO1
  },

  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '0207141010',
        description: 'Chicken Breast',
        number_of_packages: 100,
        total_net_weight_kg: 250.5,
        nature_of_products: 'Fresh Poultry',
        type_of_treatment: 'Chilled',
        country_of_origin: 'VALID_ISO',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '0304410090',
        description: 'Salmon Fillet',
        number_of_packages: 75,
        total_net_weight_kg: 180.0,
        nature_of_products: 'Fresh Fish',
        type_of_treatment: 'Fresh',
        country_of_origin: 'VALID_ISO',
        total_net_weight_unit: 'KG',
        nirms: null
      }
    ],
    registration_approval_number: 'RMS-GB-000483-001',
    parserModel: parserModel.GOUSTO1
  },

  emptyTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: null,
    parserModel: parserModel.NOMATCH
  },

  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'Total net weight is missing in sheet "Sheet1" row 5.\n'
    },
    items: [
      {
        commodity_code: '0207141010',
        description: 'Chicken Breast',
        number_of_packages: 100,
        total_net_weight_kg: null,
        total_net_weight_unit: 'KG',
        nature_of_products: 'Fresh Poultry',
        type_of_treatment: null,
        country_of_origin: 'VALID_ISO',
        nirms: 'NIRMS'
      }
    ],
    registration_approval_number: 'RMS-GB-000483-001',
    parserModel: parserModel.GOUSTO1
  },

  multipleRms: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Multiple GB Place of Dispatch (Establishment) numbers found on packing list.\nNIRMS/Non-NIRMS goods not specified.\n'
    },
    items: [
      {
        commodity_code: '0207141010',
        description: 'Chicken Breast',
        number_of_packages: 100,
        total_net_weight_kg: 250.5,
        total_net_weight_unit: 'KG',
        nature_of_products: 'Fresh Poultry',
        type_of_treatment: 'Chilled',
        country_of_origin: 'VALID_ISO',
        nirms: null
      }
    ],
    registration_approval_number: 'RMS-GB-000483-001',
    parserModel: parserModel.GOUSTO1
  }
}
