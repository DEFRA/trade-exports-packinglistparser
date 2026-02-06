/**
 * Mars Model 1 expected test results
 *
 * Expected parser output for corresponding test data models.
 */
import ParserModel from '../../../../src/services/parser-model.js'

export default {
  validTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '21032000',
        description: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        number_of_packages: 8,
        total_net_weight_kg: 24.0,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: 'Ambient',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '19049010',
        description: 'BEN Mexican 6*220g GB',
        number_of_packages: 336,
        total_net_weight_kg: 443.52,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: 'Ambient',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000213-001',
    parserModel: ParserModel.MARS1
  },
  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '21032000',
        description: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        number_of_packages: 8,
        total_net_weight_kg: 24.0,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: 'Ambient',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '19049010',
        description: 'BEN Mexican 6*220g GB',
        number_of_packages: 336,
        total_net_weight_kg: 443.52,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: 'Ambient',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '21032000',
        description: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        number_of_packages: 8,
        total_net_weight_kg: 24.0,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: 'Ambient',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '19049010',
        description: 'BEN Mexican 6*220g GB',
        number_of_packages: 336,
        total_net_weight_kg: 443.52,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: 'Ambient',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000213-001',
    parserModel: ParserModel.MARS1
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
        country_of_origin: null
      }
    ],
    registration_approval_number: null,
    parserModel: ParserModel.MARS1
  },
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'No of packages is missing in sheet "Sheet1" row 4.\nTotal net weight is missing in sheet "Sheet1" row 5.\n'
    },
    items: [
      {
        commodity_code: '21032000',
        description: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        number_of_packages: null,
        total_net_weight_kg: 24.0,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'GB'
      },
      {
        commodity_code: '19049010',
        description: 'BEN Mexican 6*220g GB',
        number_of_packages: 336,
        total_net_weight_kg: null,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: null,
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000213-001',
    parserModel: ParserModel.MARS1
  },
  multipleRms: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Multiple GB Place of Dispatch (Establishment) numbers found on packing list.\n'
    },
    items: [
      {
        commodity_code: '21032000',
        description: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        number_of_packages: 8,
        total_net_weight_kg: 24.0,
        total_net_weight_unit: 'KG',
        nature_of_products: null,
        type_of_treatment: 'Ambient',
        country_of_origin: null
      }
    ],
    establishment_numbers: ['RMS-GB-000213-001', 'RMS-GB-000213-002'],
    registration_approval_number: 'RMS-GB-000213-001',
    parserModel: ParserModel.MARS1
  },
  missingKgunit: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'Net Weight Unit of Measure (kg) not found.\n'
    },
    items: [
      {
        commodity_code: '21032000',
        description: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        number_of_packages: 8,
        total_net_weight_kg: 24,
        total_net_weight_unit: null,
        nature_of_products: null,
        type_of_treatment: 'Ambient',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000213-001',
    parserModel: ParserModel.MARS1
  }
}
