export default {
  validModel: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'J/L JERKY 70G TERIYAKI',
        D: 16025095,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: 'GB'
      },
      {
        A: 351357,
        B: 10300700,
        C: 'MINI ROLLS 10PK',
        D: 19053199,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 3.27,
        H: 3.63,
        I: 'YES',
        J: 'GB'
      },
      {
        A: ' ',
        B: ' ',
        C: ' ',
        D: ' ',
        E: ' ',
        F: 1,
        G: 3.27,
        H: 3.63
      }
    ]
  },
  validModelInsensitiveHeader: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM Description',
        D: 'COMMODITY Code',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL Number OF CASES',
        G: 'Net WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'J/L JERKY 70G TERIYAKI',
        D: 16025095,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: 'GB'
      },
      {
        A: 351357,
        B: 10300700,
        C: 'MINI ROLLS 10PK',
        D: 19053199,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 3.27,
        H: 3.63,
        I: 'YES',
        J: 'GB'
      },
      {
        A: ' ',
        B: ' ',
        C: ' ',
        D: ' ',
        E: ' ',
        F: 1,
        G: 3.27,
        H: 3.63
      }
    ]
  },
  validHeadersNoData: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'J/L JERKY 70G TERIYAKI',
        D: 16025095,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: 'GB'
      },
      {
        A: ' ',
        B: ' ',
        C: ' ',
        D: ' ',
        E: ' ',
        F: 1,
        G: 3.27,
        H: 3.63
      }
    ],
    sheet2: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 382954,
        B: 11000500,
        C: 'JOHN W 5X132G S/WATER',
        D: 16041428,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 8.1,
        H: 9,
        I: 'YES',
        J: 'GB'
      },
      {
        A: ' ',
        B: ' ',
        C: ' ',
        D: ' ',
        E: ' ',
        F: 1,
        G: 3.27,
        H: 3.63
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'J/L JERKY 70G TERIYAKI',
        D: null,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: null,
        H: 1.28,
        I: 'YES',
        J: 'GB'
      },
      {
        A: 351357,
        B: 10300700,
        C: 'MINI ROLLS 10PK',
        D: 19053199,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 3.27,
        H: 3.63,
        I: 'YES',
        J: 'GB'
      },
      {
        A: ' ',
        B: ' ',
        C: ' ',
        D: ' ',
        E: ' ',
        F: 1,
        G: 3.27,
        H: 3.63
      }
    ]
  },
  wrongEstablishmentMultiple: {
    sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      }
    ],
    sheet2: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'INCORRECT'
      },
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      }
    ]
  },
  incorrectHeader: {
    sheet1: [
      {},
      {},
      { H: 'WAREHOUSE SCHEME NUMBER:', I: 'RMS-GB-000005-001' },
      {},
      {},
      {
        C: 'ITEM DESCRIPTION',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT'
      },
      {
        H: 'J/L JERKY 70G TERIYAKI',
        F: '1',
        G: '1.15'
      }
    ]
  },
  incorrectHeaderMultiple: {
    sheet1: [
      {},
      {},
      { H: 'WAREHOUSE SCHEME NUMBER:', I: 'RMS-GB-000005-001' },
      {},
      {},
      {
        C: 'ITEM DESCRIPTION',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT'
      },
      {
        H: 'J/L JERKY 70G TERIYAKI',
        F: '1',
        G: '1.15'
      }
    ],
    sheet2: [
      {},
      {},
      { H: 'WAREHOUSE SCHEME NUMBER:', I: 'RMS-GB-000005-001' },
      {},
      {},
      {
        C: 'NOT',
        F: 'CORRECT',
        G: 'HEADER'
      },
      {
        C: 'JOHN W 5X132G S/WATER',
        F: 1,
        G: 8.1
      }
    ]
  },
  emptyModel: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: null
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      }
    ]
  },
  multipleRms: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001',
        J: 'RMS-GB-000005-002'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM Description',
        D: 'COMMODITY Code',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL Number OF CASES',
        G: 'Net WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'J/L JERKY 70G TERIYAKI',
        D: 16025095,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: 'GB'
      }
    ]
  },
  missingKgunit: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM Description',
        D: 'COMMODITY Code',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL Number OF CASES',
        G: 'Net WEIGHT',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'J/L JERKY 70G TERIYAKI',
        D: 16025095,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: 'GB'
      }
    ]
  },
  // AC1: Null NIRMS value - Missing blanket statement
  missingNirmsStatement: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'J/L JERKY 70G TERIYAKI',
        D: 16025095,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: 'GB'
      }
    ]
  },
  // AC2: Null CoO Value
  nullCoO: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'J/L JERKY 70G TERIYAKI',
        D: 16025095,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: null
      }
    ]
  },
  // AC3: Invalid CoO Value
  invalidCoO: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'J/L JERKY 70G TERIYAKI',
        D: 16025095,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: 'INVALID'
      }
    ]
  },
  // AC4: Null CoO Value, more than 3
  multipleNullCoO: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'J/L JERKY 70G TERIYAKI',
        D: 16025095,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: null
      },
      {
        A: 412268,
        B: 10145601,
        C: 'SECOND PRODUCT',
        D: 16025096,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 2.15,
        H: 2.28,
        I: 'YES',
        J: null
      },
      {
        A: 412269,
        B: 10145602,
        C: 'THIRD PRODUCT',
        D: 16025097,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 3.15,
        H: 3.28,
        I: 'YES',
        J: null
      },
      {
        A: 412270,
        B: 10145603,
        C: 'FOURTH PRODUCT',
        D: 16025098,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 4.15,
        H: 4.28,
        I: 'YES',
        J: null
      },
      {
        A: 412271,
        B: 10145604,
        C: 'FIFTH PRODUCT',
        D: 16025099,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 5.15,
        H: 5.28,
        I: 'YES',
        J: null
      }
    ]
  },
  // AC5: Invalid CoO Value, more than 3
  multipleInvalidCoO: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'J/L JERKY 70G TERIYAKI',
        D: 16025095,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: 'INVALID1'
      },
      {
        A: 412268,
        B: 10145601,
        C: 'SECOND PRODUCT',
        D: 16025096,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 2.15,
        H: 2.28,
        I: 'YES',
        J: 'INVALID2'
      },
      {
        A: 412269,
        B: 10145602,
        C: 'THIRD PRODUCT',
        D: 16025097,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 3.15,
        H: 3.28,
        I: 'YES',
        J: 'INVALID3'
      },
      {
        A: 412270,
        B: 10145603,
        C: 'FOURTH PRODUCT',
        D: 16025098,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 4.15,
        H: 4.28,
        I: 'YES',
        J: 'INVALID4'
      },
      {
        A: 412271,
        B: 10145604,
        C: 'FIFTH PRODUCT',
        D: 16025099,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 5.15,
        H: 5.28,
        I: 'YES',
        J: 'INVALID5'
      }
    ]
  },
  // AC6: CoO Value is X or x
  xCoO: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'J/L JERKY 70G TERIYAKI',
        D: 16025095,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: 'X'
      },
      {
        A: 351357,
        B: 10300700,
        C: 'MINI ROLLS 10PK',
        D: 19053199,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 3.27,
        H: 3.63,
        I: 'YES',
        J: 'x'
      }
    ]
  },
  // AC7: Item Present on Ineligible Item List (Treatment Type specified)
  ineligibleItemWithTreatment: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'CARROT PRODUCT',
        D: '012',
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: 'INELIGIBLE_ITEM_ISO'
      }
    ]
  },
  // AC8: Item Present on Ineligible Item List, more than 3 (Treatment Type specified)
  multipleineligibleItemsWithTreatment: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'CARROT PRODUCT 1',
        D: '012',
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: 'INELIGIBLE_ITEM_ISO'
      },
      {
        A: 412268,
        B: 10145601,
        C: 'CELERY PRODUCT 2',
        D: '012',
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 2.15,
        H: 2.28,
        I: 'YES',
        J: 'INELIGIBLE_ITEM_ISO'
      },
      {
        A: 412269,
        B: 10145602,
        C: 'HERBS PRODUCT 3',
        D: '012',
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 3.15,
        H: 3.28,
        I: 'YES',
        J: 'INELIGIBLE_ITEM_ISO'
      },
      {
        A: 412270,
        B: 10145603,
        C: 'CARROT PRODUCT 4',
        D: '012',
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 4.15,
        H: 4.28,
        I: 'YES',
        J: 'INELIGIBLE_ITEM_ISO'
      },
      {
        A: 412271,
        B: 10145604,
        C: 'CELERY PRODUCT 5',
        D: '012',
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 5.15,
        H: 5.28,
        I: 'YES',
        J: 'INELIGIBLE_ITEM_ISO'
      }
    ]
  },
  // AC9: Item Present on Ineligible Item List (no Treatment Type specified)
  ineligibleItemNoTreatment: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'CARROT PRODUCT',
        D: '012',
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: 'INELIGIBLE_ITEM_ISO'
      }
    ]
  },
  // AC10: Item Present on Ineligible Item List, more than 3 (no Treatment Type specified)
  multipleineligibleItemsNoTreatment: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods'
      },
      {},
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'CARROT PRODUCT 1',
        D: '012',
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: 'INELIGIBLE_ITEM_ISO'
      },
      {
        A: 412268,
        B: 10145601,
        C: 'CELERY PRODUCT 2',
        D: '012',
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 2.15,
        H: 2.28,
        I: 'YES',
        J: 'INELIGIBLE_ITEM_ISO'
      },
      {
        A: 412269,
        B: 10145602,
        C: 'HERBS PRODUCT 3',
        D: '012',
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 3.15,
        H: 3.28,
        I: 'YES',
        J: 'INELIGIBLE_ITEM_ISO'
      },
      {
        A: 412270,
        B: 10145603,
        C: 'CARROT PRODUCT 4',
        D: '012',
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 4.15,
        H: 4.28,
        I: 'YES',
        J: 'INELIGIBLE_ITEM_ISO'
      },
      {
        A: 412271,
        B: 10145604,
        C: 'CELERY PRODUCT 5',
        D: '012',
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 5.15,
        H: 5.28,
        I: 'YES',
        J: 'INELIGIBLE_ITEM_ISO'
      }
    ]
  },
  // AC11: Null Treatment type value
  nullTreatmentTypeWithNullIdentifier: {
    Sheet1: [
      {},
      {},
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods'
      },
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'J/L JERKY 70G TERIYAKI',
        D: null,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: 'GB'
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    Sheet1: [
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 412267,
        B: 10145600,
        C: 'J/L JERKY 70G TERIYAKI',
        D: 16025095,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 1.15,
        H: 1.28,
        I: 'YES',
        J: 'GB'
      }
    ],
    sheet2: [
      {
        A: 'extra row'
      },
      {
        H: 'WAREHOUSE SCHEME NUMBER:',
        I: 'RMS-GB-000005-001'
      },
      {
        J: 'This consignment contains only NIRMS eligible goods',
        K: 'Treatment type: all products are processed'
      },
      {
        A: 'PRODUCT CODE (SHORT)',
        B: 'PRISM',
        C: 'ITEM DESCRIPTION',
        D: 'COMMODITY CODE',
        E: 'PLACE OF DISPATCH',
        F: 'TOTAL NUMBER OF CASES',
        G: 'NET WEIGHT KG',
        H: 'GROSS WEIGHT',
        I: 'ANIMAL ORIGIN',
        J: 'COUNTRY OF ORIGIN'
      },
      {
        A: 382954,
        B: 11000500,
        C: 'JOHN W 5X132G S/WATER',
        D: 16041428,
        E: 'RMS-GB-000005-001',
        F: 1,
        G: 8.1,
        H: 9,
        I: 'YES',
        J: 'GB'
      }
    ]
  }
}
