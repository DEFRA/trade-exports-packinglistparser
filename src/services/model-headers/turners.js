/**
 * Turners model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Turners packing list variants used by matchers.
 */

const descriptionOfGoodsRegex = /Description of goods/i

export const turnersHeaders = {
  TURNERS1: {
    establishmentNumber: {
      regex: /^RMS-GB-000156-\d{3}$/i
    },
    regex: {
      description: descriptionOfGoodsRegex,
      commodity_code: /Commodity code/i,
      number_of_packages: /No\. of pkgs/i,
      total_net_weight_kg: /Item Net Weight/i,
      nature_of_products: /Nature of Product/i,
      type_of_treatment: /Type of Treatment/i
    },
    nirms: /NIRMS \/ NON NIRMS/i,
    country_of_origin: /Country of Origin/i,
    validateCountryOfOrigin: true,
    findUnitInHeader: true
  }
}
