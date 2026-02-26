export default {
  validModel: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        A: 'All goods on this packing list are NIRMS'
      },
      {},
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      },
      {
        A: 'Chicken Breast',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'VALID_ISO'
      },
      {
        A: 'Beef Mince',
        B: 'Frozen',
        C: 50,
        D: 125.0,
        E: 'Fresh Meat',
        F: '0201300090',
        G: 'VALID_ISO'
      }
    ]
  },

  validModelMultipleSheets: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        A: 'All goods on this packing list are NIRMS'
      },
      {},
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      },
      {
        A: 'Chicken Breast',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'VALID_ISO'
      }
    ],
    Sheet2: [
      {
        A: 'RMS-GB-000483-002'
      },
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      },
      {
        A: 'Salmon Fillet',
        B: 'Fresh',
        C: 75,
        D: 180.0,
        E: 'Fresh Fish',
        F: '0304410090',
        G: 'VALID_ISO'
      }
    ]
  },

  modelWithBoxNumberRows: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        A: 'All goods on this packing list are NIRMS'
      },
      {},
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      },
      {
        A: 'Chicken Breast',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'VALID_ISO',
        H: ''
      },
      {
        A: 'Box 1 Contents',
        B: 'Chilled',
        C: 10,
        D: 50.0,
        E: 'Box Summary',
        F: '0207141010',
        G: 'VALID_ISO',
        H: 'BOX001'
      },
      {
        A: 'Beef Mince',
        B: 'Frozen',
        C: 50,
        D: 125.0,
        E: 'Fresh Meat',
        F: '0201300090',
        G: 'VALID_ISO'
      },
      {
        A: 'Box 2 Contents',
        B: 'Frozen',
        C: 5,
        D: 25.0,
        E: 'Box Summary',
        F: '0201300090',
        G: 'VALID_ISO',
        H: 'BOX002'
      }
    ]
  },

  emptyModel: {},

  incorrectEstablishmentNumber: {
    Sheet1: [
      {
        A: 'RMS-GB-999999-001'
      },
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      }
    ]
  },

  wrongEstablishmentMultiple: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      }
    ],
    Sheet2: [
      {
        A: 'RMS-GB-999999-001'
      },
      {
        A: 'DESCRIPTION'
      }
    ]
  },

  incorrectHeader: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        A: 'DESCRIPTION',
        B: 'WRONG HEADER',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      }
    ]
  },

  incorrectHeaderMultiple: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      }
    ],
    Sheet2: [
      {
        A: 'RMS-GB-000483-002'
      },
      {
        A: 'WRONG HEADER'
      }
    ]
  },

  invalidModel_MissingColumnCells: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        A: 'All goods on this packing list are NIRMS'
      },
      {},
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      },
      {
        A: 'Chicken Breast',
        B: null,
        C: 100,
        D: null,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'VALID_ISO'
      }
    ]
  },

  multipleRms: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        B: 'RMS-GB-000483-002'
      },
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      },
      {
        A: 'Chicken Breast',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'VALID_ISO'
      }
    ]
  },

  missingBlanketStatement: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {},
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      },
      {
        A: 'Chicken Breast',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'VALID_ISO'
      }
    ]
  },

  missingCooValues: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        A: 'All goods on this packing list are NIRMS'
      },
      {},
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      },
      {
        A: 'Chicken Breast',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: null
      }
    ]
  },

  invalidCooFormat: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        A: 'All goods on this packing list are NIRMS'
      },
      {},
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      },
      {
        A: 'Chicken Breast',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'INVALID'
      }
    ]
  },

  multipleCooErrors: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        A: 'All goods on this packing list are NIRMS'
      },
      {},
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      },
      {
        A: 'Item 1',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'INVALID1'
      },
      {
        A: 'Item 2',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'INVALID2'
      },
      {
        A: 'Item 3',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'INVALID3'
      },
      {
        A: 'Item 4',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'INVALID4'
      }
    ]
  },

  validCooModel: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        A: 'All goods on this packing list are NIRMS'
      },
      {},
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      },
      {
        A: 'Chicken Breast',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'VALID_ISO'
      }
    ]
  },

  cooPlaceholderX: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        A: 'All goods on this packing list are NIRMS'
      },
      {},
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      },
      {
        A: 'Chicken Breast',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'X'
      },
      {
        A: 'Beef Mince',
        B: 'Frozen',
        C: 50,
        D: 125.0,
        E: 'Fresh Meat',
        F: '0201300090',
        G: 'x'
      }
    ]
  },

  prohibitedItemsWithTreatment: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        A: 'All goods on this packing list are NIRMS'
      },
      {},
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      },
      {
        A: 'Russian Beef',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Meat',
        F: '0201',
        G: 'INELIGIBLE_ITEM_ISO'
      }
    ]
  },

  prohibitedItemsMultiple: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        A: 'All goods on this packing list are NIRMS'
      },
      {},
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      },
      {
        A: 'Russian Beef 1',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Meat',
        F: '0201',
        G: 'INELIGIBLE_ITEM_ISO'
      },
      {
        A: 'Russian Beef 2',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Meat',
        F: '0201',
        G: 'INELIGIBLE_ITEM_ISO'
      },
      {
        A: 'Russian Beef 3',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Meat',
        F: '0201',
        G: 'INELIGIBLE_ITEM_ISO'
      },
      {
        A: 'Russian Beef 4',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Meat',
        F: '0201',
        G: 'INELIGIBLE_ITEM_ISO'
      }
    ]
  },

  prohibitedItemsWithoutTreatment: {
    Sheet1: [
      {
        A: 'RMS-GB-000483-001'
      },
      {
        A: 'All goods on this packing list are NIRMS'
      },
      {},
      {
        A: 'DESCRIPTION',
        B: 'TYPE OF TREATMENT',
        C: 'NUMBER OF PACKS',
        D: 'NET WEIGHT (KG)',
        E: 'NATURE',
        F: 'COMMODITY CODE',
        G: 'COUNTRY OF ORIGIN',
        H: 'BOX NUMBER'
      },
      {
        A: 'Russian Beef',
        B: null,
        C: 100,
        D: 250.5,
        E: 'Fresh Meat',
        F: '0201',
        G: 'INELIGIBLE_ITEM_ISO'
      }
    ]
  }
}
