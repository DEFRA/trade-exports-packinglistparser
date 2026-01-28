/**
 * Packing list failure reason descriptions
 *
 * Human readable failure reason strings used by the packing list validators.
 * Keys are intentionally short identifiers used throughout the validation pipeline.
 */

const packingListFailureReasons = {
  IDENTIFIER_MISSING: 'Identifier is missing',
  PRODUCT_CODE_INVALID: 'Product code is invalid',
  DESCRIPTION_MISSING: 'Product description is missing',
  PACKAGES_MISSING: 'No of packages is missing',
  NET_WEIGHT_MISSING: 'Total net weight is missing',
  PACKAGES_INVALID: 'No of packages is invalid',
  NET_WEIGHT_INVALID: 'Total net weight is invalid',
  NIRMS_MISSING: 'NIRMS/Non-NIRMS goods not specified',
  NIRMS_INVALID: 'Invalid entry for NIRMS/Non-NIRMS goods',
  COO_MISSING: 'Missing Country of Origin',
  COO_INVALID: 'Invalid Country of Origin ISO Code',
  PROHIBITED_ITEM: 'Prohibited item identified on the packing list',
  NET_WEIGHT_UNIT_MISSING: 'Net Weight Unit of Measure (kg) not found',
  MISSING_REMOS: 'Check GB Establishment RMS Number.',
  EMPTY_DATA: 'No product line data found.',
  MULTIPLE_RMS:
    'Multiple GB Place of Dispatch (Establishment) numbers found on packing list.\n'
}

export default packingListFailureReasons
