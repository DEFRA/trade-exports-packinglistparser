/**
 * Lactalis McLelland model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Lactalis McLelland packing list variants used by matchers.
 * Covers both LACTALIS MCL (Q8) and LACTALIS LNCD (Q7) sheet formats.
 */

export const lactalisHeaders = {
  LACTALIS1: {
    establishmentNumber: {
      regex: /^RMS-GB-0000(60|63)-\d{3}$/i
    },
    regex: {
      description: /DESCRIPTION/i,
      commodity_code: /Commodity Code/i,
      number_of_packages: /Quantity/i,
      total_net_weight_kg: /Net Weight/i
    },
    country_of_origin: /Country of Origin/i,
    // Validation flags
    findUnitInHeader: true,
    validateCountryOfOrigin: true,
    // Excel-specific flags
    invalidSheets: []
  }
}
