import parserModel from '../../../../src/services/parser-model.js'
import failureReasonsDescriptions from '../../../../src/services/validators/packing-list-failure-reasons.js'

const registrationApprovalNumber = 'RMS-GB-000133-001'
const firstDescription = 'NUTRICIA FORTIFIED SHAKE'
const secondDescription = 'NUTRICIA PROTEIN DRINK'
const firstNatureOfProducts = 'CHILLED - ROAD'
const secondNatureOfProducts = 'CHILLED - ROAD'

export default {
  validTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '21069098',
        description: firstDescription,
        country_of_origin: 'GB',
        number_of_packages: 12,
        total_net_weight_kg: 120.5,
        total_net_weight_unit: 'KG',
        nirms: 'Yes',
        type_of_treatment: 'Processed',
        nature_of_products: firstNatureOfProducts
      },
      {
        commodity_code: '21069099',
        description: secondDescription,
        country_of_origin: 'FR',
        number_of_packages: 6,
        total_net_weight_kg: 60,
        total_net_weight_unit: 'KG',
        nirms: 'Yes',
        type_of_treatment: 'Processed',
        nature_of_products: secondNatureOfProducts
      }
    ],
    registration_approval_number: registrationApprovalNumber,
    parserModel: parserModel.NUTRICIA3
  },
  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '21069098',
        description: firstDescription,
        country_of_origin: 'GB',
        number_of_packages: 12,
        total_net_weight_kg: 120.5,
        total_net_weight_unit: 'KG',
        nirms: 'Yes',
        type_of_treatment: 'Processed',
        nature_of_products: firstNatureOfProducts
      },
      {
        commodity_code: '21069099',
        description: secondDescription,
        country_of_origin: 'FR',
        number_of_packages: 6,
        total_net_weight_kg: 60,
        total_net_weight_unit: 'KG',
        nirms: 'Yes',
        type_of_treatment: 'Processed',
        nature_of_products: secondNatureOfProducts
      }
    ],
    registration_approval_number: registrationApprovalNumber,
    parserModel: parserModel.NUTRICIA3
  },
  emptyTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: registrationApprovalNumber,
    parserModel: parserModel.NUTRICIA3
  },
  multipleRms: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasonsDescriptions.MULTIPLE_RMS
    },
    items: [
      {
        commodity_code: '21069098',
        description: firstDescription,
        country_of_origin: 'GB',
        number_of_packages: 12,
        total_net_weight_kg: 120.5,
        total_net_weight_unit: 'KG',
        nirms: 'Yes',
        type_of_treatment: 'Processed',
        nature_of_products: firstNatureOfProducts
      }
    ],
    establishment_numbers: ['RMS-GB-000133-001', 'RMS-GB-000133-002'],
    registration_approval_number: registrationApprovalNumber,
    parserModel: parserModel.NUTRICIA3
  }
}
