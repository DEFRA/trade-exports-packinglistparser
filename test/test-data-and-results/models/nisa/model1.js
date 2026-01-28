// Note: invalidNirms reference removed - was imported from tescos/model3 in legacy

export default {
  validModel: {
    'Customer Order': [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        U: 'NIRMS'
      },
      {
        A: 'RMS-GB-000025-001',
        I: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        K: 'DAIRYLEA DUNKERS JUMBO PM80P',
        L: '2005995090',
        M: 2,
        O: 2.5,
        U: 'N'
      },
      {
        A: 'RMS-GB-000025-001',
        I: '900 - VEGETABLES PREPACK-C',
        K: 'NISA BROCCOLI',
        L: '0403209300',
        M: 1,
        O: 2,
        U: 'N'
      }
    ]
  },
  validModelWithFooter: {
    'Customer Order': [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        U: 'NIRMS'
      },
      {
        A: 'RMS-GB-000025-001',
        I: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        K: 'DAIRYLEA DUNKERS JUMBO PM80P',
        L: '2005995090',
        M: 2,
        O: 2.5,
        U: 'N'
      },
      {
        A: 'RMS-GB-000025-001',
        I: '900 - VEGETABLES PREPACK-C',
        K: 'NISA BROCCOLI',
        L: '0403209300',
        M: 1,
        O: 2,
        U: 'N'
      },
      {
        M: 3,
        O: 4.5
      }
    ]
  },
  validHeadersNoData: {
    'Customer Order': [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        U: 'NIRMS'
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        U: 'NIRMS'
      },
      {
        A: 'RMS-GB-000025-001',
        I: '790 - PASTRY - C',
        K: 'CO OP BRITISH CHICKEN POPPERS',
        L: '1602321990',
        M: 4,
        O: 2.4,
        U: 'N'
      }
    ],
    Sheet2: [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        U: 'NIRMS'
      },
      {
        A: 'RMS-GB-000025-001',
        I: '710 - SANDWICHES - C',
        K: 'CO OP TUNA MAYONNAISE SANDWICH',
        L: '1604207055',
        M: 4,
        O: 3.2,
        U: 'N'
      }
    ]
  },
  wrongEstablishmentMultiple: {
    sheet1: [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        U: 'NIRMS'
      },
      {
        A: 'RMS-GB-000025-001'
      }
    ],
    Sheet2: [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        U: 'NIRMS'
      },
      {
        A: 'INCORRECT'
      }
    ]
  },
  incorrectHeaderMultiple: {
    sheet1: [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        B: 'DISPATCH_ADDRESS',
        C: 'DELIVERY_ADDRESS',
        P: 'NET_WEIGHT_PACKAGE_KG',
        U: 'NIRMS'
      },
      {
        A: 'RMS-GB-000025-009'
      }
    ],
    Sheet2: [
      {
        A: 'NOT',
        B: 'CORRECT',
        C: 'HEADER',
        P: 'NET_WEIGHT_PACKAGE_KG'
      },
      {
        A: 'RMS-GB-000025-009'
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    'Customer Order': [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        U: 'NIRMS'
      },
      {
        A: 'RMS-GB-000025-001',
        I: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        K: 'DAIRYLEA DUNKERS JUMBO PM80P',
        L: '2005995090',
        M: null,
        O: 2.5,
        U: 'N'
      },
      {
        A: 'RMS-GB-000025-001',
        I: '900 - VEGETABLES PREPACK-C',
        K: 'NISA BROCCOLI',
        L: '0403209300',
        M: 1,
        O: null,
        U: 'N'
      }
    ]
  },
  emptyModel: {
    'Customer Order': [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE',
        U: 'NIRMS'
      },
      {
        A: 'RMS-GB-000025-001'
      }
    ]
  },
  multipleRms: {
    'Customer Order': [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        U: 'NIRMS'
      },
      {
        A: 'RMS-GB-000025-001',
        I: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        K: 'DAIRYLEA DUNKERS JUMBO PM80P',
        L: '2005995090',
        M: 2,
        O: 2.5,
        U: 'N'
      },
      {
        A: 'RMS-GB-000025-002',
        I: '900 - VEGETABLES PREPACK-C',
        K: 'NISA BROCCOLI',
        L: '0403209300',
        M: 1,
        O: 2,
        U: 'N'
      }
    ]
  },
  missingKgunit: {
    'Customer Order': [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE',
        U: 'NIRMS'
      },
      {
        A: 'RMS-GB-000025-001',
        I: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        K: 'DAIRYLEA DUNKERS JUMBO PM80P',
        L: '2005995090',
        M: 2,
        O: 2.5,
        U: 'N'
      },
      {
        A: 'RMS-GB-000025-001',
        I: '900 - VEGETABLES PREPACK-C',
        K: 'NISA BROCCOLI',
        L: '0403209300',
        M: 1,
        O: 2,
        U: 'N'
      }
    ]
  },
  nonNirms: {
    'Customer Order': [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        S: 'COUNTRY_OF_ORIGIN',
        U: 'NIRMS',
        W: 'TYPE_OF_TREATMENT'
      },
      {
        A: 'RMS-GB-000025-001',
        I: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        K: 'DAIRYLEA DUNKERS JUMBO PM80P',
        L: '2005995090',
        M: 2,
        O: 2.5,
        S: 'GB',
        U: 'N',
        W: 'Processed'
      }
    ]
  },
  invalidNirms: {
    'Customer Order': [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        S: 'COUNTRY_OF_ORIGIN',
        U: 'NIRMS',
        W: 'TYPE_OF_TREATMENT'
      },
      {
        A: 'RMS-GB-000025-001',
        I: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        K: 'DAIRYLEA DUNKERS JUMBO PM80P',
        L: '2005995090',
        M: 2,
        O: 2.5,
        S: 'GB',
        U: 'invalid',
        W: 'Processed'
      }
    ]
  },
  missingNirms: {
    'Customer Order': [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        S: 'COUNTRY_OF_ORIGIN',
        U: 'NIRMS',
        W: 'TYPE_OF_TREATMENT'
      },
      {
        A: 'RMS-GB-000025-001',
        I: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        K: 'DAIRYLEA DUNKERS JUMBO PM80P',
        L: '2005995090',
        M: 2,
        S: 'GB',
        O: 2.5,
        W: 'Processed'
      }
    ]
  },
  missingCoO: {
    'Customer Order': [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        S: 'COUNTRY_OF_ORIGIN',
        U: 'NIRMS',
        W: 'TYPE_OF_TREATMENT'
      },
      {
        A: 'RMS-GB-000025-001',
        I: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        K: 'DAIRYLEA DUNKERS JUMBO PM80P',
        L: '2005995090',
        M: 2,
        O: 2.5,
        S: '',
        U: 'Y',
        W: 'Processed'
      },
      {
        A: 'RMS-GB-000025-001',
        I: '900 - VEGETABLES PREPACK-C',
        K: 'NISA BROCCOLI',
        L: '0403209300',
        M: 1,
        O: 2,
        U: 'Yes',
        W: 'Processed'
      }
    ]
  },
  invalidCoO: {
    'Customer Order': [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        S: 'COUNTRY_OF_ORIGIN',
        U: 'NIRMS',
        W: 'TYPE_OF_TREATMENT'
      },
      {
        A: 'RMS-GB-000025-001',
        I: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        K: 'DAIRYLEA DUNKERS JUMBO PM80P',
        L: '2005995090',
        M: 2,
        O: 2.5,
        S: 'INVALID',
        U: 'Y',
        W: 'Processed'
      },
      {
        A: 'RMS-GB-000025-001',
        I: '900 - VEGETABLES PREPACK-C',
        K: 'NISA BROCCOLI',
        L: '0403209300',
        M: 1,
        O: 2,
        S: 'INVALID',
        U: 'Yes',
        W: 'Processed'
      }
    ]
  },
  xCoO: {
    'Customer Order': [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        S: 'COUNTRY_OF_ORIGIN',
        U: 'NIRMS',
        W: 'TYPE_OF_TREATMENT'
      },
      {
        A: 'RMS-GB-000025-001',
        I: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        K: 'DAIRYLEA DUNKERS JUMBO PM80P',
        L: '2005995090',
        M: 2,
        O: 2.5,
        S: 'X',
        U: 'Y',
        W: 'Processed'
      },
      {
        A: 'RMS-GB-000025-001',
        I: '900 - VEGETABLES PREPACK-C',
        K: 'NISA BROCCOLI',
        L: '0403209300',
        M: 1,
        O: 2,
        S: 'x',
        U: 'Yes',
        W: 'Processed'
      }
    ]
  },
  ineligibleItems: {
    'Customer Order': [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        S: 'COUNTRY_OF_ORIGIN',
        U: 'NIRMS',
        W: 'TYPE_OF_TREATMENT'
      },
      {
        A: 'RMS-GB-000025-001',
        I: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        K: 'Mocked Ineligible Item Product',
        L: '012',
        M: 2,
        O: 2.5,
        S: 'INELIGIBLE_ITEM_ISO',
        U: 'yes',
        W: 'INELIGIBLE_ITEM_TREATMENT'
      },
      {
        A: 'RMS-GB-000025-001',
        I: '900 - VEGETABLES PREPACK-C',
        K: 'NISA BROCCOLI',
        L: '0403209300',
        M: 1,
        O: 2,
        S: 'INELIGIBLE_ITEM_ISO',
        U: 'Yes',
        W: 'NOT_INELIGIBLE_ITEM_TREATMENT'
      },
      {
        A: 'RMS-GB-000025-001',
        I: 'PRODUCT_TYPE_CATEGORY675 - CHEESE - C',
        K: 'Mocked Ineligible Item Product',
        L: '012',
        M: 2,
        O: 2.5,
        S: 'INELIGIBLE_ITEM_ISO',
        U: 'yes',
        W: null
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    Sheet1: [
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        U: 'NIRMS'
      },
      {
        A: 'RMS-GB-000025-001',
        I: '790 - PASTRY - C',
        K: 'CO OP BRITISH CHICKEN POPPERS',
        L: '1602321990',
        M: 4,
        O: 2.4,
        U: 'N'
      }
    ],
    Sheet2: [
      {
        A: 'Extra row 1'
      },
      {
        A: 'RMS_ESTABLISHMENT_NO',
        I: 'PRODUCT_TYPE_CATEGORY',
        K: 'PART_NUMBER_DESCRIPTION',
        L: 'TARIFF_CODE_EU',
        M: 'PACKAGES',
        O: 'NET_WEIGHT_TOTAL',
        P: 'NET_WEIGHT_PACKAGE_KG',
        U: 'NIRMS'
      },
      {
        A: 'RMS-GB-000025-001',
        I: '710 - SANDWICHES - C',
        K: 'CO OP TUNA MAYONNAISE SANDWICH',
        L: '1604207055',
        M: 4,
        O: 3.2,
        U: 'N'
      }
    ]
  }
}
