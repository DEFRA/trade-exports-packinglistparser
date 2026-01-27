/**
 * Buffaload Logistics model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Buffaload Logistics packing list variants used by matchers.
 */
const descriptionOfGoodsRegex = /Description of goods/i
const commodityCodeRegex = /Commodity Code/i
const noOfPackagesRegex = /No. of pkgs/i

const buffaloadHeaders = {
  BUFFALOAD1: {
    establishmentNumber: {
      regex: /^RMS-GB-000098-\d{3}$/i
    },
    regex: {
      description: descriptionOfGoodsRegex,
      type_of_treatment: /Type of Treatment/i,
      number_of_packages: noOfPackagesRegex,
      total_net_weight_kg: /Total Net Weight/i,
      commodity_code: commodityCodeRegex
    },
    country_of_origin: /ISO/i,
    nirms: /NIRMS\/ NON NIRMS/i,
    nature_of_products: /Nature of Product/i,
    validateCountryOfOrigin: true,
    findUnitInHeader: true
  }
}

export default buffaloadHeaders
