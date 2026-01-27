/**
 * ASDA Model 4 CSV Test Data
 *
 * Test data models for ASDA4 CSV packing list parser.
 * Copied from legacy repository with minimal changes (ES6 exports only).
 */

const attestationText =
  'I, the responsible person, confirm that all ROW origin goods in this consignment are eligible to move under NIRMS because they have either: successfully passed checks at an EU BCP; been processed in GB; are products where the UK is taking the same approach as the EU to protect against similar pests and diseases; meet EU IUU regulations or have no SPS, certification or control requirements'

const validModel = [
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
  [
    attestationText,
    '1234567890',
    'Test Product 1',
    'Fresh',
    'Chilled',
    '10',
    '5.5',
    'GB',
    'NIRMS',
    'RMS-GB-000015-001'
  ],
  [
    '',
    '9876543210',
    'Test Product 2',
    'Processed',
    'Ambient',
    '20',
    '12.3',
    'FR',
    'NON-NIRMS',
    'RMS-GB-000015-001'
  ]
]

const validModelAttestationAtFooter = [
  [
    'unused_columnpo_number',
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
  [
    null,
    '1234567890',
    'Test Product 1',
    'Fresh',
    'Chilled',
    '10',
    '5.5',
    'GB',
    'NIRMS',
    'RMS-GB-000015-001'
  ],
  [
    null,
    '9876543210',
    'Test Product 2',
    'Processed',
    'Ambient',
    '20',
    '12.3',
    'FR',
    'NON-NIRMS',
    'RMS-GB-000015-001'
  ],
  [attestationText, null, null, null, null, null, null, null, null, null]
]

const emptyModel = []

const wrongEstablishmentNumber = [
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
  [
    attestationText,
    '1234567890',
    'Test Product 1',
    'Fresh',
    'Chilled',
    '10',
    '5.5',
    'GB',
    'NIRMS',
    'RMS-GB-999999-999'
  ]
]

const wrongHeaders = [
  [
    null,
    'wrong_code',
    'wrong_desc',
    'wrong_nature',
    'wrong_treatment',
    'wrong_quantity',
    'wrong_weight',
    'wrong_country',
    'wrong_nirms',
    'wrong_establishment_number'
  ],
  [
    attestationText,
    '1234567890',
    'Test Product 1',
    'Fresh',
    'Chilled',
    '10',
    '5.5',
    'GB',
    'NIRMS',
    'RMS-GB-000015-001'
  ]
]

const invalidModel_MissingColumnCells = [
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
  [
    attestationText,
    null,
    null,
    'Test Product 1',
    'Fresh',
    'Chilled',
    '10',
    '5.5',
    'GB',
    'NIRMS',
    'RMS-GB-000015-001'
  ],
  [
    null,
    '9876543210',
    'Test Product 2',
    'Processed',
    'Ambient',
    '20',
    '12.3',
    'FR',
    'NON-NIRMS',
    'RMS-GB-000015-001'
  ]
]

const invalidModel_MultipleRms = [
  [
    null,
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
  [
    attestationText,
    '1234567890',
    'Test Product 1',
    'Fresh',
    'Chilled',
    '10',
    '5.5',
    'GB',
    'NIRMS',
    'RMS-GB-000015-001'
  ],
  [
    '',
    '9876543210',
    'Test Product 2',
    'Processed',
    'Ambient',
    '20',
    '12.3',
    'FR',
    'NON-NIRMS',
    'RMS-GB-000015-002'
  ]
]

const invalidModel = [
  [
    null,
    'classification_code',
    'article_description',
    'article_nature',
    'treatment_type',
    'quantity_ordered',
    'net_weight_kg',
    'country_of_origin',
    'nirms'
  ],
  [
    attestationText,
    '1234567890',
    'Test Product 1',
    'Fresh',
    'Chilled',
    '10',
    '5.5',
    'GB',
    'NIRMS'
  ]
]

export default {
  validModel,
  validModelAttestationAtFooter,
  emptyModel,
  wrongEstablishmentNumber,
  wrongHeaders,
  invalidModel_MissingColumnCells,
  invalidModel_MultipleRms,
  invalidModel
}
