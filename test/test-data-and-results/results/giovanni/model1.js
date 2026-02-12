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
        commodity_code: '1902209990',
        description: 'SPINACH AND RICOTTA TORT',
        number_of_packages: 17,
        total_net_weight_kg: 40.8,
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '1902209990',
        description: 'FOUR CHEESE TORT',
        number_of_packages: 10,
        total_net_weight_kg: 24,
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      }
    ],
    registration_approval_number: 'RMS-GB-000153',
    parserModel: parserModel.GIOVANNI1
  },
  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '1902209990',
        description: 'RANA CHICKEN&BACON TORT',
        number_of_packages: 21,
        total_net_weight_kg: 31.5,
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '1902209990',
        description: 'RANA HAM&CHEESE TORT',
        number_of_packages: 10,
        total_net_weight_kg: 15,
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        total_net_weight_unit: 'KG',
        nirms: null
      }
    ],
    registration_approval_number: 'RMS-GB-000153',
    parserModel: parserModel.GIOVANNI1
  },
  emptyTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: 'RMS-GB-000153',
    parserModel: parserModel.GIOVANNI1
  },
  // Parser-service test results (with validation)
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'NIRMS/Non-NIRMS goods not specified.\nNo of packages is missing in sheet "RANA" row 5.\nTotal net weight is missing in sheet "RANA" row 6.\n'
    },
    items: [
      {
        commodity_code: '1902209990',
        description: 'SPINACH AND RICOTTA TORT',
        number_of_packages: null,
        total_net_weight_kg: 40.8,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        nirms: null
      },
      {
        commodity_code: '1902209990',
        description: 'FOUR CHEESE TORT',
        number_of_packages: 10,
        total_net_weight_kg: null,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        nirms: null
      }
    ],
    registration_approval_number: 'RMS-GB-000153',
    parserModel: parserModel.GIOVANNI1
  },
  multipleRms: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.MULTIPLE_RMS +
        'NIRMS/Non-NIRMS goods not specified.\n'
    },
    items: [
      {
        commodity_code: '1902209990',
        description: 'SPINACH AND RICOTTA TORT',
        number_of_packages: 17,
        total_net_weight_kg: 40.8,
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        total_net_weight_unit: 'KG',
        nirms: null
      },
      {
        commodity_code: '1902209990',
        description: 'FOUR CHEESE TORT',
        number_of_packages: 10,
        total_net_weight_kg: 24,
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        total_net_weight_unit: 'KG',
        nirms: null
      }
    ],
    registration_approval_number: 'RMS-GB-000153',
    parserModel: parserModel.GIOVANNI1
  },
  missingKgunit: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Net Weight Unit of Measure (kg) not found.\nNIRMS/Non-NIRMS goods not specified.\n'
    },
    items: [
      {
        commodity_code: '1902209990',
        description: 'SPINACH AND RICOTTA TORT',
        number_of_packages: 17,
        total_net_weight_kg: 40.8,
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        total_net_weight_unit: null,
        nirms: null
      },
      {
        commodity_code: '1902209990',
        description: 'FOUR CHEESE TORT',
        number_of_packages: 10,
        total_net_weight_kg: 24,
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        total_net_weight_unit: null,
        nirms: null
      }
    ],
    registration_approval_number: 'RMS-GB-000153',
    parserModel: parserModel.GIOVANNI1
  },
  // Parser-only test results (without validation) - for parser unit tests
  validParserResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '1902209990',
        description: 'SPINACH AND RICOTTA TORT',
        number_of_packages: null,
        total_net_weight_kg: 40.8,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        nirms: null
      },
      {
        commodity_code: '1902209990',
        description: 'FOUR CHEESE TORT',
        number_of_packages: 10,
        total_net_weight_kg: null,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        nirms: null
      }
    ],
    registration_approval_number: 'RMS-GB-000153',
    parserModel: parserModel.GIOVANNI1
  },
  validParserResultMultipleRms: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '1902209990',
        description: 'SPINACH AND RICOTTA TORT',
        number_of_packages: 17,
        total_net_weight_kg: 40.8,
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        total_net_weight_unit: 'KG',
        nirms: null
      },
      {
        commodity_code: '1902209990',
        description: 'FOUR CHEESE TORT',
        number_of_packages: 10,
        total_net_weight_kg: 24,
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        total_net_weight_unit: 'KG',
        nirms: null
      }
    ],
    registration_approval_number: 'RMS-GB-000153',
    parserModel: parserModel.GIOVANNI1
  },
  validParserResultMissingKg: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '1902209990',
        description: 'SPINACH AND RICOTTA TORT',
        number_of_packages: 17,
        total_net_weight_kg: 40.8,
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        total_net_weight_unit: null,
        nirms: null
      },
      {
        commodity_code: '1902209990',
        description: 'FOUR CHEESE TORT',
        number_of_packages: 10,
        total_net_weight_kg: 24,
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'IT',
        total_net_weight_unit: null,
        nirms: null
      }
    ],
    registration_approval_number: 'RMS-GB-000153',
    parserModel: parserModel.GIOVANNI1
  }
}
