import parserModel from '../../../../src/services/parser-model.js'

export default {
  validTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        description: 'HAM AND CHEESE TORT',
        commodity_code: '1902209990',
        number_of_packages: '20',
        total_net_weight_kg: '48',
        total_net_weight_unit: 'KG',
        type_of_treatment: null
      }
    ],
    registration_approval_number: 'RMS-GB-000149-002',
    parserModel: parserModel.GIOVANNI3
  },
  validTestResultWithShortCommodityCode: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        description: 'HAM AND CHEESE TORT',
        commodity_code: '902209990',
        number_of_packages: '20',
        total_net_weight_kg: '48',
        total_net_weight_unit: 'KG',
        type_of_treatment: null
      }
    ],
    registration_approval_number: 'RMS-GB-000149-002',
    parserModel: parserModel.GIOVANNI3
  },
  missingKgTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: `Net Weight Unit of Measure (kg) not found.
`
    },
    items: [
      {
        description: 'HAM AND CHEESE TORT',
        commodity_code: '1902209990',
        number_of_packages: '20',
        total_net_weight_kg: '48',
        total_net_weight_unit: null,
        type_of_treatment: null
      }
    ],
    establishment_numbers: ['RMS-GB-000149-002'],
    registration_approval_number: 'RMS-GB-000149-002',
    parserModel: parserModel.GIOVANNI3
  },
  multipleRmsTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: `Multiple GB Place of Dispatch (Establishment) numbers found on packing list.
`
    },
    items: [
      {
        description: 'HAM AND CHEESE TORT',
        commodity_code: '1902209990',
        number_of_packages: '20',
        total_net_weight_kg: '48',
        total_net_weight_unit: 'KG',
        type_of_treatment: null
      }
    ],
    establishment_numbers: ['RMS-GB-000149-002', 'RMS-GB-000149-003'],
    registration_approval_number: 'RMS-GB-000149-002',
    parserModel: parserModel.GIOVANNI3
  },
  emptyTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: 'RMS-GB-000149-002',
    parserModel: parserModel.GIOVANNI3
  },
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'No of packages is missing in page 1 row 1.\n'
    },
    items: [
      {
        description: 'HAM AND CHEESE TORT',
        commodity_code: '1902209990',
        number_of_packages: null,
        total_net_weight_kg: '48',
        total_net_weight_unit: 'KG',
        type_of_treatment: null
      }
    ],
    registration_approval_number: 'RMS-GB-000149-002',
    parserModel: parserModel.GIOVANNI3
  }
}
