/**
 * CDS model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for CDS packing list variants used by matchers.
 */
const cdsHeaders = {
  CDS1: {
    establishmentNumber: {
      regex: /RMS-GB-000252(-\d{3})?/i
    },
    regex: {
      description: /^Product$/i,
      type_of_treatment: /Treatment/i,
      number_of_packages: /# Packages/i,
      total_net_weight_kg: /NetWeight/i,
      nature_of_products: /NatureOfProduct/i
    },
    findUnitInHeader: true
  },
  CDS2: {
    establishmentNumber: {
      regex: /RMS-GB-000252-\d{3}/i
    },
    regex: {
      description: /^Product$/i,
      number_of_packages: /# Packages/i,
      total_net_weight_kg: /NetWeight/i,
      nature_of_products: /NatureOfProduct/i,
      type_of_treatment: /Treatment/i,
      commodity_code: /Commodity Code/i
    },
    country_of_origin: /COO/i,
    nirms: /NIRMS/i,
    findUnitInHeader: true,
    validateCountryOfOrigin: true
  }
}

export { cdsHeaders }
