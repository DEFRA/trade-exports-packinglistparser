const attestationText =
  'I, the responsible person, confirm that all ROW origin goods in this consignment are eligible to move under NIRMS because they have either: successfully passed checks at an EU BCP; been processed in GB; are products where the UK is taking the same approach as the EU to protect against similar pests and diseases; meet EU IUU regulations or have no SPS, certification or control requirements'

const validModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234567890',
    'GB',
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    'Non-NIRMS'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Ambient',
    '9876543210',
    'FR',
    'Test Product 2',
    '12.3',
    '20',
    'Processed',
    'Non-NIRMS'
  ]
]

const emptyModel = []

const wrongEstablishmentNumber = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000999-001',
    'Fresh',
    '1234567890',
    'GB',
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    'Non-NIRMS'
  ]
]

const wrongHeaders = [
  [
    '',
    'classification_code',
    'article_description',
    'article_nature',
    'treatment_type',
    'quantity_ordered',
    'net_weight_kg',
    'country_of_origin',
    'nirms',
    'establishment_number'
  ],
  ['RMS-GB-000040-001']
]

const invalidModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ]
]

const invalidModel_MissingColumnCells = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    null,
    null,
    'GB',
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    'Non-NIRMS'
  ]
]

const invalidModel_MultipleRms = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234567890',
    'GB',
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    'Non-NIRMS',
    'RMS-GB-000040-002'
  ]
]

const missingKgUnit = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234567890',
    'GB',
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    'Non-NIRMS'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Ambient',
    '9876543210',
    'FR',
    'Test Product 2',
    '12.3',
    '20',
    'Processed',
    'Non-NIRMS'
  ]
]

// CoO Validation Test Data Models
const validCooModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234567890',
    'GB',
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    'NIRMS'
  ]
]

const nonNirmsModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234567890',
    'GB',
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    'Non-NIRMS'
  ]
]

const nullNirmsModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234567890',
    'GB',
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    null
  ]
]

const invalidNirmsModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234567890',
    'GB',
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    'INVALID'
  ]
]

const nullCooModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234567890',
    null,
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    'NIRMS'
  ]
]

const invalidCooModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234567890',
    'INVALID',
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    'NIRMS'
  ]
]

const nullCooMultipleModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234567890',
    null,
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    'NIRMS'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Ambient',
    '9876543210',
    null,
    'Test Product 2',
    '12.3',
    '20',
    'Processed',
    'NIRMS'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Frozen',
    '1111111111',
    null,
    'Test Product 3',
    '8.7',
    '15',
    'Frozen',
    'NIRMS'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Fresh',
    '2222222222',
    null,
    'Test Product 4',
    '6.2',
    '12',
    'Chilled',
    'NIRMS'
  ]
]

const invalidCooMultipleModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234567890',
    'INVALID',
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    'NIRMS'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Ambient',
    '9876543210',
    'INVALID',
    'Test Product 2',
    '12.3',
    '20',
    'Processed',
    'NIRMS'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Frozen',
    '1111111111',
    'INVALID',
    'Test Product 3',
    '8.7',
    '15',
    'Frozen',
    'NIRMS'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Fresh',
    '2222222222',
    'INVALID',
    'Test Product 4',
    '6.2',
    '12',
    'Chilled',
    'NIRMS'
  ]
]

const cooPlaceholderXModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234567890',
    'X',
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    'NIRMS'
  ]
]

const ineligibleItemsWithTreatmentModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234',
    'INELIGIBLE_ITEM_ISO',
    'Ineligible ITEM 1 WITH TREATMENT',
    '5.5',
    '10',
    'Processed',
    'NIRMS'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Fresh',
    '1234',
    'INELIGIBLE_ITEM_ISO',
    'Ineligible ITEM 2 WITH TREATMENT',
    '12.3',
    '20',
    'Processed',
    'NIRMS'
  ]
]

const ineligibleItemsNoTreatmentModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234',
    'INELIGIBLE_ITEM_ISO',
    'Ineligible ITEM NO TREATMENT',
    '5.5',
    '10',
    null,
    'NIRMS'
  ]
]

const ineligibleItemsMultipleWithTreatmentModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234',
    'INELIGIBLE_ITEM_ISO',
    'Ineligible ITEM 1 WITH TREATMENT',
    '5.5',
    '10',
    'Processed',
    'NIRMS'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Fresh',
    '1234',
    'INELIGIBLE_ITEM_ISO',
    'Ineligible ITEM 2 WITH TREATMENT',
    '12.3',
    '20',
    'Processed',
    'NIRMS'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Fresh',
    '1234',
    'INELIGIBLE_ITEM_ISO',
    'Ineligible ITEM 3 WITH TREATMENT',
    '7.8',
    '15',
    'Processed',
    'NIRMS'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Ambient',
    '1234',
    'INELIGIBLE_ITEM_ISO',
    'Ineligible ITEM 4 WITH TREATMENT',
    '9.1',
    '25',
    'Processed',
    'NIRMS'
  ]
]

const ineligibleItemsMultipleNoTreatmentModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234',
    'INELIGIBLE_ITEM_ISO',
    'Ineligible ITEM 1 NO TREATMENT',
    '5.5',
    '10',
    null,
    'NIRMS'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Fresh',
    '1234',
    'INELIGIBLE_ITEM_ISO',
    'Ineligible ITEM 2 NO TREATMENT',
    '12.3',
    '20',
    null,
    'NIRMS'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Fresh',
    '1234',
    'INELIGIBLE_ITEM_ISO',
    'Ineligible ITEM 3 NO TREATMENT',
    '7.8',
    '15',
    null,
    'NIRMS'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Ambient',
    '1234',
    'INELIGIBLE_ITEM_ISO',
    'Ineligible ITEM 4 NO TREATMENT',
    '9.1',
    '25',
    null,
    'NIRMS'
  ]
]

const nullNirmsMultipleModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234567890',
    'GB',
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    null
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Ambient',
    '9876543210',
    'FR',
    'Test Product 2',
    '12.3',
    '20',
    'Processed',
    null
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Frozen',
    '1111111111',
    'DE',
    'Test Product 3',
    '8.7',
    '15',
    'Frozen',
    null
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Fresh',
    '2222222222',
    'IT',
    'Test Product 4',
    '6.2',
    '12',
    'Chilled',
    null
  ]
]

const invalidNirmsMultipleModel = [
  [
    '',
    'RMS Dispatch location',
    'Nature',
    'Tariff Code EU',
    'Country of Origin Code',
    'Product/Part Number description',
    'Net Weight/Package KG',
    'Packages',
    'Treatment Type',
    'NIRMS'
  ],
  [
    attestationText,
    'RMS-GB-000040-001',
    'Fresh',
    '1234567890',
    'GB',
    'Test Product 1',
    '5.5',
    '10',
    'Chilled',
    'INVALID'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Ambient',
    '9876543210',
    'FR',
    'Test Product 2',
    '12.3',
    '20',
    'Processed',
    'INVALID'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Frozen',
    '1111111111',
    'DE',
    'Test Product 3',
    '8.7',
    '15',
    'Frozen',
    'INVALID'
  ],
  [
    '',
    'RMS-GB-000040-001',
    'Fresh',
    '2222222222',
    'IT',
    'Test Product 4',
    '6.2',
    '12',
    'Chilled',
    'INVALID'
  ]
]

export default {
  validModel,
  emptyModel,
  wrongEstablishmentNumber,
  wrongHeaders,
  invalidModel,
  invalidModel_MissingColumnCells,
  invalidModel_MultipleRms,
  missingKgUnit,
  validCooModel,
  nonNirmsModel,
  nullNirmsModel,
  invalidNirmsModel,
  nullNirmsMultipleModel,
  invalidNirmsMultipleModel,
  nullCooModel,
  invalidCooModel,
  nullCooMultipleModel,
  invalidCooMultipleModel,
  cooPlaceholderXModel,
  ineligibleItemsWithTreatmentModel,
  ineligibleItemsNoTreatmentModel,
  ineligibleItemsMultipleWithTreatmentModel,
  ineligibleItemsMultipleNoTreatmentModel
}
