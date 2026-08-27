/**
 * Nutricia model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Nutricia packing list variants used by matchers.
 */

const nutriciaHeaders = {
  NUTRICIA3: {
    establishmentNumber: {
      regex: /^RMS-GB-000133(-\d{3})?$/i
    },
    regex: {
      description: /^Description$/i,
      commodity_code: /Commodity Code/i,
      number_of_packages: /Quantity/i,
      total_net_weight_kg: /Net ?Weight/i
    },
    country_of_origin: /Country of origin/i,
    blanketNatureOfProductsValue: {
      regex: /Nature of Product/i,
      valueCellOffset: {
        col: 0,
        row: 1
      }
    },
    blanketTreatmentTypeValue: {
      regex: /Type of Treatment/i,
      valueCellOffset: {
        col: 0,
        row: 1
      }
    },
    blanketNirmsValue: {
      regex: /NIRMS ONLY/i,
      valueCellOffset: {
        col: 0,
        row: 1
      }
    },
    findUnitInHeader: true,
    validateCountryOfOrigin: true
  },
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
    findUnitInHeader: true,
    deprecated: true
  }
}

export { nutriciaHeaders }
