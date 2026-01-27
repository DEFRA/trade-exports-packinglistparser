export default {
  validModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: "60008347 - Take-Out Club Classic Crust Kickin' Meat Feast",
        C: 'GB',
        D: 6,
        E: 'Cases',
        F: 3.782,
        G: 3.552,
        H: 'Chilled',
        I: 'NON-NIRMS'
      },
      {
        A: '1905908000',
        B: "60008348 - Take-Out Club Classic Crust Smokin' BBQ Pulled Pork",
        C: 'GB',
        D: 5,
        E: 'Cases',
        F: 3.788,
        G: 3.558,
        H: 'Chilled',
        I: 'NON-NIRMS'
      }
    ]
  },
  validHeadersNoData: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: "60008347 - Take-Out Club Classic Crust Kickin' Meat Feast",
        C: 'GB',
        D: 6,
        E: 'Cases',
        F: 3.782,
        G: 3.552,
        H: 'Chilled',
        I: 'NON-NIRMS'
      }
    ],
    sheet2: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: '51283907 - PizzaExpress 9 Classic American *4',
        C: 'GB',
        D: 1,
        E: 'Cases',
        F: 3.182,
        G: 3.08,
        H: 'Chilled',
        I: 'NON-NIRMS'
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: "60008347 - Take-Out Club Classic Crust Kickin' Meat Feast",
        C: 'GB',
        D: 6,
        E: 'Cases',
        F: 3.782,
        G: 3.552,
        H: null,
        I: 'NON-NIRMS'
      },
      {
        A: '1905908000',
        B: "60008348 - Take-Out Club Classic Crust Smokin' BBQ Pulled Pork",
        C: 'GB',
        D: 5,
        E: 'Cases',
        F: 3.788,
        G: null,
        H: 'Chilled',
        I: 'NON-NIRMS'
      }
    ]
  },
  wrongEstablishment: {
    sheet1: [
      {
        B: 'INCORRECT'
      }
    ]
  },
  wrongEstablishmentMultiple: {
    sheet1: [
      {
        B: 'RMS-GB-000098-001'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      }
    ],
    sheet2: [
      {
        B: 'INCORRECT'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      }
    ]
  },
  incorrectHeader: {
    sheet1: [
      {
        B: 'RMS-GB-000098-001'
      },
      {
        A: 'NOT',
        B: 'CORRECT',
        C: 'HEADER'
      }
    ]
  },
  incorrectHeaderMultiple: {
    sheet1: [
      {
        B: 'RMS-GB-000098-001'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO'
      }
    ],
    sheet2: [
      {
        B: 'RMS-GB-000098-001'
      },
      {
        A: 'NOT',
        B: 'CORRECT',
        C: 'HEADER'
      }
    ]
  },
  emptyModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: null,
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {}
    ]
  },
  invalidMultipleRMS: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY',
        X: 'RMS-GB-000098-002'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: "60008347 - Take-Out Club Classic Crust Kickin' Meat Feast",
        C: 'GB',
        D: 6,
        E: 'Cases',
        F: 3.782,
        G: 3.552,
        H: 'Chilled',
        I: 'NON-NIRMS'
      },
      {
        A: '1905908000',
        B: "60008348 - Take-Out Club Classic Crust Smokin' BBQ Pulled Pork",
        C: 'GB',
        D: 5,
        E: 'Cases',
        F: 3.788,
        G: 3.558,
        H: 'Chilled',
        I: 'NON-NIRMS'
      }
    ]
  },
  // CoO Validation Test Data
  nonNirmsModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: "60008347 - Take-Out Club Classic Crust Kickin' Meat Feast",
        C: 'GB',
        D: 6,
        E: 'Cases',
        F: 3.782,
        G: 3.552,
        H: 'Processed',
        I: 'NON-NIRMS',
        J: 'Chilled'
      }
    ]
  },
  nullNirmsModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: "60008347 - Take-Out Club Classic Crust Kickin' Meat Feast",
        C: 'GB',
        D: 6,
        E: 'Cases',
        F: 3.782,
        G: 3.552,
        H: 'Processed',
        I: null,
        J: 'Chilled'
      }
    ]
  },
  invalidNirmsModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: "60008347 - Take-Out Club Classic Crust Kickin' Meat Feast",
        C: 'GB',
        D: 6,
        E: 'Cases',
        F: 3.782,
        G: 3.552,
        H: 'Processed',
        I: 'INVALID',
        J: 'Chilled'
      }
    ]
  },
  nullNirmsMultipleModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: 'Item 1',
        C: 'GB',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: null,
        J: 'Chilled'
      },
      {
        A: '1905908000',
        B: 'Item 2',
        C: 'GB',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: null,
        J: 'Chilled'
      },
      {
        A: '1905908000',
        B: 'Item 3',
        C: 'GB',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: null,
        J: 'Chilled'
      },
      {
        A: '1905908000',
        B: 'Item 4',
        C: 'GB',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: null,
        J: 'Chilled'
      }
    ]
  },
  invalidNirmsMultipleModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: 'Item 1',
        C: 'GB',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'INVALID',
        J: 'Chilled'
      },
      {
        A: '1905908000',
        B: 'Item 2',
        C: 'GB',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'INVALID',
        J: 'Chilled'
      },
      {
        A: '1905908000',
        B: 'Item 3',
        C: 'GB',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'INVALID',
        J: 'Chilled'
      },
      {
        A: '1905908000',
        B: 'Item 4',
        C: 'GB',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'INVALID',
        J: 'Chilled'
      }
    ]
  },
  nullCooModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: "60008347 - Take-Out Club Classic Crust Kickin' Meat Feast",
        C: null,
        D: 6,
        E: 'Cases',
        F: 3.782,
        G: 3.552,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Chilled'
      }
    ]
  },
  invalidCooModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: "60008347 - Take-Out Club Classic Crust Kickin' Meat Feast",
        C: 'INVALID_ISO',
        D: 6,
        E: 'Cases',
        F: 3.782,
        G: 3.552,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Chilled'
      }
    ]
  },
  nullCooMultipleModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: 'Item 1',
        C: null,
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Chilled'
      },
      {
        A: '1905908000',
        B: 'Item 2',
        C: null,
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Chilled'
      },
      {
        A: '1905908000',
        B: 'Item 3',
        C: null,
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Chilled'
      },
      {
        A: '1905908000',
        B: 'Item 4',
        C: null,
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Chilled'
      }
    ]
  },
  invalidCooMultipleModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: 'Item 1',
        C: 'INVALID_ISO',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Chilled'
      },
      {
        A: '1905908000',
        B: 'Item 2',
        C: 'INVALID_ISO',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Chilled'
      },
      {
        A: '1905908000',
        B: 'Item 3',
        C: 'INVALID_ISO',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Chilled'
      },
      {
        A: '1905908000',
        B: 'Item 4',
        C: 'INVALID_ISO',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Chilled'
      }
    ]
  },
  cooPlaceholderXModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: "60008347 - Take-Out Club Classic Crust Kickin' Meat Feast",
        C: 'X',
        D: 6,
        E: 'Cases',
        F: 3.782,
        G: 3.552,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Chilled'
      }
    ]
  },
  ineligibleItemsWithTreatmentModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1234',
        B: 'Ineligible Item',
        C: 'INELIGIBLE_ITEM_ISO',
        D: 6,
        E: 'Cases',
        F: 3.782,
        G: 3.552,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Processed'
      }
    ]
  },
  ineligibleItemsMultipleWithTreatmentModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1234',
        B: 'Ineligible Item 1',
        C: 'INELIGIBLE_ITEM_ISO',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Processed'
      },
      {
        A: '1234',
        B: 'Ineligible Item 2',
        C: 'INELIGIBLE_ITEM_ISO',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Processed'
      },
      {
        A: '1234',
        B: 'Ineligible Item 3',
        C: 'INELIGIBLE_ITEM_ISO',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Processed'
      },
      {
        A: '1234',
        B: 'Ineligible Item 4',
        C: 'INELIGIBLE_ITEM_ISO',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Processed'
      }
    ]
  },
  ineligibleItemsNoTreatmentModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1234',
        B: 'Ineligible Item',
        C: 'INELIGIBLE_ITEM_ISO',
        D: 6,
        E: 'Cases',
        F: 3.782,
        G: 3.552,
        H: null,
        I: 'NIRMS',
        J: 'Processed'
      }
    ]
  },
  ineligibleItemsMultipleNoTreatmentModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1234',
        B: 'Ineligible Item 1',
        C: 'INELIGIBLE_ITEM_ISO',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: null,
        I: 'NIRMS',
        J: 'Processed'
      },
      {
        A: '1234',
        B: 'Ineligible Item 2',
        C: 'INELIGIBLE_ITEM_ISO',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: null,
        I: 'NIRMS',
        J: 'Processed'
      },
      {
        A: '1234',
        B: 'Ineligible Item 3',
        C: 'INELIGIBLE_ITEM_ISO',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: null,
        I: 'NIRMS',
        J: 'Processed'
      },
      {
        A: '1234',
        B: 'Ineligible Item 4',
        C: 'INELIGIBLE_ITEM_ISO',
        D: 1,
        E: 'Cases',
        F: 1.0,
        G: 1.0,
        H: null,
        I: 'NIRMS',
        J: 'Processed'
      }
    ]
  },
  validCooModel: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: "60008347 - Take-Out Club Classic Crust Kickin' Meat Feast",
        C: 'VALID_ISO',
        D: 6,
        E: 'Cases',
        F: 3.782,
        G: 3.552,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Chilled'
      },
      {
        A: '1905908000',
        B: "60008348 - Take-Out Club Classic Crust Smokin' BBQ Pulled Pork",
        C: 'GB',
        D: 5,
        E: 'Cases',
        F: 3.788,
        G: 3.558,
        H: 'Processed',
        I: 'NIRMS',
        J: 'Chilled'
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    Tabelle1: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1905908000',
        B: "60008347 - Take-Out Club Classic Crust Kickin' Meat Feast",
        C: 'GB',
        D: 6,
        E: 'Cases',
        F: 3.782,
        G: 3.552,
        H: 'Chilled',
        I: 'NON-NIRMS'
      }
    ],
    Tabelle2: [
      {
        A: 'NIIRMS Dispatch number',
        B: 'RMS-GB-000098-001',
        C: 'Dispatch address',
        D: 'Buffaload Logistics, Gateway Industrial Estate, Crewe, Cheshire, CW1 6YY'
      },
      {
        A: 'extra row'
      },
      {
        A: 'Commodity Code',
        B: 'Description of goods',
        C: 'ISO',
        D: 'No. of pkgs',
        E: 'Type of pkgs',
        F: 'Item Gross Weight (kgs)',
        G: 'Total Net Weight (kgs)',
        H: 'Type of Treatment',
        I: 'NIRMS/ NON NIRMS',
        J: 'Nature of Product'
      },
      {
        A: '1601200000',
        B: '60008349 - Take-Out Club Thin Crust Spicy Chicken',
        C: 'GB',
        D: 4,
        E: 'Cases',
        F: 2.88,
        G: 2.64,
        H: 'Chilled',
        I: 'NON-NIRMS'
      }
    ]
  }
}
