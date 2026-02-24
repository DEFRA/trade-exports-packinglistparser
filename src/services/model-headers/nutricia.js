/**
 * Nutricia model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Nutricia packing list variants used by matchers.
 */

const nutriciaHeaders = {
  NUTRICIA2: {
    establishmentNumber: {
      regex: /^RMS-GB-000133(-\d{3})?$/i
    },
    regex: {
      description: /Material description/i,
      commodity_code: /Commodity code/i,
      number_of_packages: /Order qty/i,
      total_net_weight_kg: /Order net weight/i
    },
    country_of_origin: /coo/i,
    findUnitInHeader: true
  }
}

export { nutriciaHeaders }
