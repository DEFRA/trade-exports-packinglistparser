/**
 * Warrens model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Warrens packing list variants used by matchers.
 */
const descriptionOfGoodsRegex = /Description of goods/i

const warrensHeaders = {
  WARRENS2: {
    establishmentNumber: {
      regex: /^RMS-GB-000174-\d{3}$/i
    },
    regex: {
      description: descriptionOfGoodsRegex,
      commodity_code: /Commodity code/i,
      number_of_packages: /No\.? of pkgs/i,
      total_net_weight_kg: /Item Net Weight/i,
      nature_of_products: /Nature of Product/i,
      type_of_treatment: /Type of Treatment/i
    },
    invalidSheets: ['GC REFERENCE', 'GC REF'],
    country_of_origin: /Country of Origin/i,
    nirms: /NIRMS \/ NON NIRMS/i,
    validateCountryOfOrigin: true,
    findUnitInHeader: true
  }
}

export { warrensHeaders }
