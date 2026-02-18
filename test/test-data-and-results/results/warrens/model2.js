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
        commodity_code: '0702000007',
        description: 'Nightingale Cherry Tomatoes TS 42x250g',
        nature_of_products: 'Chilled',
        number_of_packages: '32',
        total_net_weight_kg: '336',
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '0702000007',
        description: 'Cherry Tomatoes TS Core 30x300G',
        nature_of_products: 'Chilled',
        number_of_packages: '39',
        total_net_weight_kg: '352',
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'kgs',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000174-002',
    parserModel: parserModel.WARRENS2
  },
  validTestResultMultiple: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '0702000007',
        country_of_origin: 'GB',
        description: 'Nightingale Cherry Tomatoes TS 42x250g',
        nature_of_products: 'Chilled',
        nirms: 'NIRMS',
        number_of_packages: '32',
        row_location: { rowNumber: 2, sheetName: 'sheet' },
        total_net_weight_kg: '336',
        total_net_weight_unit: 'kgs',
        type_of_treatment: 'Processed'
      },
      {
        commodity_code: '0702000007',
        country_of_origin: 'GB',
        description: 'Cherry Tomatoes TS Core 30x300G',
        nature_of_products: 'Chilled',
        nirms: 'NIRMS',
        number_of_packages: '39',
        row_location: { rowNumber: 3, sheetName: 'sheet' },
        total_net_weight_kg: '351',
        total_net_weight_unit: 'kgs',
        type_of_treatment: 'Processed'
      },
      {
        commodity_code: '2005800099',
        country_of_origin: 'GB',
        description: 'Sweetcorn Express 8x2',
        nature_of_products: 'Chilled',
        nirms: 'NIRMS',
        number_of_packages: '5',
        row_location: { rowNumber: 2, sheetName: 'sheet2' },
        total_net_weight_kg: '20.000',
        total_net_weight_unit: 'kgs',
        type_of_treatment: 'Processed'
      },
      {
        commodity_code: '2005800099',
        country_of_origin: 'GB',
        description: 'Sweetcorn Cobettes 24x4',
        nature_of_products: 'Chilled',
        nirms: 'NIRMS',
        number_of_packages: '65',
        row_location: { rowNumber: 3, sheetName: 'sheet2' },
        total_net_weight_kg: '780.000',
        total_net_weight_unit: 'kgs',
        type_of_treatment: 'Processed'
      }
    ],
    registration_approval_number: 'RMS-GB-000174-002',
    parserModel: parserModel.WARRENS2
  },
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Total net weight is missing in sheet "Customer Order" row 2.\n'
    },
    items: [
      {
        commodity_code: '0702000007',
        description: 'Nightingale Cherry Tomatoes TS 42x250g',
        nature_of_products: 'Chilled',
        number_of_packages: '32',
        total_net_weight_kg: null,
        type_of_treatment: null,
        total_net_weight_unit: 'kgs'
      },
      {
        commodity_code: '0702000007',
        description: 'Cherry Tomatoes TS Core 30x300G',
        nature_of_products: 'Chilled',
        number_of_packages: '39',
        total_net_weight_kg: '352',
        type_of_treatment: null,
        total_net_weight_unit: 'kgs'
      }
    ],
    registration_approval_number: 'RMS-GB-000174-002',
    parserModel: parserModel.WARRENS2
  },
  emptyFile: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [],
    parserModel: 'warrens-2',
    registration_approval_number: null
  },
  multipleRms: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasonsDescriptions.MULTIPLE_RMS
    },
    items: [
      {
        commodity_code: '0702000007',
        description: 'Nightingale Cherry Tomatoes TS 42x250g',
        nature_of_products: 'Chilled',
        number_of_packages: '32',
        total_net_weight_kg: '336',
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'kgs'
      },
      {
        commodity_code: '0702000007',
        description: 'Cherry Tomatoes TS Core 30x300G',
        nature_of_products: 'Chilled',
        number_of_packages: '39',
        total_net_weight_kg: '352',
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'kgs'
      }
    ],
    registration_approval_number: 'RMS-GB-000174-002',
    parserModel: parserModel.WARRENS2
  },
  missingKgunit: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'Net Weight Unit of Measure (kg) not found.\n'
    },
    items: [
      {
        commodity_code: '0702000007',
        description: 'Nightingale Cherry Tomatoes TS 42x250g',
        nature_of_products: 'Chilled',
        number_of_packages: '32',
        total_net_weight_kg: '336',
        type_of_treatment: 'Processed',
        total_net_weight_unit: null
      },
      {
        commodity_code: '0702000007',
        description: 'Cherry Tomatoes TS Core 30x300G',
        nature_of_products: 'Chilled',
        number_of_packages: '39',
        total_net_weight_kg: '352',
        type_of_treatment: 'Processed',
        total_net_weight_unit: null
      }
    ],
    registration_approval_number: 'RMS-GB-000174-002',
    parserModel: parserModel.WARRENS2
  }
}
