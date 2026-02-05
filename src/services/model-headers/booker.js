/**
 * Booker model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Booker packing list variants used by matchers.
 */

const bookerHeaders = {
  BOOKER2: {
    establishmentNumber: {
      regex: /RMS-GB-000077-\d{3}/i
    },
    regex: {
      description: /Description of Goods/i,
      commodity_code: /Commodity Code/i,
      number_of_packages: /No\. of Pkgs/i,
      total_net_weight_kg: /Net Weight/i,
      nature_of_products: /Nature of product/i,
      type_of_treatment: /Treatment Type/i
    },
    country_of_origin: /Country of Origin/i,
    nirms: /Lane/i,
    validateCountryOfOrigin: true,
    findUnitInHeader: true
  }
}

export { bookerHeaders }
