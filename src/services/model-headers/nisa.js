/**
 * Nisa model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Nisa packing list variants used by matchers.
 */

export const nisaHeaders = {
  NISA1: {
    establishmentNumber: {
      regex: /RMS-GB-000025-(\d{3})?/i
    },
    regex: {
      description: /PART_NUMBER_DESCRIPTION/i,
      commodity_code: /TARIFF_CODE_EU/i,
      number_of_packages: /PACKAGES/i,
      total_net_weight_kg: /NET_WEIGHT_TOTAL/i,
      nature_of_products: /PRODUCT_TYPE_CATEGORY/i,
      header_net_weight_unit: /NET_WEIGHT_PACKAGE/i
    },
    // Optional fields
    country_of_origin: /COUNTRY_OF_ORIGIN/i,
    type_of_treatment: /TYPE_OF_TREATMENT/i,
    nirms: /NIRMS/i,
    // Validation flags
    findUnitInHeader: true,
    validateCountryOfOrigin: true,
    // Required and optional field lists
    required: [
      'description',
      'commodity_code',
      'number_of_packages',
      'total_net_weight_kg',
      'nature_of_products',
      'header_net_weight_unit'
    ],
    optional: ['country_of_origin', 'type_of_treatment', 'nirms']
  },
  NISA2: {
    establishmentNumber: {
      regex: /RMS-GB-000025-(\d{3})?/i
    },
    regex: {
      description: /PART NUMBER DESCRIPTION/i,
      commodity_code: /TARIFF CODE EU/i,
      number_of_packages: /PACKAGES/i,
      total_net_weight_kg: /NET WEIGHT TOTAL/i,
      nature_of_products: /PRODUCT TYPE CATEGORY/i,
      header_net_weight_unit: /NET WEIGHT PACKAGE/i
    },
    // Optional fields
    country_of_origin: /COUNTRY OF ORIGIN/i,
    type_of_treatment: /TYPE OF TREATMENT/i,
    nirms: /NIRMS/i,
    // Validation flags
    findUnitInHeader: true,
    validateCountryOfOrigin: true,
    // Required and optional field lists
    required: [
      'description',
      'commodity_code',
      'number_of_packages',
      'total_net_weight_kg',
      'nature_of_products',
      'header_net_weight_unit'
    ],
    optional: ['country_of_origin', 'type_of_treatment', 'nirms']
  }
}
