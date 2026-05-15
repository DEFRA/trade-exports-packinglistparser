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
        commodity_code: '6913901090',
        description: 'Terracotta Pot',
        nature_of_products: 'Ambient Goods',
        number_of_packages: '1',
        total_net_weight_kg: '0.5',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'General Retail Goods',
        country_of_origin: 'PT'
      },
      {
        commodity_code: '3105209000',
        description: 'Scented Candle',
        nature_of_products: 'Ambient Goods',
        number_of_packages: '4',
        total_net_weight_kg: '24.7',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'General Retail Goods',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS3
  },
  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '6913901090',
        description: 'Terracotta Pot',
        nature_of_products: 'Ambient Goods',
        number_of_packages: '1',
        total_net_weight_kg: '0.5',
        type_of_treatment: 'General Retail Goods',
        country_of_origin: 'PT'
      },
      {
        commodity_code: '3105209000',
        description: 'Scented Candle',
        nature_of_products: 'Ambient Goods',
        number_of_packages: '4',
        total_net_weight_kg: '24.7',
        type_of_treatment: 'General Retail Goods',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS3
  },
  multipleRms: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasonsDescriptions.MULTIPLE_RMS
    },
    items: [
      {
        commodity_code: '6913901090',
        description: 'Terracotta Pot',
        nature_of_products: 'Ambient Goods',
        number_of_packages: '1',
        total_net_weight_kg: '0.5',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'General Retail Goods',
        country_of_origin: 'PT'
      },
      {
        commodity_code: '3105209000',
        description: 'Scented Candle',
        nature_of_products: 'Ambient Goods',
        number_of_packages: '4',
        total_net_weight_kg: '24.7',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'General Retail Goods',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS3
  }
}
