/**
 * Boots model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Boots packing list variants used by matchers.
 */

export const bootsHeaders = {
  BOOTS1: {
    establishmentNumber: {
      regex: /^RMS-GB-000084-\d{3}$/i
    },
    regex: {
      description: /Description/i,
      number_of_packages: /Quantity/i,
      total_net_weight_kg: /NetMass/i,
      commodity_code: /CommodityCode/i
    },
    country_of_origin: /CountryOrigin/i,
    findUnitInHeader: true
  }
}
