/**
 * Manfreight Model 1 test data
 *
 * Test packing list structures used by matcher, parser, and integration tests.
 *
 * Column mapping:
 *   A: RMS Number (Establishment Number)
 *   B: Commodity Code
 *   C: Description of goods
 *   D: No. of pkgs
 *   E: Total Net Weight (kg)
 *   F: Nature of Product
 *   G: Type of Treatment
 *   H: Country of Origin
 *   I: Nirms/ Non Nirms
 */
export default {
  validModel: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0207130000',
        C: 'Fresh Chicken Breast 500g',
        D: 5.0,
        E: 10,
        F: 'Poultry',
        G: 'Chilled',
        H: 'GB',
        I: 'Non-Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0203190090',
        C: 'Pork Loin 1kg',
        D: 5.0,
        E: 5,
        F: 'Meat',
        G: 'Chilled',
        H: 'GB',
        I: 'Non-Nirms'
      }
    ]
  },
  validModelWithFooterRow: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0207130000',
        C: 'Fresh Chicken Breast 500g',
        D: 5.0,
        E: 10,
        F: 'Poultry',
        G: 'Chilled',
        H: 'GB',
        I: 'Non-Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0203190090',
        C: 'Pork Loin 1kg',
        D: 5.0,
        E: 5,
        F: 'Meat',
        G: 'Chilled',
        H: 'GB',
        I: 'Non-Nirms'
      },
      {
        D: 10.0,
        E: 15
      }
    ]
  },
  validModelWithInvalidSheet: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0207130000',
        C: 'Fresh Chicken Breast 500g',
        D: 5.0,
        E: 10,
        F: 'Poultry',
        G: 'Chilled',
        H: 'GB',
        I: 'Non-Nirms'
      }
    ],
    Sheet2: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0203190090',
        C: 'Pork Loin 1kg',
        D: 5.0,
        E: 5,
        F: 'Meat',
        G: 'Chilled',
        H: 'GB',
        I: 'Non-Nirms'
      }
    ]
  },
  validHeadersNoData: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0207130000',
        C: 'Fresh Chicken Breast 500g',
        D: 5.0,
        E: 10,
        F: 'Poultry',
        G: 'Chilled',
        H: 'GB',
        I: 'Non-Nirms'
      }
    ],
    Sheet3: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0203190090',
        C: 'Pork Loin 1kg',
        D: 5.0,
        E: 5,
        F: 'Meat',
        G: 'Chilled',
        H: 'GB',
        I: 'Non-Nirms'
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0207130000',
        C: 'Fresh Chicken Breast 500g',
        D: 5.0,
        E: 10,
        F: 'Poultry',
        G: 'Chilled',
        H: 'GB',
        I: 'Non-Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0203190090',
        C: 'Pork Loin 1kg',
        E: 5,
        F: 'Meat',
        G: 'Chilled',
        H: 'GB',
        I: 'Non-Nirms'
      }
    ]
  },
  emptyModel: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001'
      }
    ]
  },
  wrongEstablishment: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'WRONG-ESTABLISHMENT'
      }
    ]
  },
  wrongEstablishmentMultiple: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001'
      }
    ],
    Sheet3: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'WRONG-ESTABLISHMENT'
      }
    ]
  },
  incorrectHeader: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'NOT_CORRECT',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001'
      }
    ]
  },
  incorrectHeaderMultiple: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001'
      }
    ],
    Sheet3: [
      {
        A: 'RMS Number',
        B: 'NOT_CORRECT',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001'
      }
    ]
  },
  multipleRms: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0207130000',
        C: 'Fresh Chicken Breast 500g',
        D: 5.0,
        E: 10,
        F: 'Poultry',
        G: 'Chilled',
        H: 'GB',
        I: 'Non-Nirms'
      },
      {
        A: 'RMS-GB-000013-002',
        B: '0203190090',
        C: 'Pork Loin 1kg',
        D: 5.0,
        E: 5,
        F: 'Meat',
        G: 'Chilled',
        H: 'GB',
        I: 'Non-Nirms'
      }
    ]
  },
  missingKgunit: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0207130000',
        C: 'Fresh Chicken Breast 500g',
        D: 5.0,
        E: 10,
        F: 'Poultry',
        G: 'Chilled',
        H: 'GB',
        I: 'Non-Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0203190090',
        C: 'Pork Loin 1kg',
        D: 5.0,
        E: 5,
        F: 'Meat',
        G: 'Chilled',
        H: 'GB',
        I: 'Non-Nirms'
      }
    ]
  },
  invalidNirms: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0207130000',
        C: 'Fresh Chicken Breast 500g',
        D: 5.0,
        E: 10,
        F: 'Poultry',
        G: 'Chilled',
        H: 'GB',
        I: 'invalid'
      }
    ]
  },
  missingNirms: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0207130000',
        C: 'Fresh Chicken Breast 500g',
        D: 5.0,
        E: 10,
        F: 'Poultry',
        G: 'Chilled',
        H: 'GB'
      }
    ]
  },
  nonNirmsModel: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0207130000',
        C: 'Fresh Chicken Breast 500g',
        D: 5.0,
        E: 10,
        F: 'Poultry',
        G: 'Chilled',
        H: 'GB',
        I: 'Non-Nirms'
      }
    ]
  },
  nullNirmsModel: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0207130000',
        C: 'Fresh Chicken Breast 500g',
        D: 5.0,
        E: 10,
        F: 'Poultry',
        G: 'Chilled',
        H: 'GB',
        I: null
      }
    ]
  },
  invalidNirmsModel: {
    Sheet1: [
      {
        A: 'RMS Number',
        B: 'Commodity Code',
        C: 'Description of goods',
        D: 'Total Net Weight (kg)',
        E: 'No. of pkgs',
        F: 'Nature of Product',
        G: 'Type of Treatment',
        H: 'Country of Origin',
        I: 'Nirms/ Non Nirms'
      },
      {
        A: 'RMS-GB-000013-001',
        B: '0207130000',
        C: 'Fresh Chicken Breast 500g',
        D: 5.0,
        E: 10,
        F: 'Poultry',
        G: 'Chilled',
        H: 'GB',
        I: 'invalid-value'
      }
    ]
  }
}
