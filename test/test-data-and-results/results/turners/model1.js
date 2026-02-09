import parserModel from '../../../../src/services/parser-model.js'

export default {
  validTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '02013000',
        country_of_origin: 'IE',
        description: 'Fresh Beef Mince',
        nature_of_products: 'Meat Products',
        number_of_packages: '10',
        total_net_weight_kg: '50.5',
        total_net_weight_unit: 'kg',
        type_of_treatment: 'Chilled',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '02041000',
        country_of_origin: 'IE',
        description: 'Fresh Lamb Steaks',
        nature_of_products: 'Meat Products',
        number_of_packages: '5',
        total_net_weight_kg: '25.2',
        total_net_weight_unit: 'kg',
        type_of_treatment: 'Chilled',
        nirms: 'NIRMS'
      }
    ],
    registration_approval_number: 'RMS-GB-000156-001',
    parserModel: parserModel.TURNERS1
  },
  emptyTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: 'RMS-GB-000156-001',
    parserModel: parserModel.TURNERS1
  },
  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '02013000',
        country_of_origin: 'IE',
        description: 'Fresh Beef Mince',
        nature_of_products: 'Meat Products',
        number_of_packages: '10',
        total_net_weight_kg: '50.5',
        total_net_weight_unit: 'kg',
        type_of_treatment: 'Chilled',
        nirms: 'NON-NIRMS'
      },
      {
        commodity_code: '02041000',
        country_of_origin: 'IE',
        description: 'Fresh Lamb Steaks',
        nature_of_products: 'Meat Products',
        number_of_packages: '5',
        total_net_weight_kg: '25.2',
        total_net_weight_unit: 'kg',
        type_of_treatment: 'Chilled',
        nirms: 'NON-NIRMS'
      }
    ],
    registration_approval_number: 'RMS-GB-000156-001',
    parserModel: parserModel.TURNERS1
  },
  invalidTestResult_MissingColumnCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Product description is missing in sheet "PackingList_Extract" row 2.\n'
    },
    items: [
      {
        commodity_code: '02013000',
        country_of_origin: 'IE',
        description: null,
        nature_of_products: 'Meat Products',
        number_of_packages: '10',
        total_net_weight_kg: '50.5',
        total_net_weight_unit: 'kg',
        type_of_treatment: 'Chilled',
        nirms: 'NON-NIRMS'
      }
    ],
    registration_approval_number: 'RMS-GB-000156-001',
    parserModel: parserModel.TURNERS1
  }
}
