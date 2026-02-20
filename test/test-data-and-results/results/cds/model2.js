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
        commodity_code: '3105209000',
        description: '002541 - Tapered Slate Small Planter Ash',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '1.9',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '3105209000',
        description: '070398 - Amber Wood / Velvet Rose Oud Candle',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '4',
        total_net_weight_kg: '24.7',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS2
  },
  validTestResultForMultipleSheets: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '3105209000',
        description: '002541 - Tapered Slate Small Planter Ash',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '1.9',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '3105209000',
        description: '034581 - Carissa Planter Nest - Aqua',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '4',
        total_net_weight_kg: '79.8',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS2
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
        type_of_treatment: null
      }
    ],
    registration_approval_number: null,
    parserModel: parserModel.CDS2
  },
  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Net Weight Unit of Measure (kg) not found.\nTotal net weight is missing in sheet "PackingList_Extract" row 2.\n'
    },
    items: [
      {
        commodity_code: '3105209000',
        description: '002541 - Tapered Slate Small Planter Ash',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: null,
        total_net_weight_unit: null,
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '3105209000',
        description: '070398 - Amber Wood / Velvet Rose Oud Candle',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '4',
        total_net_weight_kg: '24.7',
        total_net_weight_unit: null,
        type_of_treatment: null,
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS2
  },
  multipleRms: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasonsDescriptions.MULTIPLE_RMS
    },
    items: [
      {
        commodity_code: '3105209000',
        description: '002541 - Tapered Slate Small Planter Ash',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '1.9',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '3105209000',
        description: '070398 - Amber Wood / Velvet Rose Oud Candle',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '4',
        total_net_weight_kg: '24.7',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS2
  },
  missingKgunit: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'Net Weight Unit of Measure (kg) not found.\n'
    },
    items: [
      {
        commodity_code: '3105209000',
        description: '002541 - Tapered Slate Small Planter Ash',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '1.9',
        total_net_weight_unit: null,
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '3105209000',
        description: '070398 - Amber Wood / Velvet Rose Oud Candle',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '4',
        total_net_weight_kg: '24.7',
        total_net_weight_unit: null,
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS2
  },
  emptyTestResultNoRemos: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: 'Check GB Establishment RMS Number.'
    },
    items: [],
    registration_approval_number: null,
    parserModel: parserModel.NOREMOS
  },
  validTestResultWithNonNirmsNullCountryOfOrigin: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '5555666677',
        description: '0205 - Fillers',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '1',
        total_net_weight_kg: '3.2',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: null
      },
      {
        commodity_code: '7777888899',
        description: '0208 - Ready Made',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '8.9',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'IT'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS2
  },
  invalidTestResultNirmsMissingCountryOfOrigin: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Missing Country of Origin in sheet "PackingList_Extract" row 2.\n'
    },
    items: [
      {
        commodity_code: '1111222233',
        description: '0213 - Christmas Items',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '1',
        total_net_weight_kg: '2.1',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: null
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS2
  },
  validTestResultNonNirmsMultipleFormats: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '75863782',
        description: '047386 - 183cm White Christmas Tree',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '17.5',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '3926909790',
        description: '049435 - White Glitter Baubles - 6 pack',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '25',
        total_net_weight_kg: '14.1',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '3926909790',
        description: '041301 - Pedigree Festive Advent Calendar',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '1.9',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '3926909790',
        description: '047145 - Dr Pepper Mulled Wine 24 x 330ml Cans',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '6',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS2
  },
  validTestResultNirmsMultipleFormats: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '75863782',
        description: '047386 - 183cm White Christmas Tree',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '17.5',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '3926909790',
        description: '049435 - White Glitter Baubles - 6 pack',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '25',
        total_net_weight_kg: '14.1',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '3926909790',
        description: '041301 - Pedigree Festive Advent Calendar',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '1.9',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '3926909790',
        description: '047145 - Dr Pepper Mulled Wine 24 x 330ml Cans',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '6',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS2
  },
  invalidTestResultInvalidNirmsMoreThan3: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Invalid entry for NIRMS/Non-NIRMS goods in sheet "PackingList_Extract" row 2, sheet "PackingList_Extract" row 3, sheet "PackingList_Extract" row 4 in addition to 1 other locations.\n'
    },
    items: [
      {
        commodity_code: '75863782',
        description: '047386 - 183cm White Christmas Tree',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '17.5',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '3926909790',
        description: '049435 - White Glitter Baubles - 6 pack',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '25',
        total_net_weight_kg: '14.1',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '3926909790',
        description: '049465 - Red Glitter Baubles - 6 pack',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '25',
        total_net_weight_kg: '14.1',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '3926909790',
        description: '049465 - Red Glitter Baubles - 12 pack',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '25',
        total_net_weight_kg: '14.1',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS2
  },
  invalidTestResultInvalidNirmsLessThan3: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Invalid entry for NIRMS/Non-NIRMS goods in sheet "PackingList_Extract" row 2 and sheet "PackingList_Extract" row 3.\n'
    },
    items: [
      {
        commodity_code: '75863782',
        description: '047386 - 183cm White Christmas Tree',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '17.5',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      },
      {
        commodity_code: '3926909790',
        description: '049435 - White Glitter Baubles - 6 pack',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '25',
        total_net_weight_kg: '14.1',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS2
  },
  validTestResultNotOnProhibitedItemsList: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        commodity_code: '3926909790',
        description: '047301 - Mr Kipling Festival Fancies 8 pack',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '1.9',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS2
  },
  validTestResultOnProhibitedItemsList: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Prohibited item identified on the packing list in sheet "PackingList_Extract" row 2.\n'
    },
    items: [
      {
        commodity_code: '16025031',
        description: '047301 - Brazilian Beef Jerky',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '1.9',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Ambient Goods',
        country_of_origin: 'BR'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS2
  },
  validTestResultMultipleProhibitedItemsList_NoTreatmentType: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Prohibited item identified on the packing list in sheet "PackingList_Extract" row 2, sheet "PackingList_Extract" row 3, sheet "PackingList_Extract" row 4 in addition to 2 other locations.\n'
    },
    items: [
      {
        commodity_code: '16025031',
        description: '047301 - Brazilian Beef Jerky',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '1.9',
        total_net_weight_unit: 'KG',
        type_of_treatment: null,
        country_of_origin: 'BR'
      },
      {
        commodity_code: '0201',
        description: '020100 - Brazilian Beef',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '5',
        total_net_weight_kg: '7.2',
        total_net_weight_unit: 'KG',
        type_of_treatment: null,
        country_of_origin: 'BR'
      },
      {
        commodity_code: '16025031',
        description: '049203 - Brazilian Beef Skewers',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '3',
        total_net_weight_kg: '4.2',
        total_net_weight_unit: 'KG',
        type_of_treatment: null,
        country_of_origin: 'BR'
      },
      {
        commodity_code: '0202',
        description: '020200 - Brazilian Beef Cuts',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '4',
        total_net_weight_kg: '5.8',
        total_net_weight_unit: 'KG',
        type_of_treatment: null,
        country_of_origin: 'BR'
      },
      {
        commodity_code: '16025031',
        description: '051105 - Brazilian Beef Burgers',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '6',
        total_net_weight_kg: '8.4',
        total_net_weight_unit: 'KG',
        type_of_treatment: null,
        country_of_origin: 'BR'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS2
  },
  validTestResultMultipleProhibitedItemsListMoreThan3_TreatmentType: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons:
        'Prohibited item identified on the packing list in sheet "PackingList_Extract" row 2, sheet "PackingList_Extract" row 3, sheet "PackingList_Extract" row 4 in addition to 2 other locations.\n'
    },
    items: [
      {
        commodity_code: '0805900000',
        description: '001234 - Test Product Name One',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '2',
        total_net_weight_kg: '1.9',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Chilled',
        country_of_origin: 'EG'
      },
      {
        commodity_code: '0805900000',
        description: '001234 - Test Product Name Two',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '5',
        total_net_weight_kg: '7.2',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Raw',
        country_of_origin: 'BR'
      },
      {
        commodity_code: '0805900000',
        description: '001234 - Test Product Name Three',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '3',
        total_net_weight_kg: '4.2',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Chilled',
        country_of_origin: 'BR'
      },
      {
        commodity_code: '0805900000',
        description: '001234 - Test Product Name Four',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '4',
        total_net_weight_kg: '5.8',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Fresh',
        country_of_origin: 'BR'
      },
      {
        commodity_code: '0805900000',
        description: '001234 - Test Product Name Five',
        nature_of_products: 'General Retail Goods',
        number_of_packages: '6',
        total_net_weight_kg: '8.4',
        total_net_weight_unit: 'KG',
        type_of_treatment: 'Unprocessed',
        country_of_origin: 'BR'
      }
    ],
    registration_approval_number: 'RMS-GB-000252-002',
    parserModel: parserModel.CDS2
  }
}
