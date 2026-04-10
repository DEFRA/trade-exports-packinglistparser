const rmsEstablishmentHeaderRow = {
  A: 'RMS_ESTABLISHMENT_NO'
}

const rmsEstablishmentNumberRow = {
  A: 'RMS-GB-000025-003'
}

const standardHeaderRow = {
  C: 'PRODUCT TYPE CATEGORY',
  E: 'PART NUMBER DESCRIPTION',
  F: 'TARIFF CODE EU',
  G: 'PACKAGES',
  I: 'NET WEIGHT TOTAL KG',
  O: 'NIRMS',
  P: 'NATURE OF PRODUCT'
}

const cooHeaderRow = {
  C: 'PRODUCT TYPE CATEGORY',
  E: 'PART NUMBER DESCRIPTION',
  F: 'TARIFF CODE EU',
  G: 'PACKAGES',
  I: 'NET WEIGHT TOTAL KG',
  M: 'COUNTRY OF ORIGIN',
  O: 'NIRMS',
  P: 'NATURE OF PRODUCT',
  Q: 'TYPE OF TREATMENT'
}

const standardSheetPrefix = [
  rmsEstablishmentHeaderRow,
  rmsEstablishmentNumberRow,
  standardHeaderRow
]

const cooSheetPrefix = [
  rmsEstablishmentHeaderRow,
  rmsEstablishmentNumberRow,
  cooHeaderRow
]

const totalsItemRow = (numberOfPackages, totalNetWeightKg) => {
  return {
    G: numberOfPackages,
    I: totalNetWeightKg
  }
}

const footerTableRows = [
  {},
  {
    A: 'Measure',
    B: 'Total'
  },
  {
    A: 'TOTAL NIRMS QTY',
    B: 100
  },
  {
    A: 'TOTAL NIRMS NET WEIGHT',
    B: 200
  },
  {
    A: 'TOTAL NIRMS GROSS WEIGHT',
    B: 300
  }
]

const totalsAndFooterRows = (numberOfPackages, totalNetWeightKg) => {
  return [totalsItemRow(numberOfPackages, totalNetWeightKg), ...footerTableRows]
}

