/**
 * Fowler-Welch model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Fowler-Welch packing list variants used by matchers.
 */

const fowlerwelchHeaders = {
  FOWLERWELCH2: {
    establishmentNumber: {
      regex: /^RMS-GB-000216-\d{3}$/i
    },
    regex: {
      description: /Description of goods/i,
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

export { fowlerwelchHeaders }
