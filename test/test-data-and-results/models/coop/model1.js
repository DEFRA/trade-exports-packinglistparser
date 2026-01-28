export default {
  validModel: {
    'Input Packing Sheet': [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12,
        Y: 'no'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Ripe And Ready To Eat Avocados 2S.',
        P: '0709601001',
        Q: 1,
        S: 1,
        Y: 'no'
      }
    ]
  },
  validHeadersNoData: {
    'Input Packing Sheet': [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS'
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12,
        Y: 'no'
      }
    ],
    sheet2: [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Whole Cucumber Each #',
        P: '0707000599',
        Q: 10,
        S: 58.8,
        Y: 'no'
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    'Input Packing Sheet': [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: null,
        S: 12,
        Y: 'no'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Ripe And Ready To Eat Avocados 2S.',
        P: null,
        Q: 1,
        S: 1,
        Y: 'no'
      }
    ]
  },
  wrongEstablishmentMultiple: {
    sheet1: [
      {},
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS'
      },
      {
        E: 'RMS-GB-000009-001'
      }
    ],
    sheet2: [
      {},
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS'
      },
      {
        E: 'INCORRECT'
      }
    ]
  },
  wrongEstablishment: {
    sheet2: [
      {},
      {},
      {
        E: 'INCORRECT'
      }
    ]
  },
  incorrectHeader: {
    sheet1: [
      {
        E: 'NOT',
        L: 'CORRECT',
        P: 'HEADER',
        O: 'Product/ Part Number description'
      },
      {
        E: 'RMS-GB-000009-001'
      }
    ]
  },
  incorrectHeaderMultiple: {
    sheet1: [
      {
        E: 'Dispatch RMS Establishment',
        L: 'Product Type/ Category',
        P: 'Tariff Code EU',
        O: 'Product/ Part Number description',
        Y: 'NIRMS'
      },
      {
        E: 'RMS-GB-000009-001'
      }
    ],
    sheet2: [
      {
        E: 'NOT',
        L: 'CORRECT',
        P: 'HEADER',
        O: 'Product/ Part Number description'
      },
      {
        E: 'RMS-GB-000009-001'
      }
    ]
  },
  emptyModel: {
    'Input Packing Sheet': [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package',
        S: 'NW total',
        Y: 'NIRMS'
      },
      {
        E: null
      }
    ]
  },
  multipleRms: {
    'Input Packing Sheet': [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12,
        Y: 'no'
      },
      {
        E: 'RMS-GB-000009-002',
        O: 'Co-op Ripe And Ready To Eat Avocados 2S.',
        P: '0709601001',
        Q: 1,
        S: 1,
        Y: 'no'
      }
    ]
  },
  missingKgunit: {
    'Input Packing Sheet': [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package',
        S: 'NW total',
        Y: 'NIRMS'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12,
        Y: 'no'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Ripe And Ready To Eat Avocados 2S.',
        P: '0709601001',
        Q: 1,
        S: 1,
        Y: 'no'
      }
    ]
  },
  nonNirms: {
    'Input Packing Sheet': [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12,
        Y: 'no'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12,
        Y: 'non-nirms'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12,
        Y: 'non nirms'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12,
        Y: 'red'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12,
        Y: 'r'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12,
        Y: 'n'
      }
    ]
  },
  invalidNirms: {
    'Input Packing Sheet': [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12,
        Y: 'invalid'
      }
    ]
  },
  missingNirms: {
    'Input Packing Sheet': [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12
      }
    ]
  },
  missingCoO: {
    'Input Packing Sheet': [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS',
        Z: 'Country of Origin'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12,
        Y: 'yes',
        Z: ''
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Ripe And Ready To Eat Avocados 2S.',
        P: '0709601001',
        Q: 1,
        S: 1,
        Y: 'nirms'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Whole Cucumber Each',
        P: '0707000599',
        Q: 5,
        S: 5,
        Y: 'green'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Carrots Each',
        P: '0706100000',
        Q: 3,
        S: 3,
        Y: 'y'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Lettuce Each',
        P: '0705110000',
        Q: 2,
        S: 2,
        Y: 'g'
      }
    ]
  },
  invalidCoO: {
    'Input Packing Sheet': [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS',
        Z: 'Country of Origin'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12,
        Y: 'yes',
        Z: 'INVALID'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Ripe And Ready To Eat Avocados 2S.',
        P: '0709601001',
        Q: 1,
        S: 1,
        Y: 'nirms',
        Z: 'INVALID'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Whole Cucumber Each',
        P: '0707000599',
        Q: 5,
        S: 5,
        Y: 'green',
        Z: 'INVALID'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Carrots Each',
        P: '0706100000',
        Q: 3,
        S: 3,
        Y: 'y',
        Z: 'INVALID'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Lettuce Each',
        P: '0705110000',
        Q: 2,
        S: 2,
        Y: 'g',
        Z: 'INVALID'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Lettuce Each',
        P: '0705110000',
        Q: 2,
        S: 2,
        Y: 'no',
        Z: 'INVALID'
      }
    ]
  },
  xCoO: {
    'Input Packing Sheet': [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS',
        Z: 'Country of Origin'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12,
        Y: 'yes',
        Z: 'X'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Ripe And Ready To Eat Avocados 2S.',
        P: '0709601001',
        Q: 1,
        S: 1,
        Y: 'nirms',
        Z: 'x'
      }
    ]
  },
  ineligibleItems: {
    'Input Packing Sheet': [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS',
        Z: 'Country of Origin',
        B: 'Type of Treatment'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Mocked Ineligible Item Product',
        P: '012',
        Q: 12,
        S: 12,
        Y: 'yes',
        Z: 'INELIGIBLE_ITEM_ISO',
        B: 'INELIGIBLE_ITEM_TREATMENT'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Mocked Ineligible Item Product',
        P: '012',
        Q: 12,
        S: 12,
        Y: 'yes',
        Z: 'INELIGIBLE_ITEM_ISO',
        B: 'NOT_INELIGIBLE_ITEM_TREATMENT'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Mocked Ineligible Item Product',
        P: '012',
        Q: 12,
        S: 12,
        Y: 'yes',
        Z: 'INELIGIBLE_ITEM_ISO'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Mocked Ineligible Item Product',
        P: '012',
        Q: 12,
        S: 12,
        Y: 'no',
        Z: 'INELIGIBLE_ITEM_ISO'
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    Sheet1: [
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Red Peppers Each',
        P: '0709601000',
        Q: 12,
        S: 12,
        Y: 'no'
      }
    ],
    sheet2: [
      {
        A: 'Extra row 1'
      },
      {
        E: 'Dispatch RMS Establishment',
        O: 'Product/ Part Number description',
        P: 'Tariff Code EU',
        Q: 'Packages',
        R: 'Net Weight/Package KG',
        S: 'NW total',
        Y: 'NIRMS'
      },
      {
        E: 'RMS-GB-000009-001',
        O: 'Co-op Whole Cucumber Each #',
        P: '0707000599',
        Q: 10,
        S: 58.8,
        Y: 'no'
      }
    ]
  }
}
