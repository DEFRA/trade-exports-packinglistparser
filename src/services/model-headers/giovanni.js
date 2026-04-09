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
    }
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
    findUnitInHeader: true
  }
}

const pdfGiovanniHeaders = {
  GIOVANNI3: {
    establishmentNumber: {
      regex: /RMS-GB-000149(-\d{3})?/i,
      x1: 455,
      x2: 545,
      y1: 130,
      y2: 165
    },
    headers: {
      description: {
        x: /DESCRIPTION/i,
        x1: 125,
        x2: 235,
        regex: /DESCRIPTION/i
      },
      commodity_code: {
        x: /Commodity Code/i,
        x1: 235,
        x2: 280,
        regex: /Commodity Code/i
      },
      number_of_packages: {
        x: /Quantity/i,
        x1: 320,
        x2: 412,
        regex: /Quantity/i
      },
      total_net_weight_kg: {
        x: /Net/i,
        x1: 360,
        x2: 445,
        regex: /Net Weight/i
      },
      type_of_treatment: {
        x: /Type of Treatment|METHOD/i,
        x1: 320,
        x2: 400,
        regex: /Type of Treatment|METHOD/i,
        minHeadersY: 190,
        maxHeadersY: 205
      }
    },
    country_of_origin: {
      x1: 285,
      x2: 320,
      regex: /Country of|C.untry|^Origin$/i
    },
    nirms: {
      x1: 475,
      x2: 520,
      regex: /NIRMS\s*ONLY/i
    },
    blanketNirmsValue: {
      x1: 475,
      x2: 520,
      maxHeadersY: 340,
      regex: /NIRMS\s*ONLY/i
    },
    minHeadersY: 280,
    maxHeadersY: 300,
    findUnitInHeader: true,
    strictUnitMatch: true,
    validateCountryOfOrigin: true,
    blanketTreatmentTypeValue: {
      x1: 320,
      x2: 400,
      maxHeadersY: 250,
      regex: /Type of Treatment|METHOD/i
    }
  }
}

export { giovanniHeaders, pdfGiovanniHeaders }
export default giovanniHeaders
