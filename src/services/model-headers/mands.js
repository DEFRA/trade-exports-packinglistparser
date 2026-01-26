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
        x1: 75,
        x2: 200,
        regex: /Description of Goods/i
      },
      commodity_code: {
        x1: 255,
        x2: 330,
        regex: /EU Commodity Code/i
      },
      type_of_treatment: {
        x1: 335,
        x2: 395,
        regex: /Treatment Type/i
      },
      number_of_packages: {
        x1: 440,
        x2: 480,
        regex: /Trays\/Ctns/i
      },
      total_net_weight_kg: {
        x1: 550,
        x2: 600,
        regex: /Tot Net Weight/i
      }
    },
    country_of_origin: {
      x1: 210,
      x2: 250,
      regex: /Co. of( Origin)?/i
    },
    nirms: {
      x1: 400,
      x2: 435,
      regex: /NIRMS/i
    },
    // Required fields
    required: [
      'description',
      'commodity_code',
      'type_of_treatment',
      'number_of_packages',
      'total_net_weight_kg'
    ],
    // Optional fields
    optional: ['country_of_origin', 'nirms'],
    // Y-coordinate range for header row
    minHeadersY: 214,
    maxHeadersY: 225,
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