export default {
  validModel: {
    sheet: [
      ...standardSheetPrefix,
      {
        E: 'DAIRYLEA DUNKERS JUMBO PM80P',
        F: '2005995090',
        G: 2,
        I: 2.5,
        P: 'Frozen',
        O: 'Non-NIRMS'
      },
      {
        E: 'NISA BROCCOLI',
        F: '0403209300',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Non-NIRMS'
      },
      ...totalsAndFooterRows(3, 4.5)
    ]
  },

  // ⚠️ NEW CoO Test Data Models - Type 1 Column-Based Conventional NIRMS
  // Preserves existing column structure (A-J) + adds CoO fields at end (K-L)
  validCooModel: {
    sheet: [
      ...cooSheetPrefix,
      {
        E: 'DAIRYLEA DUNKERS JUMBO PM80P',
        F: '12345678',
        G: 2,
        I: 2.5,
        P: 'Frozen',
        O: 'Yes',
        M: 'GB',
        Q: 'Processed'
      },
      {
        E: 'NISA BROCCOLI',
        F: '87654321',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'No',
        M: 'IE',
        Q: 'Fresh'
      },
      ...totalsAndFooterRows(3, 4.5)
    ]
  },

  // BAC1: NOT within NIRMS Scheme - passes validation
  nonNirmsModel: {
    sheet: [
      ...cooSheetPrefix,
      {
        E: 'NISA BROCCOLI',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'No',
        M: 'GB',
        Q: 'Processed'
      },
      ...totalsAndFooterRows(1, 2)
    ]
  },

  // BAC2: Null NIRMS value - validation errors
  nullNirmsModel: {
    sheet: [
      ...cooSheetPrefix,
      {
        E: 'NISA BROCCOLI',
        F: '12345678',
        G: 1,
        I: 2,
        M: 'GB',
        Q: 'Processed'
      },
      ...totalsAndFooterRows(1, 2)
    ]
  },

  // BAC3: Invalid NIRMS value - validation errors
  invalidNirmsModel: {
    sheet: [
      ...cooSheetPrefix,
      {
        E: 'NISA BROCCOLI',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Invalid',
        M: 'GB',
        Q: 'Processed'
      },
      ...totalsAndFooterRows(1, 2)
    ]
  },

  // BAC4: Null NIRMS value, more than 3 - multiple validation errors
  nullNirmsMultipleModel: {
    sheet: [
      ...cooSheetPrefix,
      {
        E: 'NISA PRODUCT 1',
        F: '12345678',
        G: 1,
        I: 2,
        M: 'GB',
        Q: 'Processed'
      },
      {
        E: 'NISA PRODUCT 2',
        F: '12345678',
        G: 1,
        I: 2,
        M: 'GB',
        Q: 'Processed'
      },
      {
        E: 'NISA PRODUCT 3',
        F: '12345678',
        G: 1,
        I: 2,
        M: 'GB',
        Q: 'Processed'
      },
      {
        E: 'NISA PRODUCT 4',
        F: '12345678',
        G: 1,
        I: 2,
        M: 'GB',
        Q: 'Processed'
      },
      ...totalsAndFooterRows(4, 8)
    ]
  },

  // BAC5: Invalid NIRMS value, more than 3 - multiple validation errors
  invalidNirmsMultipleModel: {
    sheet: [
      ...cooSheetPrefix,
      {
        E: 'NISA PRODUCT 1',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Invalid',
        M: 'GB',
        Q: 'Processed'
      },
      {
        E: 'NISA PRODUCT 2',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Invalid',
        M: 'GB',
        Q: 'Processed'
      },
      {
        E: 'NISA PRODUCT 3',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Invalid',
        M: 'GB',
        Q: 'Processed'
      },
      {
        E: 'NISA PRODUCT 4',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Invalid',
        M: 'GB',
        Q: 'Processed'
      },
      ...totalsAndFooterRows(4, 8)
    ]
  },

  // BAC6: Null CoO Value - validation errors
  nullCooModel: {
    sheet: [
      ...cooSheetPrefix,
      {
        E: 'NISA BROCCOLI',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        Q: 'Processed'
      },
      ...totalsAndFooterRows(1, 2)
    ]
  },

  // BAC7: Invalid CoO Value - validation errors
  invalidCooModel: {
    sheet: [
      ...cooSheetPrefix,
      {
        E: 'NISA BROCCOLI',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'INVALID',
        Q: 'Processed'
      },
      ...totalsAndFooterRows(1, 2)
    ]
  },

  // BAC8: Null CoO Value, more than 3 - multiple validation errors
  nullCooMultipleModel: {
    sheet: [
      ...cooSheetPrefix,
      {
        E: 'NISA PRODUCT 1',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        Q: 'Processed'
      },
      {
        E: 'NISA PRODUCT 2',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        Q: 'Processed'
      },
      {
        E: 'NISA PRODUCT 3',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        Q: 'Processed'
      },
      {
        E: 'NISA PRODUCT 4',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        Q: 'Processed'
      },
      ...totalsAndFooterRows(4, 8)
    ]
  },

  // BAC9: Invalid CoO Value, more than 3 - multiple validation errors
  invalidCooMultipleModel: {
    sheet: [
      ...cooSheetPrefix,
      {
        E: 'NISA PRODUCT 1',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'INVALID',
        Q: 'Processed'
      },
      {
        E: 'NISA PRODUCT 2',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'INVALID',
        Q: 'Processed'
      },
      {
        E: 'NISA PRODUCT 3',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'INVALID',
        Q: 'Processed'
      },
      {
        E: 'NISA PRODUCT 4',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'INVALID',
        Q: 'Processed'
      },
      ...totalsAndFooterRows(4, 8)
    ]
  },

  // BAC10: CoO Placeholder X - passes validation
  xCooModel: {
    sheet: [
      ...cooSheetPrefix,
      {
        E: 'NISA BROCCOLI',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'X',
        Q: 'Processed'
      },
      {
        E: 'NISA BROCCOLI',
        F: '12345678',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'x',
        Q: 'Processed'
      },
      ...totalsAndFooterRows(2, 4)
    ]
  },

  // BAC11: Ineligible Item with Treatment Type - validation errors
  ineligibleItemsWithTreatment: {
    sheet: [
      ...cooSheetPrefix,
      {
        E: 'Ineligible ITEM',
        F: '1234',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'INELIGIBLE_ITEM_ISO',
        Q: 'Processed'
      },
      ...totalsAndFooterRows(1, 2)
    ]
  },

  // BAC12: Ineligible Items, more than 3 (Treatment Type specified) - multiple validation errors
  ineligibleItemsMultipleWithTreatment: {
    sheet: [
      ...cooSheetPrefix,
      {
        E: 'Ineligible ITEM 1',
        F: '1234',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'INELIGIBLE_ITEM_ISO',
        Q: 'Processed'
      },
      {
        E: 'Ineligible ITEM 2',
        F: '1234',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'INELIGIBLE_ITEM_ISO',
        Q: 'Processed'
      },
      {
        E: 'Ineligible ITEM 3',
        F: '1234',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'INELIGIBLE_ITEM_ISO',
        Q: 'Processed'
      },
      {
        E: 'Ineligible ITEM 4',
        F: '1234',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'INELIGIBLE_ITEM_ISO',
        Q: 'Processed'
      },
      ...totalsAndFooterRows(4, 8)
    ]
  },

  // BAC13: Ineligible Item without Treatment Type - validation errors
  ineligibleItemsWithoutTreatment: {
    sheet: [
      ...cooSheetPrefix,
      {
        E: 'Ineligible ITEM',
        F: '1234',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'INELIGIBLE_ITEM_ISO'
      },
      ...totalsAndFooterRows(1, 2)
    ]
  },

  // BAC14: Ineligible Items, more than 3 (no Treatment Type specified) - multiple validation errors
  ineligibleItemsMultipleWithoutTreatment: {
    sheet: [
      ...cooSheetPrefix,
      {
        E: 'Ineligible ITEM 1',
        F: '1234',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'INELIGIBLE_ITEM_ISO'
      },
      {
        E: 'Ineligible ITEM 2',
        F: '1234',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'INELIGIBLE_ITEM_ISO'
      },
      {
        E: 'Ineligible ITEM 3',
        F: '1234',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'INELIGIBLE_ITEM_ISO'
      },
      {
        E: 'Ineligible ITEM 4',
        F: '1234',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Yes',
        M: 'INELIGIBLE_ITEM_ISO'
      },
      ...totalsAndFooterRows(4, 8)
    ]
  },

  // ⚠️ EXISTING MODELS - Preserved unchanged (already updated with NIRMS column J)
  validModelWithTotals: {
    sheet: [
      ...standardSheetPrefix,
      {
        E: 'DAIRYLEA DUNKERS JUMBO PM80P',
        F: '2005995090',
        G: 2,
        I: 2.5,
        P: 'Frozen',
        O: 'Non-NIRMS'
      },
      {
        E: 'NISA BROCCOLI',
        F: '0403209300',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Non-NIRMS'
      },
      ...totalsAndFooterRows(3, 4.5)
    ]
  },
  validHeadersNoData: {
    sheet: [...standardSheetPrefix]
  },
  validModelMultipleSheets: {
    Sheet1: [
      ...standardSheetPrefix,
      {
        E: 'GREEN ISLE BATTERED ONION RING',
        F: '2004909880',
        G: 9,
        I: 63,
        P: 'Frozen',
        O: 'Non-NIRMS'
      },
      ...totalsAndFooterRows(9, 63)
    ],
    Sheet2: [
      ...standardSheetPrefix,
      {
        E: 'MCCAIN READY BAKED JACKETS 4PK',
        F: '2004109900',
        G: 28,
        I: 176.4,
        P: 'Frozen',
        O: 'Non-NIRMS'
      },
      ...totalsAndFooterRows(28, 176.4)
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
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        I: 'NET WEIGHT TOTAL KG',
        P: 'NATURE OF PRODUCT',
        O: 'NIRMS'
      }
    ],
    Sheet2: [
      {},
      {
        A: 'INCORRECT'
      },
      {
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        I: 'NET WEIGHT TOTAL KG',
        P: 'NATURE OF PRODUCT',
        O: 'NIRMS'
      }
    ]
  },
  incorrectHeader: {
    sheet1: [
      {
        F: 'CORRECT',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'HEADER'
      },
      {
        A: 'RMS-GB-000025-003',
        P: 'Frozen',
        O: 'Non-NIRMS'
      }
    ]
  },
  incorrectHeaderMultiple: {
    sheet1: [
      {
        F: 'TARIFF CODE EU',
        I: 'NET WEIGHT TOTAL KG',
        P: 'NATURE OF PRODUCT',
        O: 'NIRMS'
      },
      {
        A: 'RMS-GB-000025-003',
        P: 'Frozen',
        O: 'Non-NIRMS'
      }
    ],
    Sheet2: [
      {
        F: 'CORRECT',
        H: 'NET WEIGHT PACKAGE KG',
        I: 'HEADER'
      },
      {
        A: 'RMS-GB-000025-003',
        P: 'Frozen',
        O: 'Non-NIRMS'
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    sheet: [
      ...standardSheetPrefix,
      {
        E: 'DAIRYLEA DUNKERS JUMBO PM80P',
        F: '2005995090',
        G: 2,
        I: null,
        P: 'Frozen',
        O: 'Non-NIRMS'
      },
      {
        E: 'NISA BROCCOLI',
        F: null,
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Non-NIRMS'
      }
    ]
  },
  emptyModel: {
    sheet: [
      {},
      {},
      {
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        I: 'NET WEIGHT TOTAL KG',
        P: 'NATURE OF PRODUCT',
        O: 'NIRMS'
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
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        I: 'NET WEIGHT TOTAL KG',
        P: 'NATURE OF PRODUCT',
        O: 'NIRMS'
      },
      {
        E: 'DAIRYLEA DUNKERS JUMBO PM80P',
        F: '2005995090',
        G: 2,
        I: 2.5,
        P: 'Frozen',
        O: 'Non-NIRMS'
      },
      {
        E: 'NISA BROCCOLI',
        F: '0403209300',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Non-NIRMS'
      },
      ...totalsAndFooterRows(3, 4.5)
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
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        I: 'NET WEIGHT TOTAL',
        P: 'NATURE OF PRODUCT',
        O: 'NIRMS'
      },
      {
        E: 'DAIRYLEA DUNKERS JUMBO PM80P',
        F: '2005995090',
        G: 2,
        I: 2.5,
        P: 'Frozen',
        O: 'Non-NIRMS'
      },
      {
        E: 'NISA BROCCOLI',
        F: '0403209300',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Non-NIRMS'
      },
      ...totalsAndFooterRows(3, 4.5)
    ]
  },
  missingMandatoryData: {
    sheet: [
      ...standardSheetPrefix,
      {
        E: 'DAIRYLEA DUNKERS JUMBO PM80P',
        F: '2005995090',
        G: 2,
        I: 2.5,
        O: 'Non-NIRMS',
        P: 'Frozen'
      },
      {
        O: 'Non-NIRMS'
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    Sheet1: [
      {
        A: 'RMS-GB-000025-003'
      },
      {
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        I: 'NET WEIGHT TOTAL KG',
        P: 'NATURE OF PRODUCT',
        O: 'NIRMS'
      },
      {
        E: 'NISA BROCCOLI',
        F: '0403209300',
        G: 1,
        I: 2,
        P: 'Frozen',
        O: 'Non-NIRMS'
      },
      ...totalsAndFooterRows(1, 2)
    ],
    Sheet2: [
      {
        A: 'RMS-GB-000025-003'
      },
      {
        A: 'extra row'
      },
      {
        E: 'PART NUMBER DESCRIPTION',
        F: 'TARIFF CODE EU',
        G: 'PACKAGES',
        I: 'NET WEIGHT TOTAL KG',
        P: 'NATURE OF PRODUCT',
        O: 'NIRMS'
      },
      {
        E: 'NISA APPLES RED',
        F: '0808100000',
        G: 3,
        I: 4.5,
        P: 'Frozen',
        O: 'Non-NIRMS'
      },
      ...totalsAndFooterRows(3, 4.5)
    ]
  }
}
