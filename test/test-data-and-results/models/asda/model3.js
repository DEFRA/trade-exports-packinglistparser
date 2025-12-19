export default {
  validModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs'
      },
      {
        B: '100000261 DAILY CROISSANT CHOCO 1PK',
        C: 'Bakery Bought In',
        D: 'Ambient Grocery',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'Non-NIRMS'
      },
      {
        B: '100000859 ASDA CREPES TOFFEE 180G',
        C: 'Bakery Bought In',
        D: 'Ambient Grocery',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.204,
        I: 'kgs',
        J: 'Non-NIRMS'
      }
    ]
  },
  validHeadersNoData: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs'
      }
    ]
  },
  validModelMultipleSheets: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs'
      },
      {
        B: '100000261 DAILY CROISSANT CHOCO 1PK',
        C: 'Bakery Bought In',
        D: 'Ambient Grocery',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'Non-NIRMS'
      }
    ],
    Page2_2: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMS'
      },
      {
        B: '100000859 ASDA CREPES TOFFEE 180G',
        C: 'Bakery Bought In',
        D: 'Ambient Grocery',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.204,
        I: 'kgs',
        J: 'Non-NIRMS'
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs'
      },
      {
        E: 'RMS-GB-000015-006'
      },
      {
        B: '100000261 DAILY CROISSANT CHOCO 1PK',
        C: null,
        D: 'Ambient Grocery',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'Non-NIRMS'
      },
      {
        B: '100000859 ASDA CREPES TOFFEE 180G',
        C: 'Bakery Bought In',
        D: null,
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.204,
        I: 'kgs',
        J: 'Non-NIRMS'
      }
    ]
  },
  wrongEstablishment: {
    Page1_1: [
      {
        J: 'NIRMs/Non-NIRMs'
      },
      {},
      {
        E: 'INCORRECT'
      },
      {
        B: '100000261 DAILY CROISSANT CHOCO 1PK',
        C: null,
        D: 'Ambient Grocery',
        E: 'INVALID',
        F: 'INVALID',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'Non-NIRMS'
      }
    ]
  },
  wrongEstablishmentMultiple: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs'
      },
      {
        E: 'RMS-GB-000015-006',
        J: 'Non-NIRMS'
      }
    ],
    Page2_2: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs'
      },
      {
        E: 'INCORRECT',
        J: 'Non-NIRMS'
      }
    ]
  },
  incorrectHeader: {
    Page1_1: [
      {
        B: 'NOT',
        C: 'CORRECT',
        D: 'HEADER',
        J: 'NIRMs/Non-NIRMs'
      },
      {
        E: 'RMS-GB-000015-006',
        J: 'Non-NIRMS'
      },
      {
        B: '100000261 DAILY CROISSANT CHOCO 1PK',
        C: 'Bakery Bought In',
        D: 'Ambient Grocery',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'Non-NIRMS'
      }
    ]
  },
  incorrectHeaderMultiple: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        J: 'NIRMs/Non-NIRMs'
      },
      {
        B: '100000261 DAILY CROISSANT CHOCO 1PK',
        C: 'Bakery Bought In',
        D: 'Ambient Grocery',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'Non-NIRMS'
      }
    ],
    Page2_2: [
      {
        B: 'NOT',
        C: 'CORRECT',
        D: 'HEADER',
        J: 'NIRMs/Non-NIRMs'
      },
      {
        B: '100000859 ASDA CREPES TOFFEE 180G',
        C: 'Bakery Bought In',
        D: 'Ambient Grocery',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.204,
        I: 'kgs',
        J: 'Non-NIRMS'
      }
    ]
  },
  emptyModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs'
      },
      {}
    ]
  },
  multipleRms: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs'
      },
      {
        B: '100000261 DAILY CROISSANT CHOCO 1PK',
        C: 'Bakery Bought In',
        D: 'Ambient Grocery',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'Non-NIRMS'
      },
      {
        B: '100000859 ASDA CREPES TOFFEE 180G',
        C: 'Bakery Bought In',
        D: 'Ambient Grocery',
        E: 'RMS-GB-000015-007',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.204,
        I: 'kgs',
        J: 'Non-NIRMS'
      }
    ]
  },
  missingKgunit: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs'
      },
      {
        B: '100000261 DAILY CROISSANT CHOCO 1PK',
        C: 'Bakery Bought In',
        D: 'Ambient Grocery',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: null,
        J: 'Non-NIRMS'
      },
      {
        B: '100000859 ASDA CREPES TOFFEE 180G',
        C: 'Bakery Bought In',
        D: 'Ambient Grocery',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.204,
        I: null,
        J: 'Non-NIRMS'
      }
    ]
  },

  validModelMultipleSheetsHeadersOnDifferentRows: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs'
      },
      {
        B: '100000261 DAILY CROISSANT CHOCO 1PK',
        C: 'Bakery Bought In',
        D: 'Ambient Grocery',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'Non-NIRMS'
      }
    ],
    Page2_2: [
      {
        B: 'Extra data row 1'
      },
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs'
      },
      {
        B: '100000859 ASDA CREPES TOFFEE 180G',
        C: 'Bakery Bought In',
        D: 'Ambient Grocery',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.204,
        I: 'kgs',
        J: 'Non-NIRMS'
      }
    ]
  },

  // CoO Validation Test Data Models
  validCooModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs',
        M: 'Commodity Code',
        N: 'Country of Origin'
      },
      {
        B: 'ASDA DAILY CROISSANT CHOCO 1PK',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1905900000',
        N: 'GB'
      }
    ]
  },

  nonNirmsModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs',
        M: 'Commodity Code',
        N: 'Country of Origin'
      },
      {
        B: 'ASDA DAILY CROISSANT CHOCO 1PK',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'Non-NIRMS',
        M: '1905900000',
        N: 'GB'
      }
    ]
  },

  nullNirmsModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs',
        M: 'Commodity Code',
        N: 'Country of Origin'
      },
      {
        B: 'ASDA DAILY CROISSANT CHOCO 1PK',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: null,
        M: '1905900000',
        N: 'GB'
      }
    ]
  },

  invalidNirmsModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs',
        M: 'Commodity Code',
        N: 'Country of Origin'
      },
      {
        B: 'ASDA DAILY CROISSANT CHOCO 1PK',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'INVALID',
        M: '1905900000',
        N: 'GB'
      }
    ]
  },

  nullNirmsMultipleModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs',
        M: 'Commodity Code',
        N: 'Country of Origin'
      },
      {
        B: 'ITEM 1 NULL NIRMS',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: null,
        M: '1905900000',
        N: 'GB'
      },
      {
        B: 'ITEM 2 NULL NIRMS',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: null,
        M: '1905900000',
        N: 'GB'
      },
      {
        B: 'ITEM 3 NULL NIRMS',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: null,
        M: '1905900000',
        N: 'GB'
      },
      {
        B: 'ITEM 4 NULL NIRMS',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: null,
        M: '1905900000',
        N: 'GB'
      }
    ]
  },

  invalidNirmsMultipleModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs',
        M: 'Commodity Code',
        N: 'Country of Origin'
      },
      {
        B: 'ITEM 1 INVALID NIRMS',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'INVALID',
        M: '1905900000',
        N: 'GB'
      },
      {
        B: 'ITEM 2 INVALID NIRMS',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'INVALID',
        M: '1905900000',
        N: 'GB'
      },
      {
        B: 'ITEM 3 INVALID NIRMS',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'INVALID',
        M: '1905900000',
        N: 'GB'
      },
      {
        B: 'ITEM 4 INVALID NIRMS',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'INVALID',
        M: '1905900000',
        N: 'GB'
      }
    ]
  },

  nullCooModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs',
        M: 'Commodity Code',
        N: 'Country of Origin'
      },
      {
        B: 'ASDA DAILY CROISSANT CHOCO 1PK',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1905900000',
        N: null
      }
    ]
  },

  invalidCooModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs',
        M: 'Commodity Code',
        N: 'Country of Origin'
      },
      {
        B: 'ASDA DAILY CROISSANT CHOCO 1PK',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1905900000',
        N: 'INVALID'
      }
    ]
  },

  nullCooMultipleModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs',
        M: 'Commodity Code',
        N: 'Country of Origin'
      },
      {
        B: 'ITEM 1 NULL COO',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1905900000',
        N: null
      },
      {
        B: 'ITEM 2 NULL COO',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1905900000',
        N: null
      },
      {
        B: 'ITEM 3 NULL COO',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1905900000',
        N: null
      },
      {
        B: 'ITEM 4 NULL COO',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1905900000',
        N: null
      }
    ]
  },

  invalidCooMultipleModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs',
        M: 'Commodity Code',
        N: 'Country of Origin'
      },
      {
        B: 'ITEM 1 INVALID COO',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1905900000',
        N: 'INVALID'
      },
      {
        B: 'ITEM 2 INVALID COO',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1905900000',
        N: 'INVALID'
      },
      {
        B: 'ITEM 3 INVALID COO',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1905900000',
        N: 'INVALID'
      },
      {
        B: 'ITEM 4 INVALID COO',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1905900000',
        N: 'INVALID'
      }
    ]
  },

  cooPlaceholderXModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs',
        M: 'Commodity Code',
        N: 'Country of Origin'
      },
      {
        B: 'ASDA DAILY CROISSANT CHOCO 1PK',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1905900000',
        N: 'X'
      }
    ]
  },

  prohibitedItemsWithTreatmentModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs',
        M: 'Commodity Code',
        N: 'Country of Origin'
      },
      {
        B: 'PROHIBITED ITEM WITH TREATMENT',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1234',
        N: 'PROHIBITED_ITEM_ISO'
      }
    ]
  },

  prohibitedItemsNoTreatmentModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs',
        M: 'Commodity Code',
        N: 'Country of Origin'
      },
      {
        B: 'PROHIBITED ITEM NO TREATMENT',
        C: 'Bakery Bought In',
        D: null,
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1234',
        N: 'PROHIBITED_ITEM_ISO'
      }
    ]
  },

  prohibitedItemsMultipleWithTreatmentModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs',
        M: 'Commodity Code',
        N: 'Country of Origin'
      },
      {
        B: 'PROHIBITED ITEM 1 WITH TREATMENT',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1234',
        N: 'PROHIBITED_ITEM_ISO'
      },
      {
        B: 'PROHIBITED ITEM 2 WITH TREATMENT',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1234',
        N: 'PROHIBITED_ITEM_ISO'
      },
      {
        B: 'PROHIBITED ITEM 3 WITH TREATMENT',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1234',
        N: 'PROHIBITED_ITEM_ISO'
      },
      {
        B: 'PROHIBITED ITEM 4 WITH TREATMENT',
        C: 'Bakery Bought In',
        D: 'Processed',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1234',
        N: 'PROHIBITED_ITEM_ISO'
      }
    ]
  },

  prohibitedItemsMultipleNoTreatmentModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs',
        M: 'Commodity Code',
        N: 'Country of Origin'
      },
      {
        B: 'PROHIBITED ITEM 1 NO TREATMENT',
        C: 'Bakery Bought In',
        D: null,
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1234',
        N: 'PROHIBITED_ITEM_ISO'
      },
      {
        B: 'PROHIBITED ITEM 2 NO TREATMENT',
        C: 'Bakery Bought In',
        D: null,
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1234',
        N: 'PROHIBITED_ITEM_ISO'
      },
      {
        B: 'PROHIBITED ITEM 3 NO TREATMENT',
        C: 'Bakery Bought In',
        D: null,
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1234',
        N: 'PROHIBITED_ITEM_ISO'
      },
      {
        B: 'PROHIBITED ITEM 4 NO TREATMENT',
        C: 'Bakery Bought In',
        D: null,
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.059,
        I: 'kgs',
        J: 'NIRMS',
        M: '1234',
        N: 'PROHIBITED_ITEM_ISO'
      }
    ]
  }
}
