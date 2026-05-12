/**
 * Lactalis McLelland Model 1 – test model fixtures
 *
 * Represents Excel-to-JSON workbook shapes consumed by
 * the matcher, parser, and parser-service integration tests.
 *
 * Column mapping (header row):
 *   A: Consignment Reference
 *   B: Product Code
 *   C: DESCRIPTION
 *   D: (empty)
 *   E: Commodity Code
 *   F: Country of Origin
 *   G: Quantity
 *   H: Net Weight (KG)
 *   I: Gross Weight (KG)
 */

const ESTABLISHMENT_NUMBER = 'RMS-GB-000060-001'
const ESTABLISHMENT_NUMBER_LNCD = 'RMS-GB-000063-001'

const headerRow = {
  A: 'Consignment Reference',
  B: 'Product Code',
  C: 'DESCRIPTION',
  D: '',
  E: 'Commodity Code',
  F: 'Country of Origin',
  G: 'Quantity',
  H: 'Net Weight (KG)',
  I: 'Gross Weight (KG)'
}

const metadataRows = [
  { A: 'GC Ref: RMS/2026/123456' },
  {},
  {},
  { A: 'SHIPPER DETAILS:', D: 'CONSIGNEE DETAILS:' },
  { A: 'LACTALIS MCLELLAND LIMITED' },
  { A: '1st Floor Grosvenor House, 65-71 London Road' },
  { A: 'Redhill, Surrey, RH1 1LQ' },
  { A: 'COUNTRY' },
  { A: 'United Kingdom' },
  { A: 'GB EORI' },
  { A: 'GB894862658000' },
  { A: 'UKIMS NUMBER' },
  { A: 'XIUKIM89486265800020230731112748', H: ESTABLISHMENT_NUMBER },
  { A: 'NIRMS NUMBER' },
  { A: ESTABLISHMENT_NUMBER },
  { A: 'TRANSPORT ID' },
  {},
  {},
  {},
  {},
  {},
  { A: 'GOODS DETAIL' }
]

const metadataRowsLncd = [
  { A: 'GC Ref: RMS/2026/789012' },
  {},
  { A: 'SHIPPER DETAILS:', D: 'CONSIGNEE DETAILS:' },
  { A: 'Lactalis Nestle Chilled Dairy Company Limited' },
  { A: '1st Floor, Grosvenor House' },
  { A: 'Redhill, Surrey, RH1 1LQ' },
  { A: 'COUNTRY' },
  { A: 'United Kingdom' },
  { A: 'GB EORI' },
  { A: 'GB886921471000' },
  { A: 'UKIMS NUMBER' },
  { A: 'XIUKIM88692147100020230803112027', H: ESTABLISHMENT_NUMBER_LNCD },
  { A: 'NIRMS NUMBER' },
  { A: ESTABLISHMENT_NUMBER_LNCD },
  { A: 'TRANSPORT ID' },
  {},
  {},
  {},
  {},
  {},
  { A: 'GOODS DETAIL' }
]

export default {
  validModel: {
    'LACTALIS MCL (Q8) ': [
      ...metadataRows,
      headerRow,
      {
        A: '498983506',
        B: '12510',
        C: 'NESQUIK SNACK MILK SLICE',
        D: '',
        E: '1905907000',
        F: 'IT',
        G: 18,
        H: 18.72,
        I: 21.834
      },
      {
        A: '498983506',
        B: '125926',
        C: 'LINDAHLS KVARG VANILLA',
        D: '',
        E: '0406105090',
        F: 'SE',
        G: 192,
        H: 230.4,
        I: 255.744
      }
    ]
  },

  validModelLncd: {
    'LACTALIS LNCD (Q7)': [
      ...metadataRowsLncd,
      headerRow,
      {
        A: '499001817',
        B: '11133',
        C: 'SKI SMOOTH STRW RASPBERRY',
        D: '',
        E: '0403205300',
        F: 'GB',
        G: 198,
        H: 570.24,
        I: 617.76
      }
    ]
  },

  wrongEstablishment: {
    'LACTALIS MCL (Q8) ': [
      { A: 'GC Ref: RMS/2026/123456' },
      {},
      {},
      { A: 'SHIPPER DETAILS:' },
      { A: 'LACTALIS MCLELLAND LIMITED' },
      { A: '1st Floor Grosvenor House' },
      { A: 'Redhill, Surrey, RH1 1LQ' },
      { A: 'COUNTRY' },
      { A: 'United Kingdom' },
      { A: 'GB EORI' },
      { A: 'GB894862658000' },
      { A: 'UKIMS NUMBER' },
      { A: 'XIUKIM89486265800020230731112748' },
      { A: 'NIRMS NUMBER' },
      { A: 'RMS-GB-000999-001' },
      { A: 'TRANSPORT ID' },
      {},
      {},
      {},
      {},
      {},
      { A: 'GOODS DETAIL' },
      headerRow,
      {
        A: '498983506',
        B: '12510',
        C: 'NESQUIK SNACK MILK SLICE',
        D: '',
        E: '1905907000',
        F: 'IT',
        G: 18,
        H: 18.72,
        I: 21.834
      }
    ]
  },

  incorrectHeader: {
    'LACTALIS MCL (Q8) ': [
      ...metadataRows,
      {
        A: 'Wrong Column A',
        B: 'Wrong Column B',
        C: 'Wrong Column C'
      },
      {
        A: '498983506',
        B: '12510',
        C: 'NESQUIK SNACK MILK SLICE',
        D: '',
        E: '1905907000',
        F: 'IT',
        G: 18,
        H: 18.72,
        I: 21.834
      }
    ]
  },

  blankPlaceholderRows: {
    'LACTALIS MCL (Q8) ': [
      ...metadataRows,
      headerRow,
      {
        A: '(blank)',
        B: '(blank)',
        C: '(blank)',
        D: '',
        E: '(blank)',
        F: '(blank)',
        G: 0,
        H: 0,
        I: 0
      },
      {
        A: '498983506',
        B: '12510',
        C: 'NESQUIK SNACK MILK SLICE',
        D: '',
        E: '1905907000',
        F: 'IT',
        G: 18,
        H: 18.72,
        I: 21.834
      }
    ]
  },

  zeroFilledRows: {
    'LACTALIS LNCD (Q7)': [
      ...metadataRowsLncd,
      headerRow,
      {
        A: '499001817',
        B: '11133',
        C: 'SKI SMOOTH STRW RASPBERRY',
        D: '',
        E: '0403205300',
        F: 'GB',
        G: 198,
        H: 570.24,
        I: 617.76
      },
      {
        A: 0,
        B: 0,
        C: 0,
        D: '',
        E: 0,
        F: 0,
        G: 0,
        H: 0,
        I: 0
      }
    ]
  }
}
