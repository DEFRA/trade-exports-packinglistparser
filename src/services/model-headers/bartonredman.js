/**
 * Barton and Redman model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Barton and Redman packing list variants used by matchers.
 */
const bartonRedmanHeaders = {
  BARTONREDMAN1: {
    establishmentNumber: {
      regex: /^RMS-GB-000137-\d{3}$/i
    },
    regex: {
      commodity_code: /Commodity code/i,
      description: /Description of goods/i,
      number_of_packages: /No\.? of packages/i,
      total_net_weight_kg: /Item Net Weight/i,
      type_of_treatment: /Type of Treatment/i,
      nirms: /NIRMS Red\/Green Lane/i,
      country_of_origin: /Country of Origin/i
    },
    findUnitInHeader: true,
    validateCountryOfOrigin: true,
    invalidSheets: ['References', 'Lookups', 'Meursing'],
    deprecated: false
  }
}

export { bartonRedmanHeaders }
