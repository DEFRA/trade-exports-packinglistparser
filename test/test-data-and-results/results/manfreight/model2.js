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
        commodity_code: '0207130000',
        description: 'Fresh Chicken Breast 500g',
        nature_of_products: 'Poultry',
        nirms: 'Non-Nirms',
        number_of_packages: 10,
        total_net_weight_kg: 5.0,
        total_net_weight_unit: 'kg',
        type_of_treatment: 'Chilled'
      },
      {
        commodity_code: '0203190090',
        description: 'Pork Loin 1kg',
        nature_of_products: 'Meat',
        nirms: 'Non-Nirms',
        number_of_packages: 5,
        total_net_weight_kg: 5.0,
        total_net_weight_unit: 'kg',
        type_of_treatment: 'Chilled'
      }
    ],
    registration_approval_number: 'RMS-GB-000465-001',
    parserModel: parserModel.MANFREIGHT2
  },
  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '0207130000',
        description: 'Fresh Chicken Breast 500g',
        nature_of_products: 'Poultry',
        nirms: 'Non-Nirms',
        number_of_packages: 10,
        total_net_weight_kg: 5.0,
        total_net_weight_unit: 'kg',
        type_of_treatment: 'Chilled'
      },
      {
        commodity_code: '0203190090',
        description: 'Pork Loin 1kg',
        nature_of_products: 'Meat',
        nirms: 'Non-Nirms',
        number_of_packages: 5,
        total_net_weight_kg: 5.0,
        total_net_weight_unit: 'kg',
        type_of_treatment: 'Chilled'
      }
    ],
    registration_approval_number: 'RMS-GB-000465-001',
    parserModel: parserModel.MANFREIGHT2
  },
  validParserResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '0207130000',
        description: 'Fresh Chicken Breast 500g',
        nature_of_products: 'Poultry',
        nirms: 'Non-Nirms',
        number_of_packages: 10,
        total_net_weight_kg: 5.0,
        total_net_weight_unit: 'kg',
        type_of_treatment: 'Chilled'
      },
      {
        commodity_code: '0203190090',
        description: 'Pork Loin 1kg',
        nature_of_products: 'Meat',
        nirms: 'Non-Nirms',
        number_of_packages: 5,
        total_net_weight_kg: 5.0,
        total_net_weight_unit: 'kg',
        type_of_treatment: 'Chilled'
      }
    ],
    registration_approval_number: 'RMS-GB-000465-001',
    parserModel: parserModel.MANFREIGHT2
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
        nirms: null,
        number_of_packages: null,
        total_net_weight_kg: null,
        total_net_weight_unit: null,
        type_of_treatment: null
      }
    ],
    registration_approval_number: 'RMS-GB-000465-001',
    parserModel: parserModel.MANFREIGHT2
  },
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'Total net weight is missing in sheet "Sheet1" row 3.\n'
    },
    items: [
      {
        commodity_code: '0207130000',
        description: 'Fresh Chicken Breast 500g',
        nature_of_products: 'Poultry',
        nirms: 'Non-Nirms',
        number_of_packages: 10,
        total_net_weight_kg: 5.0,
        total_net_weight_unit: 'kg',
        type_of_treatment: 'Chilled'
      },
      {
        commodity_code: '0203190090',
        description: 'Pork Loin 1kg',
        nature_of_products: 'Meat',
        nirms: 'Non-Nirms',
        number_of_packages: 5,
        total_net_weight_kg: null,
        total_net_weight_unit: 'kg',
        type_of_treatment: 'Chilled'
      }
    ],
    registration_approval_number: 'RMS-GB-000465-001',
    parserModel: parserModel.MANFREIGHT2
  },
  missingKgunit: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'Net Weight Unit of Measure (kg) not found.\n'
    },
    items: [
      {
        commodity_code: '0207130000',
        description: 'Fresh Chicken Breast 500g',
        nature_of_products: 'Poultry',
        nirms: 'Non-Nirms',
        number_of_packages: 10,
        total_net_weight_kg: 5.0,
        total_net_weight_unit: null,
        type_of_treatment: 'Chilled'
      },
      {
        commodity_code: '0203190090',
        description: 'Pork Loin 1kg',
        nature_of_products: 'Meat',
        nirms: 'Non-Nirms',
        number_of_packages: 5,
        total_net_weight_kg: 5.0,
        total_net_weight_unit: null,
        type_of_treatment: 'Chilled'
      }
    ],
    establishment_numbers: ['RMS-GB-000465-001'],
    registration_approval_number: 'RMS-GB-000465-001',
    parserModel: parserModel.MANFREIGHT2
  },
  multipleRms: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasonsDescriptions.MULTIPLE_RMS
    },
    items: [
      {
        commodity_code: '0207130000',
        description: 'Fresh Chicken Breast 500g',
        nature_of_products: 'Poultry',
        nirms: 'Non-Nirms',
        number_of_packages: 10,
        total_net_weight_kg: 5.0,
        total_net_weight_unit: 'kg',
        type_of_treatment: 'Chilled'
      },
      {
        commodity_code: '0203190090',
        description: 'Pork Loin 1kg',
        nature_of_products: 'Meat',
        nirms: 'Non-Nirms',
        number_of_packages: 5,
        total_net_weight_kg: 5.0,
        total_net_weight_unit: 'kg',
        type_of_treatment: 'Chilled'
      }
    ],
    establishment_numbers: ['RMS-GB-000465-001', 'RMS-GB-000465-002'],
    registration_approval_number: 'RMS-GB-000465-001',
    parserModel: parserModel.MANFREIGHT2
  }
}
