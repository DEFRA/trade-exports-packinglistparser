/**
 * Iceland model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Iceland packing list variants used by matchers.
 */

const csvIcelandHeaders = {
  ICELAND2: {
    establishmentNumber: {
      regex: /RMS-GB-000040-\d{3}$/i
    },
    regex: {
      commodity_code: /Tariff Code EU/i,
      description: /Product\/Part Number description/i,
      type_of_treatment: /Treatment Type/i,
      number_of_packages: /Packages/i,
      total_net_weight_kg: /Net Weight\/Package/i,
      nature_of_products: /Product Type\/Category|^Nature$/i
    },
    nirms: /NIRMS/i,
    country_of_origin: /Country of Origin Code/i,
    // Validation flags
    findUnitInHeader: true,
    validateCountryOfOrigin: true,
    // CSV-specific flags
    invalidSheets: [],
    deprecated: false
  }
}

export { csvIcelandHeaders }
