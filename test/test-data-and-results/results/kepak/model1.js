import parserModel from '../../../../src/services/parser-model.js'
import failureReasonsDescriptions from '../../../../src/services/validators/packing-list-failure-reasons.js'
import { kepakHeaders } from '../../../../src/services/model-headers/kepak.js'

export default {
  validTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '1602509590',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: null,
        country_of_origin: 'GB',
        total_net_weight_unit: 'KG'
      },
      {
        commodity_code: '1602493000',
        description: 'RS BBQ RIB STD 8X157G',
        nature_of_products: null,
        number_of_packages: 22,
        total_net_weight_kg: 27.632,
        type_of_treatment: null,
        country_of_origin: 'GB',
        total_net_weight_unit: 'KG'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  validTestResultWithNirms: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '1602509590',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: null,
        country_of_origin: 'GB',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '1602493000',
        description: 'RS BBQ RIB STD 8X157G',
        nature_of_products: null,
        number_of_packages: 22,
        total_net_weight_kg: 27.632,
        type_of_treatment: null,
        country_of_origin: 'GB',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '1602495000',
        description: 'FS MINI SAUSAGE BAP',
        nature_of_products: null,
        number_of_packages: 3,
        total_net_weight_kg: 2.16,
        type_of_treatment: null,
        country_of_origin: 'GB',
        total_net_weight_unit: 'KG'
      },
      {
        commodity_code: '1602495000',
        description: 'RS MEATBALL SUB',
        nature_of_products: null,
        number_of_packages: 3,
        total_net_weight_kg: 1.716,
        type_of_treatment: null,
        country_of_origin: 'GB',
        total_net_weight_unit: 'KG'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Product description is missing in sheet "KEPAK" row 23.\nNo of packages is missing in sheet "KEPAK" row 22.\n'
    },
    items: [
      {
        commodity_code: '1602509590',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: null,
        total_net_weight_kg: 30.336,
        type_of_treatment: null,
        country_of_origin: 'GB',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '1602493000',
        description: null,
        nature_of_products: null,
        number_of_packages: 22,
        total_net_weight_kg: 27.632,
        type_of_treatment: null,
        country_of_origin: 'GB',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  emptyModelResult: {
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
        type_of_treatment: null,
        country_of_origin: null,
        total_net_weight_unit: null
      }
    ],
    establishment_numbers: [],
    registration_approval_number: null,
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  multipleRms: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasonsDescriptions.MULTIPLE_RMS
    },
    items: [
      {
        commodity_code: '1602509590',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: null,
        country_of_origin: 'GB',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '1602493000',
        description: 'RS BBQ RIB STD 8X157G',
        nature_of_products: null,
        number_of_packages: 22,
        total_net_weight_kg: 27.632,
        type_of_treatment: null,
        country_of_origin: 'GB',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005', 'RMS-GB-000149-006'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  missingKgunit: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'Net Weight Unit of Measure (kg) not found.\n'
    },
    items: [
      {
        commodity_code: '1602509590',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: null,
        country_of_origin: 'GB',
        total_net_weight_unit: null,
        nirms: 'NIRMS'
      },
      {
        commodity_code: '1602493000',
        description: 'RS BBQ RIB STD 8X157G',
        nature_of_products: null,
        number_of_packages: 22,
        total_net_weight_kg: 27.632,
        type_of_treatment: null,
        country_of_origin: 'GB',
        total_net_weight_unit: null,
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  missingNirmsStatementTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasonsDescriptions.NIRMS_MISSING + '.\n'
    },
    items: [
      {
        commodity_code: '1602493000',
        description: 'RS BBQ RIB STD 8X157G',
        nature_of_products: null,
        number_of_packages: 22,
        total_net_weight_kg: 27.632,
        type_of_treatment: 'Processed',
        country_of_origin: 'GB',
        total_net_weight_unit: 'KG',
        nirms: null
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  nullCoOTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.COO_MISSING + ' in sheet "KEPAK" row 22.\n'
    },
    items: [
      {
        commodity_code: '1602509590',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: 'Processed',
        country_of_origin: null,
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  invalidCoOTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.COO_INVALID + ' in sheet "KEPAK" row 22.\n'
    },
    items: [
      {
        commodity_code: '1602509590',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: 'Processed',
        country_of_origin: 'INVALID',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  multipleNullCoOTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.COO_MISSING +
        ' in sheet "KEPAK" row 22, sheet "KEPAK" row 23, sheet "KEPAK" row 24 in addition to 1 other locations.\n'
    },
    items: [
      {
        commodity_code: '1602509590',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: 'Processed',
        country_of_origin: null,
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '1602493000',
        description: 'RS BBQ RIB STD 8X157G',
        nature_of_products: null,
        number_of_packages: 22,
        total_net_weight_kg: 27.632,
        type_of_treatment: 'Processed',
        country_of_origin: null,
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '1602509590',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: 'Processed',
        country_of_origin: null,
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '1602493000',
        description: 'RS BBQ RIB STD 8X157G',
        nature_of_products: null,
        number_of_packages: 22,
        total_net_weight_kg: 27.632,
        type_of_treatment: 'Processed',
        country_of_origin: null,
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  multipleInvalidCoOTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.COO_INVALID +
        ' in sheet "KEPAK" row 22, sheet "KEPAK" row 23, sheet "KEPAK" row 24 in addition to 1 other locations.\n'
    },
    items: [
      {
        commodity_code: '1602509590',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: 'Processed',
        country_of_origin: 'INVALID',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '1602493000',
        description: 'RS BBQ RIB STD 8X157G',
        nature_of_products: null,
        number_of_packages: 22,
        total_net_weight_kg: 27.632,
        type_of_treatment: 'Processed',
        country_of_origin: 'INVALID',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '1602509590',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: 'Processed',
        country_of_origin: 'INVALID',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '1602493000',
        description: 'RS BBQ RIB STD 8X157G',
        nature_of_products: null,
        number_of_packages: 22,
        total_net_weight_kg: 27.632,
        type_of_treatment: 'Processed',
        country_of_origin: 'INVALID',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  xCoOTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '1602509590',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: 'Processed',
        country_of_origin: 'x',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  ineligibleItemWithTreatmentTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.PROHIBITED_ITEM +
        ' in sheet "KEPAK" row 22.\n'
    },
    items: [
      {
        commodity_code: '012',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: 'Processed',
        country_of_origin: 'INELIGIBLE_ITEM_ISO',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  multipleineligibleItemsWithTreatmentTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.PROHIBITED_ITEM +
        ' in sheet "KEPAK" row 22, sheet "KEPAK" row 23, sheet "KEPAK" row 24 in addition to 1 other locations.\n'
    },
    items: [
      {
        commodity_code: '012',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: 'Processed',
        country_of_origin: 'INELIGIBLE_ITEM_ISO',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '012',
        description: 'RS BBQ RIB STD 8X157G',
        nature_of_products: null,
        number_of_packages: 22,
        total_net_weight_kg: 27.632,
        type_of_treatment: 'Processed',
        country_of_origin: 'INELIGIBLE_ITEM_ISO',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '012',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: 'Processed',
        country_of_origin: 'INELIGIBLE_ITEM_ISO',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '012',
        description: 'RS BBQ RIB STD 8X157G',
        nature_of_products: null,
        number_of_packages: 22,
        total_net_weight_kg: 27.632,
        type_of_treatment: 'Processed',
        country_of_origin: 'INELIGIBLE_ITEM_ISO',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  ineligibleItemNoTreatmentTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.PROHIBITED_ITEM +
        ' in sheet "KEPAK" row 22.\n'
    },
    items: [
      {
        commodity_code: '012',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: null,
        country_of_origin: 'INELIGIBLE_ITEM_ISO',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  multipleineligibleItemsNoTreatmentTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.PROHIBITED_ITEM +
        ' in sheet "KEPAK" row 22, sheet "KEPAK" row 23, sheet "KEPAK" row 24 in addition to 1 other locations.\n'
    },
    items: [
      {
        commodity_code: '012',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: null,
        country_of_origin: 'INELIGIBLE_ITEM_ISO',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '012',
        description: 'RS BBQ RIB STD 8X157G',
        nature_of_products: null,
        number_of_packages: 22,
        total_net_weight_kg: 27.632,
        type_of_treatment: null,
        country_of_origin: 'INELIGIBLE_ITEM_ISO',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '012',
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: null,
        country_of_origin: 'INELIGIBLE_ITEM_ISO',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      },
      {
        commodity_code: '012',
        description: 'RS BBQ RIB STD 8X157G',
        nature_of_products: null,
        number_of_packages: 22,
        total_net_weight_kg: 27.632,
        type_of_treatment: null,
        country_of_origin: 'INELIGIBLE_ITEM_ISO',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  },
  nullTreatmentTypeWithNullIdentifierTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        failureReasonsDescriptions.IDENTIFIER_MISSING +
        ' in sheet "KEPAK" row 22.\n'
    },
    items: [
      {
        commodity_code: null,
        description: 'RS DOUBLE DECKER STD',
        nature_of_products: null,
        number_of_packages: 32,
        total_net_weight_kg: 30.336,
        type_of_treatment: null,
        country_of_origin: 'GB',
        total_net_weight_unit: 'KG',
        nirms: 'NIRMS'
      }
    ],
    establishment_numbers: ['RMS-GB-000149-005'],
    registration_approval_number: 'RMS-GB-000280',
    parserModel: parserModel.KEPAK1,
    unitInHeader: kepakHeaders.KEPAK1.findUnitInHeader,
    validateCountryOfOrigin: kepakHeaders.KEPAK1.validateCountryOfOrigin,
    blanketNirms: kepakHeaders.KEPAK1.blanketNirms
  }
}
