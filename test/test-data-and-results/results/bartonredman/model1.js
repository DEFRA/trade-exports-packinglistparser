import parserModel from '../../../../src/services/parser-model.js'

export default {
  validTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '0709601000',
        description: 'Barton and Redman Red Peppers',
        nature_of_products: null,
        number_of_packages: 10,
        total_net_weight_kg: 12.5,
        total_net_weight_unit: 'kgs',
        type_of_treatment: 'CHILLED',
        nirms: 'GREEN',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '0707000599',
        description: 'Barton and Redman Cucumbers',
        nature_of_products: null,
        number_of_packages: 6,
        total_net_weight_kg: 8,
        total_net_weight_unit: 'kgs',
        type_of_treatment: 'CHILLED',
        nirms: 'RED',
        country_of_origin: null
      }
    ],
    establishment_numbers: ['RMS-GB-000137-001'],
    registration_approval_number: 'RMS-GB-000137-001',
    parserModel: parserModel.BARTONREDMAN1
  },
  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '0709601000',
        description: 'Barton and Redman Red Peppers',
        nature_of_products: null,
        number_of_packages: 10,
        total_net_weight_kg: 12.5,
        total_net_weight_unit: 'kgs',
        type_of_treatment: 'CHILLED',
        nirms: 'GREEN',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '0707000599',
        description: 'Barton and Redman Cucumbers',
        nature_of_products: null,
        number_of_packages: 6,
        total_net_weight_kg: 8,
        total_net_weight_unit: 'kgs',
        type_of_treatment: 'CHILLED',
        nirms: 'RED',
        country_of_origin: null
      }
    ],
    establishment_numbers: ['RMS-GB-000137-001'],
    registration_approval_number: 'RMS-GB-000137-001',
    parserModel: parserModel.BARTONREDMAN1
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
        type_of_treatment: null,
        nirms: null,
        country_of_origin: null
      }
    ],
    registration_approval_number: null,
    parserModel: parserModel.BARTONREDMAN1
  }
}
