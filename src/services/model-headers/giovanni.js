/**
 * Giovanni model headers
 *
 * Provides establishment number regexes and header configurations
 * for Giovanni packing list formats (Excel and PDF coordinate-based).
 */

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

export { pdfGiovanniHeaders }
