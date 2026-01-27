/**
 * Co-op model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Co-op packing list variants used by matchers.
 */
const descriptionRegex = /Product\/ Part Number description/i

const coopHeaders = {
  COOP1: {
    establishmentNumber: {
      regex: /^RMS-GB-000009-\d{3}$/i
    },
    regex: {
      description: descriptionRegex,
      commodity_code: /Tariff Code EU/i,
      number_of_packages: /Packages$/i,
      total_net_weight_kg: /NW total/i,
      header_net_weight_unit: /Net Weight\/Package/i
    },
    country_of_origin: /Country of Origin/i,
    type_of_treatment: /Type of Treatment/i,
    nirms: /^NIRMS$/i,
    findUnitInHeader: true,
    validateCountryOfOrigin: true,
    // Required and optional field lists
    required: [
      'description',
      'commodity_code',
      'number_of_packages',
      'total_net_weight_kg',
      'header_net_weight_unit'
    ],
    optional: ['country_of_origin', 'type_of_treatment', 'nirms']
  }
}

export { coopHeaders }
export default coopHeaders
