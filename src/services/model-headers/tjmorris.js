/**
 * TJ Morris model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for TJ Morris packing list variants used by matchers.
 */

const netWeight = /Net Weight/i

const tjmorrisHeaders = {
  TJMORRIS2: {
    establishmentNumber: {
      regex: /^RMS-GB-000010-\d{3}$/i
    },
    regex: {
      description: /Description/i,
      commodity_code: /Tariff\/Commodity/i,
      number_of_packages: /Number of packages/i,
      total_net_weight_kg: netWeight,
      type_of_treatment: /Treatment Type/i,
      nature_of_products: /Nature of Products/i
    },
    findUnitInHeader: true,
    country_of_origin: /Country of Origin/i,
    nirms: /NIRMS Eligible/i,
    required: [
      'description',
      'commodity_code',
      'number_of_packages',
      'total_net_weight_kg',
      'type_of_treatment',
      'nature_of_products'
    ],
    optional: ['country_of_origin', 'nirms'],
    validateCountryOfOrigin: true,
    invalidSheets: [],
    deprecated: false
  }
}

export default tjmorrisHeaders
