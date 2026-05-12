import parserModel from '../../../../src/services/parser-model.js'

export default {
  validTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        description: 'NESQUIK SNACK MILK SLICE',
        commodity_code: '1905907000',
        number_of_packages: 18,
        total_net_weight_kg: 18.72,
        country_of_origin: 'IT'
      },
      {
        description: 'LINDAHLS KVARG VANILLA',
        commodity_code: '0406105090',
        number_of_packages: 192,
        total_net_weight_kg: 230.4,
        country_of_origin: 'SE'
      }
    ],
    registration_approval_number: 'RMS-GB-000060-001',
    parserModel: parserModel.LACTALIS1
  },

  validTestResultLncd: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        description: 'SKI SMOOTH STRW RASPBERRY',
        commodity_code: '0403205300',
        number_of_packages: 198,
        total_net_weight_kg: 570.24,
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000063-001',
    parserModel: parserModel.LACTALIS1
  },

  blankPlaceholderResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        description: 'NESQUIK SNACK MILK SLICE',
        commodity_code: '1905907000',
        number_of_packages: 18,
        total_net_weight_kg: 18.72,
        country_of_origin: 'IT'
      }
    ],
    registration_approval_number: 'RMS-GB-000060-001',
    parserModel: parserModel.LACTALIS1
  },

  zeroFilledResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        description: 'SKI SMOOTH STRW RASPBERRY',
        commodity_code: '0403205300',
        number_of_packages: 198,
        total_net_weight_kg: 570.24,
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000063-001',
    parserModel: parserModel.LACTALIS1
  },

  emptyTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: null,
    parserModel: parserModel.NOMATCH
  }
}
