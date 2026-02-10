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
        commodity_code: 16025095,
        description: 'J/L JERKY 70G TERIYAKI',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 1.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'GB'
      },
      {
        commodity_code: 19053199,
        description: 'MINI ROLLS 10PK',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 3.27,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  },
  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: 16025095,
        description: 'J/L JERKY 70G TERIYAKI',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 1.15,
        type_of_treatment: 'Processed',
        country_of_origin: 'GB',
        nirms: 'NIRMS',
        total_net_weight_unit: null,
        row_location: {
          sheetName: 'Sheet1',
          rowNumber: 7
        }
      },
      {
        commodity_code: 16041428,
        description: 'JOHN W 5X132G S/WATER',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 8.1,
        type_of_treatment: 'Processed',
        country_of_origin: 'GB',
        nirms: 'NIRMS',
        total_net_weight_unit: null,
        row_location: {
          sheetName: 'sheet2',
          rowNumber: 7
        }
      }
    ],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  },
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Net Weight Unit of Measure (kg) not found.\nIdentifier is missing in sheet "Sheet1" row 7.\nTotal net weight is missing in sheet "Sheet1" row 7.\n'
    },
    items: [
      {
        commodity_code: null,
        description: 'J/L JERKY 70G TERIYAKI',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: null,
        type_of_treatment: 'Processed',
        country_of_origin: 'GB',
        nirms: 'NIRMS',
        total_net_weight_unit: null,
        row_location: {
          sheetName: 'Sheet1',
          rowNumber: 7
        }
      },
      {
        commodity_code: 19053199,
        description: 'MINI ROLLS 10PK',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 3.27,
        type_of_treatment: 'Processed',
        country_of_origin: 'GB',
        nirms: 'NIRMS',
        total_net_weight_unit: null,
        row_location: {
          sheetName: 'Sheet1',
          rowNumber: 8
        }
      }
    ],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  },
  emptyTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: null,
    parserModel: parserModel.BANDM1
  },
  multipleRms: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasonsDescriptions.MULTIPLE_RMS
    },
    items: [
      {
        commodity_code: 16025095,
        description: 'J/L JERKY 70G TERIYAKI',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 1.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG'
      }
    ],
    establishment_numbers: ['RMS-GB-000005-001', 'RMS-GB-000005-002'],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  },
  missingKgunit: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'Net Weight Unit of Measure (kg) not found.\n'
    },
    items: [
      {
        commodity_code: 16025095,
        description: 'J/L JERKY 70G TERIYAKI',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 1.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: null
      }
    ],
    establishment_numbers: ['RMS-GB-000005-001'],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  },
  // AC1: Null NIRMS value
  missingNirmsStatementTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasonsDescriptions.NIRMS_MISSING + '.\n'
    },
    items: [
      {
        commodity_code: 16025095,
        description: 'J/L JERKY 70G TERIYAKI',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 1.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: null,
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  },
  // AC2: Null CoO Value
  nullCoOTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.COO_MISSING + ' in sheet "Sheet1" row 7.\n'
    },
    items: [
      {
        commodity_code: 16025095,
        description: 'J/L JERKY 70G TERIYAKI',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 1.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: null
      }
    ],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  },
  // AC3: Invalid CoO Value
  invalidCoOTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.COO_INVALID + ' in sheet "Sheet1" row 7.\n'
    },
    items: [
      {
        commodity_code: 16025095,
        description: 'J/L JERKY 70G TERIYAKI',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 1.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INVALID'
      }
    ],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  },
  // AC4: Null CoO Value, more than 3
  multipleNullCoOTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.COO_MISSING +
        ' in sheet "Sheet1" row 7, sheet "Sheet1" row 8, sheet "Sheet1" row 9 in addition to 2 other locations.\n'
    },
    items: [
      {
        commodity_code: 16025095,
        description: 'J/L JERKY 70G TERIYAKI',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 1.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: null
      },
      {
        commodity_code: 16025096,
        description: 'SECOND PRODUCT',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 2.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: null
      },
      {
        commodity_code: 16025097,
        description: 'THIRD PRODUCT',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 3.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: null
      },
      {
        commodity_code: 16025098,
        description: 'FOURTH PRODUCT',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 4.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: null
      },
      {
        commodity_code: 16025099,
        description: 'FIFTH PRODUCT',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 5.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: null
      }
    ],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  },
  // AC5: Invalid CoO Value, more than 3
  multipleInvalidCoOTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.COO_INVALID +
        ' in sheet "Sheet1" row 7, sheet "Sheet1" row 8, sheet "Sheet1" row 9 in addition to 2 other locations.\n'
    },
    items: [
      {
        commodity_code: 16025095,
        description: 'J/L JERKY 70G TERIYAKI',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 1.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INVALID1'
      },
      {
        commodity_code: 16025096,
        description: 'SECOND PRODUCT',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 2.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INVALID2'
      },
      {
        commodity_code: 16025097,
        description: 'THIRD PRODUCT',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 3.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INVALID3'
      },
      {
        commodity_code: 16025098,
        description: 'FOURTH PRODUCT',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 4.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INVALID4'
      },
      {
        commodity_code: 16025099,
        description: 'FIFTH PRODUCT',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 5.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INVALID5'
      }
    ],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  },
  // AC6: CoO Value is X or x
  xCoOTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: 16025095,
        description: 'J/L JERKY 70G TERIYAKI',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 1.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'X'
      },
      {
        commodity_code: 19053199,
        description: 'MINI ROLLS 10PK',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 3.27,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'x'
      }
    ],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  },
  // AC7: Item Present on Ineligible item List (Treatment Type specified)
  ineligibleItemWithTreatmentTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.PROHIBITED_ITEM +
        ' in sheet "Sheet1" row 7.\n'
    },
    items: [
      {
        commodity_code: '012',
        description: 'CARROT PRODUCT',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 1.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INELIGIBLE_ITEM_ISO'
      }
    ],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  },
  // AC8: Item Present on Ineligible item List, more than 3 (Treatment Type specified)
  multipleineligibleItemsWithTreatmentTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.PROHIBITED_ITEM +
        ' in sheet "Sheet1" row 7, sheet "Sheet1" row 8, sheet "Sheet1" row 9 in addition to 2 other locations.\n'
    },
    items: [
      {
        commodity_code: '012',
        description: 'CARROT PRODUCT 1',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 1.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INELIGIBLE_ITEM_ISO'
      },
      {
        commodity_code: '012',
        description: 'CELERY PRODUCT 2',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 2.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INELIGIBLE_ITEM_ISO'
      },
      {
        commodity_code: '012',
        description: 'HERBS PRODUCT 3',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 3.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INELIGIBLE_ITEM_ISO'
      },
      {
        commodity_code: '012',
        description: 'CARROT PRODUCT 4',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 4.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INELIGIBLE_ITEM_ISO'
      },
      {
        commodity_code: '012',
        description: 'CELERY PRODUCT 5',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 5.15,
        type_of_treatment: 'Processed',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INELIGIBLE_ITEM_ISO'
      }
    ],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  },
  // AC9: Item Present on Ineligible item List (no Treatment Type specified)
  ineligibleItemNoTreatmentTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.PROHIBITED_ITEM +
        ' in sheet "Sheet1" row 7.\n'
    },
    items: [
      {
        commodity_code: '012',
        description: 'CARROT PRODUCT',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 1.15,
        type_of_treatment: null,
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INELIGIBLE_ITEM_ISO'
      }
    ],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  },
  // AC10: Item Present on Ineligible item List, more than 3 (no Treatment Type specified)
  multipleineligibleItemsNoTreatmentTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.PROHIBITED_ITEM +
        ' in sheet "Sheet1" row 7, sheet "Sheet1" row 8, sheet "Sheet1" row 9 in addition to 2 other locations.\n'
    },
    items: [
      {
        commodity_code: '012',
        description: 'CARROT PRODUCT 1',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 1.15,
        type_of_treatment: null,
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INELIGIBLE_ITEM_ISO'
      },
      {
        commodity_code: '012',
        description: 'CELERY PRODUCT 2',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 2.15,
        type_of_treatment: null,
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INELIGIBLE_ITEM_ISO'
      },
      {
        commodity_code: '012',
        description: 'HERBS PRODUCT 3',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 3.15,
        type_of_treatment: null,
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INELIGIBLE_ITEM_ISO'
      },
      {
        commodity_code: '012',
        description: 'CARROT PRODUCT 4',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 4.15,
        type_of_treatment: null,
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INELIGIBLE_ITEM_ISO'
      },
      {
        commodity_code: '012',
        description: 'CELERY PRODUCT 5',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 5.15,
        type_of_treatment: null,
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'INELIGIBLE_ITEM_ISO'
      }
    ],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  },
  // AC11: Null Treatment type value
  nullTreatmentTypeWithNullIdentifierTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.IDENTIFIER_MISSING +
        ' in sheet "Sheet1" row 6.\n'
    },
    items: [
      {
        commodity_code: null,
        description: 'J/L JERKY 70G TERIYAKI',
        nature_of_products: null,
        number_of_packages: 1,
        total_net_weight_kg: 1.15,
        type_of_treatment: null,
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000005-001',
    parserModel: parserModel.BANDM1
  }
}
