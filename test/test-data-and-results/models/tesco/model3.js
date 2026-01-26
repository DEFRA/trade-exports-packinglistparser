/**
 * Tesco Model 3 test data
 *
 * Sample packing list data structures for testing the Tesco Model 3
 * matcher and parser implementations.
 */
export default {
  validModel: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'PL',
        F: 'NON NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'GR',
        F: 'NON NIRMS',
        G: 'JOIE MEASURING SPOONS',
        L: '3924100090',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 0.84,
        BU: 0.798
      },
      {
        BU: 0
      }
    ]
  },
  validHeadersNoData: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        G: 'Product Description',
        F: 'NIRMS / NON NIRMS',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'PL',
        F: 'NON NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ],
    Sheet2: [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-999'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'GR',
        F: 'NON NIRMS',
        G: 'JOIE MEASURING SPOONS',
        L: '3924100090',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 0.84,
        BU: 0.798
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    Sheet1: [
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'PL',
        F: 'NON NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ],
    Sheet2: [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'GR',
        F: 'NON NIRMS',
        G: 'JOIE MEASURING SPOONS',
        L: '3924100090',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 0.84,
        BU: 0.798
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'PL',
        F: 'NON NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: null
      },
      {
        E: 'GR',
        F: 'NON NIRMS',
        G: 'JOIE MEASURING SPOONS',
        L: '3924100090',
        AS: null,
        AT: 'Y',
        BR: 1,
        BT: 0.84,
        BU: 0.798
      }
    ]
  },
  wrongEstablishment: {
    Sheet1: [
      {},
      {},
      {},
      {
        AT: 'INCORRECT'
      }
    ]
  },
  wrongEstablishmentMultiple: {
    Sheet1: [
      {},
      {},
      {},
      {
        AT: 'INCORRECT'
      }
    ],
    Sheet2: [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      }
    ]
  },
  incorrectHeader: {
    Sheet1: [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        G: 'NOT',
        F: 'NON NIRMS',
        L: 'CORRECT',
        AS: 'HEADER',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight',
        BU: 'Net Weight'
      }
    ]
  },
  incorrectHeaderMultiple: {
    Sheet1: [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        G: 'Product Description',
        F: 'NIRMS / NON NIRMS',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      }
    ],
    Sheet2: [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        G: 'NOT',
        F: 'NON NIRMS',
        L: 'CORRECT',
        AS: 'HEADER',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight',
        BU: 'Net Weight'
      }
    ]
  },
  emptyModel: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: null
      },
      {
        D: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      }
    ]
  },
  multipleRms: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998',
        AU: 'RMS-GB-000022-999'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'PL',
        F: 'NON NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'GR',
        F: 'NON NIRMS',
        G: 'JOIE MEASURING SPOONS',
        L: '3924100090',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 0.84,
        BU: 0.798
      }
    ]
  },
  nonNirms: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'PL',
        F: 'NON NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },
  invalidNirms: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'PL',
        F: 'INVALID',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },
  missingNirms: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'PL',
        F: null,
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },
  missingCoO: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: null,
        F: 'NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },
  invalidCoO: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'INVALID',
        F: 'NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },
  xCoO: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'X',
        F: 'NON NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },
  missingKgunit: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight',
        BU: 'Net Weight'
      },
      {
        E: 'PL',
        F: 'NON NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'GR',
        F: 'NON NIRMS',
        G: 'JOIE MEASURING SPOONS',
        L: '3924100090',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 0.84,
        BU: 0.798
      }
    ]
  },
  ineligibleItems: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'INELIGIBLE_ITEM_ISO',
        F: 'NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '0123456789',
        AS: 'INELIGIBLE_ITEM_TREATMENT',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'GR',
        F: 'NON NIRMS',
        G: 'JOIE MEASURING SPOONS',
        L: '3924100090',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 0.84,
        BU: 0.798
      },
      {
        BU: 0
      }
    ]
  },

  // === CoO Validation Test Data for Parser Service ===

  // BAC1: NOT within NIRMS Scheme - Non-NIRMS items pass validation
  nonNirmsModel: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'VALID_ISO',
        F: 'NON NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },

  // BAC2: Null NIRMS value - validation errors
  nullNirmsModel: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'VALID_ISO',
        F: null,
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },

  // BAC3: Invalid NIRMS value - validation errors
  invalidNirmsModel: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'VALID_ISO',
        F: 'INVALID_VALUE',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },

  // BAC4: Null NIRMS value, more than 3 - validation errors with summary
  nullNirmsMultipleModel: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'VALID_ISO',
        F: null,
        G: 'Product 1',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'VALID_ISO',
        F: null,
        G: 'Product 2',
        L: '9617000001',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'VALID_ISO',
        F: null,
        G: 'Product 3',
        L: '9617000002',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'VALID_ISO',
        F: null,
        G: 'Product 4',
        L: '9617000003',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },

  // BAC5: Invalid NIRMS value, more than 3 - validation errors with summary
  invalidNirmsMultipleModel: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'VALID_ISO',
        F: 'INVALID_VALUE',
        G: 'Product 1',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'VALID_ISO',
        F: 'INVALID_VALUE',
        G: 'Product 2',
        L: '9617000001',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'VALID_ISO',
        F: 'INVALID_VALUE',
        G: 'Product 3',
        L: '9617000002',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'VALID_ISO',
        F: 'INVALID_VALUE',
        G: 'Product 4',
        L: '9617000003',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },

  // BAC6: Null CoO Value - validation errors
  nullCooModel: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: null,
        F: 'NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },

  // BAC7: Invalid CoO Value - validation errors
  invalidCooModel: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'INVALID_COO',
        F: 'NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },

  // BAC8: Null CoO Value, more than 3 - validation errors with summary
  nullCooMultipleModel: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: null,
        F: 'NIRMS',
        G: 'Product 1',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: null,
        F: 'NIRMS',
        G: 'Product 2',
        L: '9617000001',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: null,
        F: 'NIRMS',
        G: 'Product 3',
        L: '9617000002',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: null,
        F: 'NIRMS',
        G: 'Product 4',
        L: '9617000003',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },

  // BAC9: Invalid CoO Value, more than 3 - validation errors with summary
  invalidCooMultipleModel: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'INVALID_COO',
        F: 'NIRMS',
        G: 'Product 1',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'INVALID_COO',
        F: 'NIRMS',
        G: 'Product 2',
        L: '9617000001',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'INVALID_COO',
        F: 'NIRMS',
        G: 'Product 3',
        L: '9617000002',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'INVALID_COO',
        F: 'NIRMS',
        G: 'Product 4',
        L: '9617000003',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },

  // BAC10: CoO Value is X or x - passes validation
  cooPlaceholderXModel: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'X',
        F: 'NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },

  // BAC11: Item Present on Ineligible Item List (Treatment Type specified) - validation errors
  ineligibleItemsWithTreatmentModel: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'INELIGIBLE_ITEM_ISO',
        F: 'NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '0123456789',
        AS: 'INELIGIBLE_ITEM_TREATMENT',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },

  // BAC12: Item Present on Ineligible Item List, more than 3 (Treatment Type specified) - validation errors with summary
  ineligibleItemsMultipleWithTreatmentModel: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'INELIGIBLE_ITEM_ISO',
        F: 'NIRMS',
        G: 'Product 1',
        L: '0123456789',
        AS: 'INELIGIBLE_ITEM_TREATMENT',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'INELIGIBLE_ITEM_ISO',
        F: 'NIRMS',
        G: 'Product 2',
        L: '0123456789',
        AS: 'INELIGIBLE_ITEM_TREATMENT',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'INELIGIBLE_ITEM_ISO',
        F: 'NIRMS',
        G: 'Product 3',
        L: '0123456789',
        AS: 'INELIGIBLE_ITEM_TREATMENT',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'INELIGIBLE_ITEM_ISO',
        F: 'NIRMS',
        G: 'Product 4',
        L: '0123456789',
        AS: 'INELIGIBLE_ITEM_TREATMENT',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      }
    ]
  },

  // Valid CoO Validation: Complete packing list with all fields valid
  validCooModel: {
    'Input Data Sheet': [
      {},
      {},
      {},
      {
        AT: 'RMS-GB-000022-998'
      },
      {
        E: 'Country of Origin',
        F: 'NIRMS / NON NIRMS',
        G: 'Product Description',
        L: 'Tariff Code UK',
        AS: 'Treatment Type',
        AT: 'Green Lane',
        BR: 'Packages',
        BT: 'Gross Weight (KG)',
        BU: 'Net Weight (KG)'
      },
      {
        E: 'GB',
        F: 'NIRMS',
        G: 'CONTIGO AUTO-POP BOTTLE 720ML',
        L: '9617000000',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 1.49,
        BU: 1.4155
      },
      {
        E: 'VALID_ISO',
        F: 'NON NIRMS',
        G: 'JOIE MEASURING SPOONS',
        L: '3924100090',
        AS: 'Ambient',
        AT: 'Y',
        BR: 1,
        BT: 0.84,
        BU: 0.798
      }
    ]
  }
}
