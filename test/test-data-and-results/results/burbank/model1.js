/**
 * Burbank Model 1 – expected test results
 *
 * Used by parser and parser-service integration tests to assert
 * on the combined output of the Burbank Model 1 parser + validator.
 */
import ParserModel from '../../../../src/services/parser-model.js'
import failureReasons from '../../../../src/services/validators/packing-list-failure-reasons.js'

export default {
  validTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '709999090',
        description: 'Herb Lovage x1kg',
        nature_of_products: 'Chilled',
        number_of_packages: '2',
        total_net_weight_kg: '2',
        type_of_treatment: 'Raw',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'VALID_ISO',
        nirms: 'Green'
      },
      {
        commodity_code: '702000007',
        description: 'Tomato Cherry Mixed x9x250gm',
        nature_of_products: 'Chilled',
        number_of_packages: '10',
        total_net_weight_kg: '22.5',
        type_of_treatment: 'Raw',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'VALID_ISO',
        nirms: 'Green'
      }
    ],
    registration_approval_number: 'RMS-GB-000219-001',
    parserModel: ParserModel.BURBANK1
  },

  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Total net weight is missing in sheet "Revised" row 45.\n'
    },
    items: [
      {
        commodity_code: '709999090',
        description: 'Herb Lovage x1kg',
        nature_of_products: 'Chilled',
        number_of_packages: '2',
        total_net_weight_kg: null,
        type_of_treatment: 'Raw',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'VALID_ISO',
        nirms: 'Green'
      }
    ],
    registration_approval_number: 'RMS-GB-000219-001',
    parserModel: ParserModel.BURBANK1
  },

  multipleRms: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasons.MULTIPLE_RMS
    },
    items: [
      {
        commodity_code: '709999090',
        description: 'Herb Lovage x1kg',
        nature_of_products: 'Chilled',
        number_of_packages: '2',
        total_net_weight_kg: '2',
        type_of_treatment: 'Raw',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'VALID_ISO',
        nirms: 'Green'
      },
      {
        commodity_code: '702000007',
        description: 'Tomato Cherry Mixed x9x250gm',
        nature_of_products: 'Chilled',
        number_of_packages: '10',
        total_net_weight_kg: '22.5',
        type_of_treatment: 'Raw',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'VALID_ISO',
        nirms: 'Green'
      }
    ],
    registration_approval_number: 'RMS-GB-000219-001',
    parserModel: ParserModel.BURBANK1
  },

  missingKgunit: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'Net Weight Unit of Measure (kg) not found.\n'
    },
    items: [
      {
        commodity_code: '709999090',
        description: 'Herb Lovage x1kg',
        nature_of_products: 'Chilled',
        number_of_packages: '2',
        total_net_weight_kg: '2',
        type_of_treatment: 'Raw',
        total_net_weight_unit: null,
        country_of_origin: 'VALID_ISO',
        nirms: 'Green'
      }
    ],
    registration_approval_number: 'RMS-GB-000219-001',
    parserModel: ParserModel.BURBANK1
  },

  emptyModelResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: 'RMS-GB-000219-001',
    parserModel: ParserModel.BURBANK1
  }
}
