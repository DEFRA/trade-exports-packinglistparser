/**
 * Kepak model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Kepak packing list variants used by matchers.
 */
const commodityCodeRegex = /Commodity Code/i
const netWeight = /Net Weight/i

const kepakHeaders = {
  KEPAK1: {
    establishmentNumber: {
      regex: /RMS-GB-000280(-\d{3})?/i
    },
    regex: {
      description: /DESCRIPTION/i,
      commodity_code: commodityCodeRegex,
      number_of_packages: /Quantity/i,
      total_net_weight_kg: netWeight
    },
    country_of_origin: /Country of Origin/i,
    findUnitInHeader: true,
    validateCountryOfOrigin: true,
    blanketNirms: {
      regex:
        /The exporter of the products covered by this document \(NIRMS RMS-GB-000280\)\s*declares that these products are intend for the Green lane and will remain\s+in Northern Ireland./i,
      value: 'NIRMS'
    },
    blanketTreatmentTypeValue: {
      regex: /Type of Treatment/i,
      valueCellOffset: {
        col: 0,
        row: 1
      }
    }
  }
}

export { kepakHeaders }
