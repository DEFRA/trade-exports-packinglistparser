/**
 * Manfreight model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Manfreight packing list variants used by matchers.
 */

const manfreightHeaders = {
  MANFREIGHT1: {
    establishmentNumber: {
      regex: /^RMS-GB-000013-\d{3}$/i
    },
    regex: {
      description: /Description of goods/i,
      commodity_code: /Commodity Code/i,
      number_of_packages: /No\.\s*of\s*pkgs/i,
      total_net_weight_kg: /Total Net Weight/i,
      nature_of_products: /Nature of Product/i,
      type_of_treatment: /Type of Treatment/i
    },
    country_of_origin: /Country of Origin/i,
    nirms: /Nirms\/\s*Non\s*Nirms/i,
    findUnitInHeader: true,
    validateCountryOfOrigin: true,
    invalidSheets: ['Sheet2']
  },
  MANFREIGHT2: {
    establishmentNumber: {
      regex: /^RMS-GB-000465-\d{3}$/i
    },
    regex: {
      description: /Description of goods/i,
      commodity_code: /Commodity Code/i,
      number_of_packages: /No\.\s*of\s*pkgs/i,
      total_net_weight_kg: /Item Net Weight/i,
      nature_of_products: /Nature of Product/i,
      type_of_treatment: /Type of Treatment/i
    },
    country_of_origin: /Country of Origin/i,
    nirms: /Nirms\/\s*Non\s*Nirms/i,
    findUnitInHeader: true,
    validateCountryOfOrigin: true,
    invalidSheets: ['Sheet2']
  }
}

export { manfreightHeaders }
