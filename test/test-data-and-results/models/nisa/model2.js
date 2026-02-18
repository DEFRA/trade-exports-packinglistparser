export default {
  validModel: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS'
      },
      {
        C: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        E: 'DAIRYLEA DUNKERS JUMBO PM80P',
        F: '2005995090',
        G: 2,
        I: 2.5,
        J: 'Non-NIRMS'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'NISA BROCCOLI',
        F: '0403209300',
        G: 1,
        I: 2,
        J: 'Non-NIRMS'
      }
    ]
  },

  // ⚠️ NEW CoO Test Data Models - Type 1 Column-Based Conventional NIRMS
  // Preserves existing column structure (A-J) + adds CoO fields at end (K-L)
  validCooModel: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS',
        K: 'COUNTRY OF ORIGIN',
        L: 'TYPE OF TREATMENT'
      },
      {
        C: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        E: 'DAIRYLEA DUNKERS JUMBO PM80P',
        F: '12345678',
        G: 2,
        I: 2.5,
        J: 'Yes',
        K: 'GB',
        L: 'Processed'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'NISA BROCCOLI',
        F: '87654321',
        G: 1,
        I: 2,
        J: 'No',
        K: 'IE',
        L: 'Fresh'
      }
    ]
  },

  // BAC1: NOT within NIRMS Scheme - passes validation
  nonNirmsModel: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS',
        K: 'COUNTRY OF ORIGIN',
        L: 'TYPE OF TREATMENT'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'NISA BROCCOLI',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'No',
        K: 'GB',
        L: 'Processed'
      }
    ]
  },

  // BAC2: Null NIRMS value - validation errors
  nullNirmsModel: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS',
        K: 'COUNTRY OF ORIGIN',
        L: 'TYPE OF TREATMENT'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'NISA BROCCOLI',
        F: '12345678',
        G: 1,
        I: 2,
        K: 'GB',
        L: 'Processed'
      }
    ]
  },

  // BAC3: Invalid NIRMS value - validation errors
  invalidNirmsModel: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS',
        K: 'COUNTRY OF ORIGIN',
        L: 'TYPE OF TREATMENT'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'NISA BROCCOLI',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Invalid',
        K: 'GB',
        L: 'Processed'
      }
    ]
  },

  // BAC4: Null NIRMS value, more than 3 - multiple validation errors
  nullNirmsMultipleModel: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS',
        K: 'COUNTRY OF ORIGIN',
        L: 'TYPE OF TREATMENT'
      },
      {
        C: 'PRODUCT1',
        E: 'NISA PRODUCT 1',
        F: '12345678',
        G: 1,
        I: 2,
        K: 'GB',
        L: 'Processed'
      },
      {
        C: 'PRODUCT2',
        E: 'NISA PRODUCT 2',
        F: '12345678',
        G: 1,
        I: 2,
        K: 'GB',
        L: 'Processed'
      },
      {
        C: 'PRODUCT3',
        E: 'NISA PRODUCT 3',
        F: '12345678',
        G: 1,
        I: 2,
        K: 'GB',
        L: 'Processed'
      },
      {
        C: 'PRODUCT4',
        E: 'NISA PRODUCT 4',
        F: '12345678',
        G: 1,
        I: 2,
        K: 'GB',
        L: 'Processed'
      }
    ]
  },

  // BAC5: Invalid NIRMS value, more than 3 - multiple validation errors
  invalidNirmsMultipleModel: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS',
        K: 'COUNTRY OF ORIGIN',
        L: 'TYPE OF TREATMENT'
      },
      {
        C: 'PRODUCT1',
        E: 'NISA PRODUCT 1',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Invalid',
        K: 'GB',
        L: 'Processed'
      },
      {
        C: 'PRODUCT2',
        E: 'NISA PRODUCT 2',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Invalid',
        K: 'GB',
        L: 'Processed'
      },
      {
        C: 'PRODUCT3',
        E: 'NISA PRODUCT 3',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Invalid',
        K: 'GB',
        L: 'Processed'
      },
      {
        C: 'PRODUCT4',
        E: 'NISA PRODUCT 4',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Invalid',
        K: 'GB',
        L: 'Processed'
      }
    ]
  },

  // BAC6: Null CoO Value - validation errors
  nullCooModel: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS',
        K: 'COUNTRY OF ORIGIN',
        L: 'TYPE OF TREATMENT'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'NISA BROCCOLI',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Yes',
        L: 'Processed'
      }
    ]
  },

  // BAC7: Invalid CoO Value - validation errors
  invalidCooModel: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS',
        K: 'COUNTRY OF ORIGIN',
        L: 'TYPE OF TREATMENT'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'NISA BROCCOLI',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'INVALID',
        L: 'Processed'
      }
    ]
  },

  // BAC8: Null CoO Value, more than 3 - multiple validation errors
  nullCooMultipleModel: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS',
        K: 'COUNTRY OF ORIGIN',
        L: 'TYPE OF TREATMENT'
      },
      {
        C: 'PRODUCT1',
        E: 'NISA PRODUCT 1',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Yes',
        L: 'Processed'
      },
      {
        C: 'PRODUCT2',
        E: 'NISA PRODUCT 2',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Yes',
        L: 'Processed'
      },
      {
        C: 'PRODUCT3',
        E: 'NISA PRODUCT 3',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Yes',
        L: 'Processed'
      },
      {
        C: 'PRODUCT4',
        E: 'NISA PRODUCT 4',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Yes',
        L: 'Processed'
      }
    ]
  },

  // BAC9: Invalid CoO Value, more than 3 - multiple validation errors
  invalidCooMultipleModel: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS',
        K: 'COUNTRY OF ORIGIN',
        L: 'TYPE OF TREATMENT'
      },
      {
        C: 'PRODUCT1',
        E: 'NISA PRODUCT 1',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'INVALID',
        L: 'Processed'
      },
      {
        C: 'PRODUCT2',
        E: 'NISA PRODUCT 2',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'INVALID',
        L: 'Processed'
      },
      {
        C: 'PRODUCT3',
        E: 'NISA PRODUCT 3',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'INVALID',
        L: 'Processed'
      },
      {
        C: 'PRODUCT4',
        E: 'NISA PRODUCT 4',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'INVALID',
        L: 'Processed'
      }
    ]
  },

  // BAC10: CoO Placeholder X - passes validation
  xCooModel: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS',
        K: 'COUNTRY OF ORIGIN',
        L: 'TYPE OF TREATMENT'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'NISA BROCCOLI',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'X',
        L: 'Processed'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'NISA BROCCOLI',
        F: '12345678',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'x',
        L: 'Processed'
      }
    ]
  },

  // BAC11: Ineligible Item with Treatment Type - validation errors
  ineligibleItemsWithTreatment: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS',
        K: 'COUNTRY OF ORIGIN',
        L: 'TYPE OF TREATMENT'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'Ineligible ITEM',
        F: '1234',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'INELIGIBLE_ITEM_ISO',
        L: 'Processed'
      }
    ]
  },

  // BAC12: Ineligible Items, more than 3 (Treatment Type specified) - multiple validation errors
  ineligibleItemsMultipleWithTreatment: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS',
        K: 'COUNTRY OF ORIGIN',
        L: 'TYPE OF TREATMENT'
      },
      {
        C: 'PRODUCT1',
        E: 'Ineligible ITEM 1',
        F: '1234',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'INELIGIBLE_ITEM_ISO',
        L: 'Processed'
      },
      {
        C: 'PRODUCT2',
        E: 'Ineligible ITEM 2',
        F: '1234',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'INELIGIBLE_ITEM_ISO',
        L: 'Processed'
      },
      {
        C: 'PRODUCT3',
        E: 'Ineligible ITEM 3',
        F: '1234',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'INELIGIBLE_ITEM_ISO',
        L: 'Processed'
      },
      {
        C: 'PRODUCT4',
        E: 'Ineligible ITEM 4',
        F: '1234',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'INELIGIBLE_ITEM_ISO',
        L: 'Processed'
      }
    ]
  },

  // BAC13: Ineligible Item without Treatment Type - validation errors
  ineligibleItemsWithoutTreatment: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS',
        K: 'COUNTRY OF ORIGIN',
        L: 'TYPE OF TREATMENT'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'Ineligible ITEM',
        F: '1234',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'INELIGIBLE_ITEM_ISO'
      }
    ]
  },

  // BAC14: Ineligible Items, more than 3 (no Treatment Type specified) - multiple validation errors
  ineligibleItemsMultipleWithoutTreatment: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS',
        K: 'COUNTRY OF ORIGIN',
        L: 'TYPE OF TREATMENT'
      },
      {
        C: 'PRODUCT1',
        E: 'Ineligible ITEM 1',
        F: '1234',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'INELIGIBLE_ITEM_ISO'
      },
      {
        C: 'PRODUCT2',
        E: 'Ineligible ITEM 2',
        F: '1234',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'INELIGIBLE_ITEM_ISO'
      },
      {
        C: 'PRODUCT3',
        E: 'Ineligible ITEM 3',
        F: '1234',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'INELIGIBLE_ITEM_ISO'
      },
      {
        C: 'PRODUCT4',
        E: 'Ineligible ITEM 4',
        F: '1234',
        G: 1,
        I: 2,
        J: 'Yes',
        K: 'INELIGIBLE_ITEM_ISO'
      }
    ]
  },

  // ⚠️ EXISTING MODELS - Preserved unchanged (already updated with NIRMS column J)
  validModelWithTotals: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS'
      },
      {
        C: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        E: 'DAIRYLEA DUNKERS JUMBO PM80P',
        F: '2005995090',
        G: 2,
        I: 2.5,
        J: 'Non-NIRMS'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'NISA BROCCOLI',
        F: '0403209300',
        G: 1,
        I: 2,
        J: 'Non-NIRMS'
      },
      {
        G: 3,
        I: 4.5
      }
    ]
  },
  validHeadersNoData: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS'
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS'
      },
      {
        C: '500 - VEGETABLES - F',
        E: 'GREEN ISLE BATTERED ONION RING',
        F: '2004909880',
        G: 9,
        I: 63,
        J: 'Non-NIRMS'
      }
    ],
    Sheet2: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS'
      },
      {
        C: '515 - F/P POTATOES - F',
        E: 'MCCAIN READY BAKED JACKETS 4PK',
        F: '2004109900',
        G: 28,
        I: 176.4,
        J: 'Non-NIRMS'
      }
    ]
  },
  wrongEstablishment: {
    Sheet1: [
      {},
      {
        A: 'INCORRECT',
        B: 'NIRMS'
      }
    ]
  },
  wrongEstablishmentMultiple: {
    Sheet1: [
      {},
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS'
      }
    ],
    Sheet2: [
      {},
      {
        A: 'INCORRECT'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS'
      }
    ]
  },
  incorrectHeader: {
    sheet1: [
      {
        C: 'NOT',
        F: 'CORRECT',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'HEADER'
      },
      {
        A: 'RMS-GB-000025-003',
        J: 'Non-NIRMS'
      }
    ]
  },
  incorrectHeaderMultiple: {
    sheet1: [
      {
        C: 'PRODUCT TYPE CATEGORY',
        F: 'TARIFF CODE EU',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS'
      },
      {
        A: 'RMS-GB-000025-003',
        J: 'Non-NIRMS'
      }
    ],
    Sheet2: [
      {
        C: 'NOT',
        F: 'CORRECT',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'HEADER'
      },
      {
        A: 'RMS-GB-000025-003',
        J: 'Non-NIRMS'
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS'
      },
      {
        C: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        E: 'DAIRYLEA DUNKERS JUMBO PM80P',
        F: '2005995090',
        G: 2,
        I: null,
        J: 'Non-NIRMS'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'NISA BROCCOLI',
        F: null,
        G: 1,
        I: 2,
        J: 'Non-NIRMS'
      }
    ]
  },
  emptyModel: {
    sheet: [
      {},
      {},
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS'
      }
    ]
  },
  multipleRms: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003',
        B: 'RMS-GB-000025-004'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS'
      },
      {
        C: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        E: 'DAIRYLEA DUNKERS JUMBO PM80P',
        F: '2005995090',
        G: 2,
        I: 2.5,
        J: 'Non-NIRMS'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'NISA BROCCOLI',
        F: '0403209300',
        G: 1,
        I: 2,
        J: 'Non-NIRMS'
      }
    ]
  },
  missingKgunit: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS'
      },
      {
        C: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        E: 'DAIRYLEA DUNKERS JUMBO PM80P',
        F: '2005995090',
        G: 2,
        I: 2.5,
        J: 'Non-NIRMS'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'NISA BROCCOLI',
        F: '0403209300',
        G: 1,
        I: 2,
        J: 'Non-NIRMS'
      }
    ]
  },
  missingMandatoryData: {
    sheet: [
      {
        A: 'RMS_ESTABLISHMENT_NO'
      },
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE',
        I: 'NET WEIGHT TOTAL KG',
        J: 'NIRMS'
      },
      {
        C: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        E: 'DAIRYLEA DUNKERS JUMBO PM80P',
        F: '2005995090',
        G: 2,
        I: 2.5,
        J: 'Non-NIRMS'
      },
      {
        J: 'Non-NIRMS'
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    Sheet1: [
      {
        A: 'RMS-GB-000025-003'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS'
      },
      {
        C: '900 - VEGETABLES PREPACK-C',
        E: 'NISA BROCCOLI',
        F: '0403209300',
        G: 1,
        I: 2,
        J: 'Non-NIRMS'
      }
    ],
    Sheet2: [
      {
        A: 'RMS-GB-000025-003'
      },
      {
        A: 'extra row'
      },
      {
        C: 'PRODUCT TYPE CATEGORY',
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'NET WEIGHT TOTAL',
        J: 'NIRMS'
      },
      {
        C: 'PRODUCT_TYPE_CATEGORY800 - FRUITS - C',
        E: 'NISA APPLES RED',
        F: '0808100000',
        G: 3,
        I: 4.5,
        J: 'Non-NIRMS'
      }
    ]
  }
}
