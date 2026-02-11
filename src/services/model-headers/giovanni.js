/**
 * Giovanni model headers
 *
 * Provides establishment number regexes and header configurations
 * for Giovanni packing list formats (Excel and PDF coordinate-based).
 */

const commodityCodeRegex = /Commodity Code/i
const netWeight = /Net Weight/i

const giovanniHeaders = {
  GIOVANNI1: {
    establishmentNumber: {
      regex: /^RMS-GB-000153(-\d{3})?$/i
    },
    regex: {
      description: /DESCRIPTION/i,
      commodity_code: commodityCodeRegex,
      number_of_packages: /Quantity/i,
      total_net_weight_kg: netWeight
    },
    country_of_origin: /Country of Origin/i,
    validateCountryOfOrigin: true,
    findUnitInHeader: true,
    blanketNirms: {
      regex:
        /The exporter of the products covered by this document \(NIRMS RMS-GB-000153(-\d{3})?\)\s*declares that these products are intend for the Green lane and will remain\s*in Northern Ireland/i,
      value: 'NIRMS'
    },
    blanketTreatmentTypeValue: {
      regex: /Type of Treatment/i,
      valueCellOffset: {
        col: 0,
        row: 1
      }
    },
    required: [
      'description',
      'commodity_code',
      'number_of_packages',
      'total_net_weight_kg'
    ],
    optional: ['country_of_origin']
  },
  GIOVANNI2: {
    establishmentNumber: {
      regex: /RMS-GB-000149(-\d{3})?/i
    },
    regex: {
      description: /DESCRIPTION/i,
      commodity_code: commodityCodeRegex,
      number_of_packages: /Qauntity/i,
      total_net_weight_kg: netWeight
    },
    country_of_origin: /Country of Origin/i,
    findUnitInHeader: true,
    required: [
      'description',
      'commodity_code',
      'number_of_packages',
      'total_net_weight_kg'
    ],
    optional: ['country_of_origin']
  }
}

const pdfGiovanniHeaders = {
  GIOVANNI3: {
    establishmentNumber: {
      regex: /RMS-GB-000149(-\d{3})?/i
    },
    headers: {
      description: {
        x: /DESCRIPTION/i,
        x1: 125,
        x2: 255,
        regex: /DESCRIPTION/i
      },
      commodity_code: {
        x: /Commodity Code/i,
        x1: 255,
        x2: 350,
        regex: /Commodity Code/i
      },
      number_of_packages: {
        x: /Quantity/i,
        x1: 355,
        x2: 389,
        regex: /Quantity/i
      },
      total_net_weight_kg: {
        x: /Net/i,
        x1: 389,
        x2: 439,
        regex: /Net Weight/i
      }
    },
    minHeadersY: 280,
    maxHeadersY: 300,
    findUnitInHeader: true
  }
}

export { giovanniHeaders, pdfGiovanniHeaders }
export default giovanniHeaders
