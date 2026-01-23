export default {
  validModel: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        E: 'JS Chicken Korma 400g',
        C: 'Chilled Indian Meals',
        O: '0709991000',
        G: 1,
        H: 3.15,
        N: 'RMS-GB-000094-002\u200B',
        P: 'no'
      },
      {
        E: 'JS TTD Gunpowder Potatoes 250g',
        C: 'Chilled Indian Meals',
        O: '1602323090',
        G: 2,
        H: 1.4,
        N: 'RMS-GB-000094-002\u200B',
        P: 'no'
      }
    ]
  },
  validHeadersNoData: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        E: "Jason's Sourdough The Great White 450g",
        C: 'Bread',
        O: '1905903000',
        G: 1,
        H: 3.15,
        N: 'RMS-GB-000094-002\u200B',
        P: 'no'
      }
    ],
    Sheet2: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        E: 'JS Chicken Korma 400g',
        C: 'Chilled Indian Meals',
        O: '1602323090',
        G: 1,
        H: 2.4,
        N: 'RMS-GB-000094-002\u200B',
        P: 'no'
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        E: 'JS Chicken Korma 400g',
        C: 'Chilled Indian Meals',
        O: '0709991000',
        G: 1,
        H: 3.15,
        N: 'RMS-GB-000094-002\u200B',
        P: 'no'
      },
      {
        E: 'JS TTD Gunpowder Potatoes 250g',
        C: 'Chilled Indian Meals',
        O: '1602323090',
        G: 2,
        N: 'RMS-GB-000094-002\u200B',
        P: 'no'
      }
    ]
  },
  wrongEstablishmentMultiple: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        N: 'RMS-GB-000094-002\u200B'
      }
    ],
    Sheet2: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        N: 'Incorrect'
      }
    ]
  },
  emptyModel: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        N: 'RMS-GB-000094-002\u200B'
      }
    ]
  },
  incorrectHeaderMultiple: {
    Sheet1: [
      {
        A: 'Delivery Date',
        B: 'Load Ref (Trailer Number)',
        C: 'Product Type / Category',
        D: 'Product / Part Number',
        E: 'Product / Part Number Description',
        F: 'Packed Singles',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        I: 'Gross\nWeight / Package KG',
        J: 'Type of treatment',
        K: 'Excise Code',
        L: 'Final Destination ID',
        M: 'Dispatch Unit ID',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        N: 'RMS-GB-000094-002\u200B'
      }
    ],
    Sheet2: [
      {
        A: 'NOT',
        B: 'CORRECT',
        C: 'HEADER',
        D: 'Product / Part Number',
        E: 'Product / Part Number Description',
        F: 'Packed Singles',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        I: 'Gross\nWeight / Package KG',
        J: 'Type of treatment',
        K: 'Excise Code',
        L: 'Final Destination ID',
        M: 'Dispatch Unit ID',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        N: 'RMS-GB-000094-002\u200B'
      }
    ]
  },
  multipleRms: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        E: 'JS Chicken Korma 400g',
        C: 'Chilled Indian Meals',
        O: '0709991000',
        G: 1,
        H: 3.15,
        N: 'RMS-GB-000094-002\u200B',
        P: 'no'
      },
      {
        E: 'JS TTD Gunpowder Potatoes 250g',
        C: 'Chilled Indian Meals',
        O: '1602323090',
        G: 2,
        H: 1.4,
        N: 'RMS-GB-000094-003\u200B',
        P: 'no'
      },
      {
        E: 'JS TTD Gunpowder Potatoes 500g',
        C: 'Chilled Indian Meals',
        O: '1602323090',
        G: 2,
        H: 2.8,
        N: 'RMS-GB-000094-003',
        P: 'no'
      }
    ]
  },
  missingKgunit: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        E: 'JS Chicken Korma 400g',
        C: 'Chilled Indian Meals',
        O: '0709991000',
        G: 1,
        H: 3.15,
        N: 'RMS-GB-000094-002\u200B',
        P: 'no'
      },
      {
        E: 'JS TTD Gunpowder Potatoes 250g',
        C: 'Chilled Indian Meals',
        O: '1602323090',
        G: 2,
        H: 1.4,
        N: 'RMS-GB-000094-002\u200B',
        P: 'no'
      }
    ]
  },
  invalidNirms: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        E: 'JS Chicken Korma 400g',
        C: 'Chilled Indian Meals',
        O: '0709991000',
        G: 1,
        H: 3.15,
        N: 'RMS-GB-000094-002\u200B',
        P: 'invalid'
      }
    ]
  },
  missingNirms: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        E: 'JS Chicken Korma 400g',
        C: 'Chilled Indian Meals',
        O: '0709991000',
        G: 1,
        H: 3.15,
        N: 'RMS-GB-000094-002\u200B'
      }
    ]
  },
  nonNirms: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        E: 'JS Chicken Korma 400g',
        C: 'Chilled Indian Meals',
        O: '0709991000',
        G: 1,
        H: 3.15,
        N: 'RMS-GB-000094-002\u200B',
        P: 'no'
      },
      {
        E: 'JS TTD Gunpowder Potatoes 250g',
        C: 'Chilled Indian Meals',
        O: '1602323090',
        G: 2,
        H: 1.4,
        N: 'RMS-GB-000094-002\u200B',
        P: 'non-nirms'
      },
      {
        E: 'JS TTD Gunpowder Potatoes 500g',
        C: 'Chilled Indian Meals',
        O: '1602323090',
        G: 2,
        H: 2.8,
        N: 'RMS-GB-000094-002\u200B',
        P: 'non nirms'
      },
      {
        E: 'JS Chicken Tikka 400g',
        C: 'Chilled Indian Meals',
        O: '0709991000',
        G: 1,
        H: 3.15,
        N: 'RMS-GB-000094-002\u200B',
        P: 'red'
      },
      {
        E: 'JS Lamb Curry 400g',
        C: 'Chilled Indian Meals',
        O: '0709991000',
        G: 1,
        H: 3.15,
        N: 'RMS-GB-000094-002\u200B',
        P: 'r'
      },
      {
        E: 'JS Beef Curry 400g',
        C: 'Chilled Indian Meals',
        O: '0709991000',
        G: 1,
        H: 3.15,
        N: 'RMS-GB-000094-002\u200B',
        P: 'n'
      }
    ]
  },
  missingCoO: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS',
        Q: 'NIRMS Country of Origin'
      },
      {
        E: 'JS Chicken Korma 400g',
        C: 'Chilled Indian Meals',
        O: '0709991000',
        G: 1,
        H: 3.15,
        N: 'RMS-GB-000094-002\u200B',
        P: 'yes',
        Q: ''
      },
      {
        E: 'JS TTD Gunpowder Potatoes 250g',
        C: 'Chilled Indian Meals',
        O: '1602323090',
        G: 2,
        H: 1.4,
        N: 'RMS-GB-000094-002\u200B',
        P: 'nirms'
      },
      {
        E: 'JS Whole Cucumber',
        C: 'Fresh Vegetables',
        O: '0707000599',
        G: 5,
        H: 5,
        N: 'RMS-GB-000094-002\u200B',
        P: 'green'
      },
      {
        E: 'JS Carrots',
        C: 'Fresh Vegetables',
        O: '0706100000',
        G: 3,
        H: 3,
        N: 'RMS-GB-000094-002\u200B',
        P: 'y'
      },
      {
        E: 'JS Lettuce',
        C: 'Fresh Vegetables',
        O: '0705110000',
        G: 2,
        H: 2,
        N: 'RMS-GB-000094-002\u200B',
        P: 'g'
      }
    ]
  },
  invalidCoO: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS',
        Q: 'NIRMS Country of Origin'
      },
      {
        E: 'JS Chicken Korma 400g',
        C: 'Chilled Indian Meals',
        O: '0709991000',
        G: 1,
        H: 3.15,
        N: 'RMS-GB-000094-002\u200B',
        P: 'yes',
        Q: 'INVALID'
      },
      {
        E: 'JS TTD Gunpowder Potatoes 250g',
        C: 'Chilled Indian Meals',
        O: '1602323090',
        G: 2,
        H: 1.4,
        N: 'RMS-GB-000094-002\u200B',
        P: 'nirms',
        Q: 'INVALID'
      },
      {
        E: 'JS Whole Cucumber',
        C: 'Fresh Vegetables',
        O: '0707000599',
        G: 5,
        H: 5,
        N: 'RMS-GB-000094-002\u200B',
        P: 'green',
        Q: 'INVALID'
      },
      {
        E: 'JS Carrots',
        C: 'Fresh Vegetables',
        O: '0706100000',
        G: 3,
        H: 3,
        N: 'RMS-GB-000094-002\u200B',
        P: 'y',
        Q: 'INVALID'
      },
      {
        E: 'JS Lettuce',
        C: 'Fresh Vegetables',
        O: '0705110000',
        G: 2,
        H: 2,
        N: 'RMS-GB-000094-002\u200B',
        P: 'g',
        Q: 'INVALID'
      },
      {
        E: 'JS Spinach',
        C: 'Fresh Vegetables',
        O: '0705110000',
        G: 2,
        H: 2,
        N: 'RMS-GB-000094-002\u200B',
        P: 'no',
        Q: 'INVALID'
      }
    ]
  },
  xCoO: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS',
        Q: 'NIRMS Country of Origin'
      },
      {
        E: 'JS Chicken Korma 400g',
        C: 'Chilled Indian Meals',
        O: '0709991000',
        G: 1,
        H: 3.15,
        N: 'RMS-GB-000094-002\u200B',
        P: 'yes',
        Q: 'X'
      },
      {
        E: 'JS TTD Gunpowder Potatoes 250g',
        C: 'Chilled Indian Meals',
        O: '1602323090',
        G: 2,
        H: 1.4,
        N: 'RMS-GB-000094-002\u200B',
        P: 'nirms',
        Q: 'x'
      }
    ]
  },
  ineligibleItems: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS',
        Q: 'NIRMS Country of Origin'
      },
      {
        E: 'Mocked Ineligible Item Product',
        C: 'Ineligible Item Category',
        O: '012',
        G: 12,
        H: 12,
        N: 'RMS-GB-000094-002\u200B',
        P: 'yes',
        Q: 'INELIGIBLE_ITEM_ISO',
        J: 'INELIGIBLE_ITEM_TREATMENT'
      },
      {
        E: 'Mocked Ineligible Item Product 2',
        C: 'Ineligible Item Category',
        O: '012',
        G: 12,
        H: 12,
        N: 'RMS-GB-000094-002\u200B',
        P: 'yes',
        Q: 'INELIGIBLE_ITEM_ISO',
        J: 'NOT_INELIGIBLE_ITEM_TREATMENT'
      },
      {
        E: 'Mocked Ineligible Item Product 3',
        C: 'Ineligible Item Category',
        O: '012',
        G: 12,
        H: 12,
        N: 'RMS-GB-000094-002\u200B',
        P: 'yes',
        Q: 'INELIGIBLE_ITEM_ISO',
        J: 'INELIGIBLE_ITEM_TREATMENT'
      },
      {
        E: 'Mocked Ineligible Item Product 4',
        C: 'Ineligible Item Category',
        O: '012',
        G: 12,
        H: 12,
        N: 'RMS-GB-000094-002\u200B',
        P: 'no',
        Q: 'INELIGIBLE_ITEM_ISO'
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    Sheet1: [
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        E: 'JS Chicken Korma 400g',
        C: 'Chilled Indian Meals',
        O: '0709991000',
        G: 1,
        H: 3.15,
        N: 'RMS-GB-000094-002\u200B',
        P: 'no'
      }
    ],
    Sheet2: [
      {
        A: 'Extra row 1'
      },
      {
        C: 'Product Type / Category',
        E: 'Product / Part Number Description',
        G: 'Packages',
        H: 'Net\nWeight / Package KG',
        J: 'Type of treatment',
        N: 'RMS Number (based on depot)',
        O: 'Commodity Code',
        P: 'NIRMS or non-NIRMS'
      },
      {
        E: "Sainsbury's British Beef Mince (Typically 15% Fat) 500g",
        C: 'Meat/Fish',
        O: '0201301900',
        G: 1,
        H: 5.5,
        N: 'RMS-GB-000094-002\u200B',
        P: 'no'
      }
    ]
  }
}
