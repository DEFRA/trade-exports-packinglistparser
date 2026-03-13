const COMMODITY_CODE_HEADER = 'Commodity code'
const DESCRIPTION_OF_GOODS_HEADER = 'Description of goods'
const NUMBER_OF_PACKAGES_HEADER = 'No. of packages'
const ITEM_NET_WEIGHT_HEADER = 'Item Net Weight (kgs)'
const TYPE_OF_TREATMENT_HEADER = 'Type of Treatment'
const NIRMS_LANE_HEADER = 'NIRMS Red/Green Lane'
const COUNTRY_OF_ORIGIN_HEADER = 'Country of Origin (ISO 2-letter code(s))'

const HEADER_ROW = {
  B: COMMODITY_CODE_HEADER,
  C: DESCRIPTION_OF_GOODS_HEADER,
  D: NUMBER_OF_PACKAGES_HEADER,
  E: ITEM_NET_WEIGHT_HEADER,
  F: TYPE_OF_TREATMENT_HEADER,
  G: NIRMS_LANE_HEADER,
  H: COUNTRY_OF_ORIGIN_HEADER
}

const ESTABLISHMENT_NUMBER = 'RMS-GB-000137-001'
const RED_PEPPERS_DESCRIPTION = 'Barton and Redman Red Peppers'
const CUCUMBERS_DESCRIPTION = 'Barton and Redman Cucumbers'

export default {
  validModel: {
    'Input Packing Sheet': [
      { ...HEADER_ROW },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0709601000',
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED',
        G: 'GREEN',
        H: 'GB'
      },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0707000599',
        C: CUCUMBERS_DESCRIPTION,
        D: 6,
        E: 8,
        F: 'CHILLED',
        G: 'RED',
        H: null
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      { ...HEADER_ROW },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0709601000',
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED',
        G: 'GREEN',
        H: 'GB'
      }
    ],
    Sheet2: [
      { ...HEADER_ROW },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0707000599',
        C: CUCUMBERS_DESCRIPTION,
        D: 6,
        E: 8,
        F: 'CHILLED',
        G: 'RED',
        H: null
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    Sheet1: [
      { ...HEADER_ROW },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0709601000',
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED',
        G: 'GREEN',
        H: 'GB'
      }
    ],
    Sheet2: [
      {},
      { ...HEADER_ROW },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0707000599',
        C: CUCUMBERS_DESCRIPTION,
        D: 6,
        E: 8,
        F: 'CHILLED',
        G: 'RED',
        H: null
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    'Input Packing Sheet': [
      { ...HEADER_ROW },
      {
        A: ESTABLISHMENT_NUMBER,
        B: null,
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED',
        G: 'GREEN',
        H: 'GB'
      }
    ]
  },
  wrongEstablishment: {
    'Input Packing Sheet': [
      { ...HEADER_ROW },
      {
        A: 'RMS-GB-000138-001',
        B: '0709601000',
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED',
        G: 'GREEN',
        H: 'GB'
      }
    ]
  },
  incorrectHeader: {
    'Input Packing Sheet': [
      {
        ...HEADER_ROW,
        B: 'Incorrect commodity'
      },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0709601000',
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED',
        G: 'GREEN',
        H: 'GB'
      }
    ]
  },
  emptyModel: {
    'Input Packing Sheet': [{ ...HEADER_ROW }, {}]
  },
  nonNirms: {
    'Input Packing Sheet': [
      { ...HEADER_ROW },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0709601000',
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED',
        G: 'RED',
        H: null
      }
    ]
  },
  invalidNirms: {
    'Input Packing Sheet': [
      { ...HEADER_ROW },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0709601000',
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED',
        G: 'INVALID',
        H: 'GB'
      }
    ]
  },
  missingNirms: {
    'Input Packing Sheet': [
      { ...HEADER_ROW },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0709601000',
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED',
        H: 'GB'
      }
    ]
  },
  missingCoO: {
    'Input Packing Sheet': [
      { ...HEADER_ROW },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0709601000',
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED',
        G: 'GREEN',
        H: ''
      }
    ]
  },
  invalidCoO: {
    'Input Packing Sheet': [
      { ...HEADER_ROW },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0709601000',
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED',
        G: 'GREEN',
        H: 'ZZ'
      }
    ]
  },
  xCoO: {
    'Input Packing Sheet': [
      { ...HEADER_ROW },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0709601000',
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED',
        G: 'GREEN',
        H: 'X'
      }
    ]
  },
  ineligibleItems: {
    'Input Packing Sheet': [
      { ...HEADER_ROW },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0123456789',
        C: 'Barton and Redman restricted goods',
        D: 10,
        E: 12.5,
        F: 'INELIGIBLE_ITEM_TREATMENT',
        G: 'GREEN',
        H: 'INELIGIBLE_ITEM_ISO'
      }
    ]
  },
  packingListWithInvalidSheets: {
    References: [{ A: 'reference data' }],
    Lookups: [{ A: 'lookup data' }],
    'Input Packing Sheet': [
      { ...HEADER_ROW },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0709601000',
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED',
        G: 'GREEN',
        H: 'GB'
      },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0707000599',
        C: CUCUMBERS_DESCRIPTION,
        D: 6,
        E: 8,
        F: 'CHILLED',
        G: 'RED',
        H: null
      }
    ]
  },
  packingListWithoutNirmsColumn: {
    'Input Packing Sheet': [
      {
        B: COMMODITY_CODE_HEADER,
        C: DESCRIPTION_OF_GOODS_HEADER,
        D: NUMBER_OF_PACKAGES_HEADER,
        E: ITEM_NET_WEIGHT_HEADER,
        F: TYPE_OF_TREATMENT_HEADER,
        H: COUNTRY_OF_ORIGIN_HEADER
      },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0709601000',
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED',
        H: 'GB'
      }
    ]
  },
  packingListWithoutCooColumn: {
    'Input Packing Sheet': [
      {
        B: COMMODITY_CODE_HEADER,
        C: DESCRIPTION_OF_GOODS_HEADER,
        D: NUMBER_OF_PACKAGES_HEADER,
        E: ITEM_NET_WEIGHT_HEADER,
        F: TYPE_OF_TREATMENT_HEADER,
        G: NIRMS_LANE_HEADER
      },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0709601000',
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED',
        G: 'RED'
      }
    ]
  },
  packingListWithoutNirmsAndCooColumns: {
    'Input Packing Sheet': [
      {
        B: COMMODITY_CODE_HEADER,
        C: DESCRIPTION_OF_GOODS_HEADER,
        D: NUMBER_OF_PACKAGES_HEADER,
        E: ITEM_NET_WEIGHT_HEADER,
        F: TYPE_OF_TREATMENT_HEADER
      },
      {
        A: ESTABLISHMENT_NUMBER,
        B: '0709601000',
        C: RED_PEPPERS_DESCRIPTION,
        D: 10,
        E: 12.5,
        F: 'CHILLED'
      }
    ]
  }
}
