/**
 * Sainsburys model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Sainsburys packing list variants used by matchers.
 */

const commodityCodeRegex = /Commodity Code/i

const sainsburysHeaders = {
  SAINSBURYS1: {
    establishmentNumber: {
      regex: /RMS-GB-000094(-\d{3})?/i
    },
    regex: {
      description: /Product \/ Part Number Description/i,
      commodity_code: commodityCodeRegex,
      number_of_packages: /Packages/i,
      total_net_weight_kg: /Net\nWeight \/ Package/i,
      nature_of_products: /Product Type \/ Category/i,
      type_of_treatment: /Type of treatment/i
    },
    country_of_origin: /NIRMS Country of Origin/i,
    nirms: /NIRMS or non-NIRMS/i,
    validateCountryOfOrigin: true,
    findUnitInHeader: true
  }
}

export { sainsburysHeaders }
