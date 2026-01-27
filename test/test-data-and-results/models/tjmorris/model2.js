module.exports = {
  validModel: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'RAW',
        L: '2 WEB LICK-E-LIX 5S BEEF',
        B: 'PET FOOD & HEALTHCARE',
        O: '0408192000',
        P: '2',
        R: '1.4',
        T: 'GB',
        W: 'N'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'FRESH PRODUCTS',
        B: 'LETTUCE & BAGGED SALADS',
        L: 'FLORETTE SWEET & CRUNCHY 250G',
        O: '1602906100',
        P: '4',
        R: '8',
        T: 'GB',
        W: 'N'
      }
    ]
  },
  validHeadersNoData: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'RAW',
        L: '2 WEB LICK-E-LIX 5S BEEF',
        B: 'PET FOOD & HEALTHCARE',
        O: '0408192000',
        P: '2',
        R: '1.4',
        T: 'GB',
        W: 'N'
      }
    ],
    Sheet2: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'FRESH PRODUCTS',
        B: 'LETTUCE & BAGGED SALADS',
        L: 'FLORETTE SWEET & CRUNCHY 250G',
        O: '1602906100',
        P: '4',
        R: '8',
        T: 'GB',
        W: 'N'
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'RAW',
        L: '2 WEB LICK-E-LIX 5S BEEF',
        B: 'PET FOOD & HEALTHCARE',
        O: '0408192000',
        P: '2',
        R: '1.4',
        T: 'GB',
        W: 'N'
      }
    ],
    Sheet2: [
      {},
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'FRESH PRODUCTS',
        B: 'LETTUCE & BAGGED SALADS',
        L: 'FLORETTE SWEET & CRUNCHY 250G',
        O: '1602906100',
        P: '4',
        R: '8',
        T: 'GB',
        W: 'N'
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'RAW',
        L: '2 WEB LICK-E-LIX 5S BEEF',
        B: 'PET FOOD & HEALTHCARE',
        O: '0408192000',
        P: '2',
        R: '1.4',
        T: 'GB',
        W: 'N'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'FRESH PRODUCTS',
        B: 'LETTUCE & BAGGED SALADS',
        L: 'FLORETTE SWEET & CRUNCHY 250G',
        O: '1602906100',
        P: '4',
        R: null,
        T: 'GB',
        W: 'N'
      }
    ]
  },
  wrongEstablishmentNumber: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'Incorrect'
      }
    ]
  },
  wrongEstablishmentMultiple: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001'
      }
    ],
    Sheet2: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'Incorrect'
      }
    ]
  },
  incorrectHeader: {
    Sheet1: [
      {
        L: 'NOT',
        O: 'CORRECT',
        P: 'HEADER'
      },
      {
        A: 'RMS-GB-000010-001'
      }
    ]
  },
  incorrectHeaderMultiple: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001'
      }
    ],
    Sheet2: [
      {
        L: 'NOT',
        O: 'CORRECT',
        P: 'HEADER'
      },
      {
        A: 'RMS-GB-000010-001'
      }
    ]
  },
  emptyModel: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: null
      }
    ]
  },
  multipleRms: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001',
        C: 'RMS-GB-000010-002',
        J: 'RAW',
        L: '2 WEB LICK-E-LIX 5S BEEF',
        B: 'PET FOOD & HEALTHCARE',
        O: '0408192000',
        P: '2',
        R: '1.4',
        T: 'GB',
        W: 'N'
      }
    ]
  },
  missingKgunit: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'RAW',
        L: '2 WEB LICK-E-LIX 5S BEEF',
        B: 'PET FOOD & HEALTHCARE',
        O: '0408192000',
        P: '2',
        R: '1.4',
        T: 'GB',
        W: 'N'
      }
    ]
  },
  invalidNirms: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'RAW',
        L: '2 WEB LICK-E-LIX 5S BEEF',
        B: 'PET FOOD & HEALTHCARE',
        O: '0408192000',
        P: '2',
        R: '1.4',
        T: 'GB',
        W: 'invalid'
      }
    ]
  },
  nonNirms: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'RAW',
        L: '2 WEB LICK-E-LIX 5S BEEF',
        B: 'PET FOOD & HEALTHCARE',
        O: '0408192000',
        P: '2',
        R: '1.4',
        T: 'GB',
        W: 'N'
      }
    ]
  },
  missingNirms: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'RAW',
        L: '2 WEB LICK-E-LIX 5S BEEF',
        B: 'PET FOOD & HEALTHCARE',
        O: '0408192000',
        P: '2',
        R: '1.4',
        T: 'GB'
      }
    ]
  },
  missingCoO: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'RAW',
        L: '2 WEB LICK-E-LIX 5S BEEF',
        B: 'PET FOOD & HEALTHCARE',
        O: '0408192000',
        P: '2',
        R: '1.4',
        T: '',
        W: 'Y'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'FRESH PRODUCTS',
        B: 'LETTUCE & BAGGED SALADS',
        L: 'FLORETTE SWEET & CRUNCHY 250G',
        O: '1602906100',
        P: '4',
        R: '8',
        W: 'yes'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'RAW',
        L: 'BUTTON MUSHROOMS 200G',
        B: 'FRESH PRODUCTS',
        O: '0709520000',
        P: '1',
        R: '2.4',
        T: '',
        W: 'green'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'FRESH PRODUCTS',
        B: 'LETTUCE & BAGGED SALADS',
        L: 'FLORETTE SWEET & CRUNCHY 250G',
        O: '1602906100',
        P: '4',
        R: '8',
        W: 'y'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'FRESH PRODUCTS',
        B: 'LETTUCE & BAGGED SALADS',
        L: 'FLORETTE SWEET & CRUNCHY 250G',
        O: '1602906100',
        P: '4',
        R: '8',
        W: 'g'
      }
    ]
  },
  invalidCoO: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'RAW',
        L: '2 WEB LICK-E-LIX 5S BEEF',
        B: 'PET FOOD & HEALTHCARE',
        O: '0408192000',
        P: '2',
        R: '1.4',
        T: 'INVALID',
        W: 'yes'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'FRESH PRODUCTS',
        B: 'LETTUCE & BAGGED SALADS',
        L: 'FLORETTE SWEET & CRUNCHY 250G',
        O: '1602906100',
        P: '4',
        R: '8',
        T: 'INVALID',
        W: 'nirms'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'RAW',
        L: 'BUTTON MUSHROOMS 200G',
        B: 'FRESH PRODUCTS',
        O: '0709520000',
        P: '1',
        R: '2.4',
        T: 'INVALID',
        W: 'green'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'FRESH PRODUCTS',
        B: 'LETTUCE & BAGGED SALADS',
        L: 'FLORETTE SWEET & CRUNCHY 250G',
        O: '1602906100',
        P: '4',
        R: '8',
        T: 'INVALID',
        W: 'y'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'FRESH PRODUCTS',
        B: 'LETTUCE & BAGGED SALADS',
        L: 'FLORETTE SWEET & CRUNCHY 250G',
        O: '1602906100',
        P: '4',
        R: '8',
        T: 'INVALID',
        W: 'no'
      }
    ]
  },
  xCoO: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'RAW',
        L: '2 WEB LICK-E-LIX 5S BEEF',
        B: 'PET FOOD & HEALTHCARE',
        O: '0408192000',
        P: '2',
        R: '1.4',
        T: 'X',
        W: 'yes'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'FRESH PRODUCTS',
        B: 'LETTUCE & BAGGED SALADS',
        L: 'FLORETTE SWEET & CRUNCHY 250G',
        O: '1602906100',
        P: '4',
        R: '8',
        T: 'x',
        W: 'nirms'
      }
    ]
  },
  ineligibleItems: {
    Sheet1: [
      {
        B: 'Nature of Products',
        J: 'Treatment Type',
        L: 'Description',
        O: 'Tariff/Commodity',
        P: 'Number of packages',
        R: 'Net Weight Kg',
        T: 'Country of Origin',
        W: 'NIRMS Eligible'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'INELIGIBLE_ITEM_TREATMENT',
        L: 'Mocked Ineligible Item Product',
        B: 'PET FOOD & HEALTHCARE',
        O: '012',
        P: '2',
        R: '1.4',
        T: 'INELIGIBLE_ITEM_ISO',
        W: 'yes'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'NOT_INELIGIBLE_ITEM_TREATMENT',
        B: 'LETTUCE & BAGGED SALADS',
        L: 'Mocked Ineligible Item Product',
        O: '1602906100',
        P: '4',
        R: '8',
        T: 'INELIGIBLE_ITEM_ISO',
        W: 'yes'
      },
      {
        A: 'RMS-GB-000010-001',
        L: 'Mocked Ineligible Item Product',
        B: 'FRESH PRODUCTS',
        O: '012',
        P: '1',
        R: '2.4',
        T: 'INELIGIBLE_ITEM_ISO',
        W: 'yes'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'FRESH PRODUCTS',
        B: 'LETTUCE & BAGGED SALADS',
        L: 'Mocked Ineligible Item Product',
        O: '1602906100',
        P: '4',
        R: '8',
        T: 'INELIGIBLE_ITEM_ISO',
        W: 'no'
      }
    ]
  }
}
