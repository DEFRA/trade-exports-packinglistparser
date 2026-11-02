const RMS_001 = 'RMS-GB-000133-001'
const COMMODITY_CODE_HEADER = 'commodity Code'
const DESCRIPTION_HEADER = 'Description'
const COUNTRY_OF_ORIGIN_HEADER = 'Country of origin'
const QUANTITY_HEADER = 'Quantity'
const NETWEIGHT_HEADER = 'Netweight (KG)'
const TYPE_OF_PROCESSING_HEADER = 'Type of processing'
const NATURE_OF_PRODUCT_HEADER = 'Nature of Product / Transport Method'
const TYPE_OF_TREATMENT_HEADER = 'Type of Treatment'
const NIRMS_ONLY_HEADER = 'NIRMS ONLY'
const CHILLED_ROAD_VALUE = 'CHILLED - ROAD'
const DECLARATION_NIRMS_GOODS =
  'Declaration: This consignment contains only NIRMS goods'
const FORTIFIED_SHAKE = 'NUTRICIA FORTIFIED SHAKE'
const PROTEIN_DRINK = 'NUTRICIA PROTEIN DRINK'
const HEAT_TREATED = 'Heat Treated'
const PASTEURISED = 'Pasteurised'

export default {
  validModel: {
    Sheet1: [
      { A: RMS_001 },
      {
        A: NATURE_OF_PRODUCT_HEADER,
        B: TYPE_OF_TREATMENT_HEADER,
        C: NIRMS_ONLY_HEADER
      },
      {
        A: CHILLED_ROAD_VALUE,
        B: 'Processed',
        C: 'Yes'
      },
      {
        A: COMMODITY_CODE_HEADER,
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER
      },
      {
        A: '21069098',
        B: FORTIFIED_SHAKE,
        C: 'GB',
        D: 12,
        E: 120.5,
        F: 'Processed'
      },
      {
        A: '21069099',
        B: PROTEIN_DRINK,
        C: 'FR',
        D: 6,
        E: 60,
        F: 'Processed'
      },
      {
        A: DECLARATION_NIRMS_GOODS
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      { A: RMS_001 },
      {
        A: NATURE_OF_PRODUCT_HEADER,
        B: TYPE_OF_TREATMENT_HEADER,
        C: NIRMS_ONLY_HEADER
      },
      {
        A: CHILLED_ROAD_VALUE,
        B: 'Processed',
        C: 'Yes'
      },
      {
        A: COMMODITY_CODE_HEADER,
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER
      },
      {
        A: '21069098',
        B: FORTIFIED_SHAKE,
        C: 'GB',
        D: 12,
        E: 120.5,
        F: 'Processed'
      },
      {
        A: DECLARATION_NIRMS_GOODS
      }
    ],
    Sheet2: [
      { A: RMS_001 },
      {
        A: NATURE_OF_PRODUCT_HEADER,
        B: TYPE_OF_TREATMENT_HEADER,
        C: NIRMS_ONLY_HEADER
      },
      {
        A: CHILLED_ROAD_VALUE,
        B: 'Processed',
        C: 'Yes'
      },
      {
        A: COMMODITY_CODE_HEADER,
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER
      },
      {
        A: '21069099',
        B: PROTEIN_DRINK,
        C: 'FR',
        D: 6,
        E: 60,
        F: 'Processed'
      },
      {
        A: DECLARATION_NIRMS_GOODS
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    Sheet1: [
      { A: RMS_001 },
      { A: 'Intro row above header' },
      {
        A: NATURE_OF_PRODUCT_HEADER,
        B: TYPE_OF_TREATMENT_HEADER,
        C: NIRMS_ONLY_HEADER
      },
      {
        A: CHILLED_ROAD_VALUE,
        B: 'Processed',
        C: 'Yes'
      },
      {
        A: COMMODITY_CODE_HEADER,
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER
      },
      {
        A: '21069098',
        B: FORTIFIED_SHAKE,
        C: 'GB',
        D: 12,
        E: 120.5,
        F: 'Processed'
      },
      {
        A: DECLARATION_NIRMS_GOODS
      }
    ],
    Sheet2: [
      { A: RMS_001 },
      { A: 'Another intro row above header' },
      {
        A: NATURE_OF_PRODUCT_HEADER,
        B: TYPE_OF_TREATMENT_HEADER,
        C: NIRMS_ONLY_HEADER
      },
      {
        A: CHILLED_ROAD_VALUE,
        B: 'Processed',
        C: 'Yes'
      },
      {
        A: COMMODITY_CODE_HEADER,
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER
      },
      {
        A: '21069099',
        B: PROTEIN_DRINK,
        C: 'FR',
        D: 6,
        E: 60,
        F: 'Processed'
      },
      {
        A: DECLARATION_NIRMS_GOODS
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    Sheet1: [
      { A: RMS_001 },
      {
        A: COMMODITY_CODE_HEADER,
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER,
        G: 'Method'
      },
      {
        A: '21069098',
        B: FORTIFIED_SHAKE,
        C: 'GB',
        D: null,
        E: 120.5,
        F: 'Processed',
        G: HEAT_TREATED
      },
      {
        A: DECLARATION_NIRMS_GOODS
      }
    ]
  },
  wrongEstablishment: {
    Sheet1: [
      { A: 'INVALID' },
      {
        A: COMMODITY_CODE_HEADER,
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER,
        G: 'Method'
      },
      {
        A: '21069098',
        B: FORTIFIED_SHAKE,
        C: 'GB',
        D: 12,
        E: 120.5,
        F: 'Processed',
        G: HEAT_TREATED
      }
    ]
  },
  wrongEstablishmentMultiple: {
    Sheet1: [
      { A: RMS_001 },
      {
        A: COMMODITY_CODE_HEADER,
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER,
        G: 'Method'
      },
      {
        A: '21069098',
        B: FORTIFIED_SHAKE,
        C: 'GB',
        D: 12,
        E: 120.5,
        F: 'Processed',
        G: HEAT_TREATED
      }
    ],
    Sheet2: [
      { A: 'INVALID' },
      {
        A: COMMODITY_CODE_HEADER,
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER,
        G: 'Method'
      },
      {
        A: '21069099',
        B: PROTEIN_DRINK,
        C: 'FR',
        D: 6,
        E: 60,
        F: 'Processed',
        G: PASTEURISED
      }
    ]
  },
  incorrectHeader: {
    Sheet1: [
      { A: RMS_001 },
      {
        A: 'wrong header',
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER,
        G: 'Method'
      },
      {
        A: '21069098',
        B: FORTIFIED_SHAKE,
        C: 'GB',
        D: 12,
        E: 120.5,
        F: 'Processed',
        G: HEAT_TREATED
      }
    ]
  },
  incorrectHeaderMultiple: {
    Sheet1: [
      { A: RMS_001 },
      {
        A: COMMODITY_CODE_HEADER,
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER,
        G: 'Method'
      },
      {
        A: '21069098',
        B: FORTIFIED_SHAKE,
        C: 'GB',
        D: 12,
        E: 120.5,
        F: 'Processed',
        G: HEAT_TREATED
      }
    ],
    Sheet2: [
      { A: RMS_001 },
      {
        A: 'wrong header',
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER,
        G: 'Method'
      },
      {
        A: '21069099',
        B: PROTEIN_DRINK,
        C: 'FR',
        D: 6,
        E: 60,
        F: 'Processed',
        G: PASTEURISED
      }
    ]
  },
  emptyModel: {
    Sheet1: [
      { A: RMS_001 },
      {
        A: COMMODITY_CODE_HEADER,
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER,
        G: 'Method'
      },
      {},
      {
        A: DECLARATION_NIRMS_GOODS
      }
    ]
  },
  multipleRms: {
    Sheet1: [
      { A: RMS_001, B: 'RMS-GB-000133-002' },
      {
        A: NATURE_OF_PRODUCT_HEADER,
        B: TYPE_OF_TREATMENT_HEADER,
        C: NIRMS_ONLY_HEADER
      },
      {
        A: CHILLED_ROAD_VALUE,
        B: 'Processed',
        C: 'Yes'
      },
      {
        A: COMMODITY_CODE_HEADER,
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER
      },
      {
        A: '21069098',
        B: FORTIFIED_SHAKE,
        C: 'GB',
        D: 12,
        E: 120.5,
        F: 'Processed'
      },
      {
        A: DECLARATION_NIRMS_GOODS
      }
    ]
  },
  missingNirms: {
    Sheet1: [
      { A: RMS_001 },
      {
        A: COMMODITY_CODE_HEADER,
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER,
        G: 'Method'
      },
      {
        A: '21069098',
        B: FORTIFIED_SHAKE,
        C: 'GB',
        D: 12,
        E: 120.5,
        F: 'Processed',
        G: HEAT_TREATED
      },
      {
        A: 'Declaration: status not provided'
      }
    ]
  },
  invalidCooMultiple: {
    Sheet1: [
      { A: RMS_001 },
      {
        A: NATURE_OF_PRODUCT_HEADER,
        B: TYPE_OF_TREATMENT_HEADER,
        C: NIRMS_ONLY_HEADER
      },
      {
        A: CHILLED_ROAD_VALUE,
        B: 'Processed',
        C: 'Yes'
      },
      {
        A: COMMODITY_CODE_HEADER,
        B: DESCRIPTION_HEADER,
        C: COUNTRY_OF_ORIGIN_HEADER,
        D: QUANTITY_HEADER,
        E: NETWEIGHT_HEADER,
        F: TYPE_OF_PROCESSING_HEADER,
        G: 'Method'
      },
      {
        A: '21069098',
        B: FORTIFIED_SHAKE,
        C: 'INVALID1',
        D: 12,
        E: 120.5,
        F: 'Processed',
        G: HEAT_TREATED
      },
      {
        A: '21069099',
        B: PROTEIN_DRINK,
        C: 'INVALID2',
        D: 6,
        E: 60,
        F: 'Processed',
        G: PASTEURISED
      },
      {
        A: '21069100',
        B: 'NUTRICIA ENERGY SHAKE',
        C: 'INVALID3',
        D: 8,
        E: 80,
        F: 'Processed',
        G: HEAT_TREATED
      },
      {
        A: '21069101',
        B: 'NUTRICIA HIGH CAL SHAKE',
        C: 'INVALID4',
        D: 4,
        E: 40,
        F: 'Processed',
        G: HEAT_TREATED
      },
      {
        A: DECLARATION_NIRMS_GOODS
      }
    ]
  }
}
