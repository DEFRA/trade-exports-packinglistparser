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
        G: 'VALID_ISO',
        H: 'BOX002'
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
        G: 'VALID_ISO',
        H: 'BOX001'
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
        G: 'VALID_ISO',
        H: 'BOX003'
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
        G: 'VALID_ISO',
        H: 'BOX001'
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
        G: 'VALID_ISO',
        H: 'BOX001'
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
        G: 'VALID_ISO',
        H: 'BOX001'
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
        G: null,
        H: 'BOX001'
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
        G: 'INVALID',
        H: 'BOX001'
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
        G: 'INVALID1',
        H: 'BOX001'
      },
      {
        A: 'Item 2',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'INVALID2',
        H: 'BOX002'
      },
      {
        A: 'Item 3',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'INVALID3',
        H: 'BOX003'
      },
      {
        A: 'Item 4',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Poultry',
        F: '0207141010',
        G: 'INVALID4',
        H: 'BOX004'
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
        G: 'VALID_ISO',
        H: 'BOX001'
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
        G: 'X',
        H: 'BOX001'
      },
      {
        A: 'Beef Mince',
        B: 'Frozen',
        C: 50,
        D: 125.0,
        E: 'Fresh Meat',
        F: '0201300090',
        G: 'x',
        H: 'BOX002'
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
        G: 'INELIGIBLE_ITEM_ISO',
        H: 'BOX001'
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
        G: 'INELIGIBLE_ITEM_ISO',
        H: 'BOX001'
      },
      {
        A: 'Russian Beef 2',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Meat',
        F: '0201',
        G: 'INELIGIBLE_ITEM_ISO',
        H: 'BOX002'
      },
      {
        A: 'Russian Beef 3',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Meat',
        F: '0201',
        G: 'INELIGIBLE_ITEM_ISO',
        H: 'BOX003'
      },
      {
        A: 'Russian Beef 4',
        B: 'Chilled',
        C: 100,
        D: 250.5,
        E: 'Fresh Meat',
        F: '0201',
        G: 'INELIGIBLE_ITEM_ISO',
        H: 'BOX004'
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
        G: 'INELIGIBLE_ITEM_ISO',
        H: 'BOX001'
      }
    ]
  }
}
