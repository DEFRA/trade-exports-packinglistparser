/**
 * Savers model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Savers packing list variants used by matchers.
 */
const netWeight = /Net Weight/i

const saversHeaders = {
  SAVERS1: {
    invalidSheets: ['DC Sheet (with Calcs)', 'SPS Codes'],
    establishmentNumber: {
      regex: /RMS-GB-000247-(\d{3})?/i
    },
    regex: {
      description: /Item Description/i,
      commodity_code: /EU Commodity Code/i,
      number_of_packages: /CASE Quantity/i,
      total_net_weight_kg: netWeight
    },
    country_of_origin: /Country of Origin/i,
    type_of_treatment: /Type of Treatment/i,
    nirms: /NIRMS \/ SPS Item/i,
    validateCountryOfOrigin: true,
    findUnitInHeader: true
  }
}

export { saversHeaders }
