/**
 * B&M model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for B&M packing list variants used by matchers.
 */

const commodityCodeRegex = /Commodity Code/i
const netWeight = /Net Weight/i

const bandmHeaders = {
  BANDM1: {
    establishmentNumber: {
      regex: /^RMS-GB-000005-\d{3}$/i
    },
    regex: {
      description: /ITEM DESCRIPTION/i,
      commodity_code: commodityCodeRegex,
      number_of_packages: /TOTAL NUMBER OF CASES/i,
      total_net_weight_kg: netWeight
    },
    findUnitInHeader: true,
    validateCountryOfOrigin: true,
    country_of_origin: /COUNTRY OF ORIGIN/i,
    blanketNirms: {
      regex: /This consignment contains only NIRMS eligible goods/i,
      value: 'NIRMS'
    },
    blanketTreatmentType: {
      regex: /Treatment type: all products are processed/i,
      value: 'Processed'
    },
    // Row filtering configuration
    skipTotalsRows: true,
    skipRepeatedHeaders: true,
    totalsRowKeywords: ['total', 'totals', 'grand total'],
    totalsRowPattern: {
      hasNumericOnly: true, // Only numeric fields populated
      descriptionEmpty: true, // Description field must be empty
      commodityCodeEmpty: true // Commodity code field must be empty
    }
  }
}

export { bandmHeaders }
