/**
 * M&S model headers
 *
 * Provides establishment number patterns and field mappings
 * for M&S packing list variants.
 */

const pdfMandsHeaders = {
  MANDS1: {
    establishmentNumber: {
      regex: /RMS-GB-000008-\d{3}/i,
      establishmentRegex: /RMS-GB-000008-\d{3}/i
    },
    headers: {
      description: {
        regex: /Description of Goods/i
      },
      commodity_code: {
        regex: /EU Commodity( Code)?/i
      },
      type_of_treatment: {
        regex: /Treatment Type/i
      },
      number_of_packages: {
        regex: /Trays\/Ctns/i
      },
      total_net_weight_kg: {
        regex: /Tot Net Weight/i
      }
    },
    country_of_origin: {
      regex: /Co. of( Origin)?/i
    },
    nirms: {
      regex: /NIRMS/i
    },
    // Validation flags
    validateCountryOfOrigin: true,
    findUnitInHeader: true,
    // Footer pattern to identify end of data
    footer: /Delivery IDs|\* see certification/,
    // Page number pattern
    pageNumber: /\d of \d*/,
    // First page pattern
    firstPage: /^1 of \d*/,
    deprecated: false
  }
}

export { pdfMandsHeaders }
