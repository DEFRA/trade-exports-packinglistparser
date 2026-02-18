/**
 * Tesco Model 2 test data
 */

export default {
  validModel: {
    Sheet2: [
      {
        A: 'Item',
        B: 'Product code',
        C: 'Commodity code',
        D: 'Online Check',
        E: 'Meursing code',
        F: 'Description of goods',
        G: 'Country of Origin',
        H: 'No. of pkgs',
        I: 'Type of pkgs',
        J: 'Total Gross Weight',
        K: 'Total Net Weight',
        L: 'Total Line Value',
        M: 'Nature of Product (Chilled /Ambient/ Frozen)',
        N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
        O: 'NIRMS / Non NIRMS',
        P: 'GB Establishment RMS Number'
      },
      {
        K: '12kgs'
      },
      {
        A: '1',
        B: '035557763',
        C: '0804500000',
        D: '',
        E: '',
        F: 'Tesco Mango ME BOS (120g x 8)7-8-20-36-39-77',
        G: 'BR',
        H: '4',
        I: 'cases',
        J: '4.646',
        K: '3.84',
        L: '31.36',
        M: 'Chilled',
        N: 'Processed',
        O: 'NIRMS',
        P: 'RMS-GB-000015-009'
      },
      {
        A: '2',
        B: '037500770',
        C: '0804500000',
        D: '',
        E: '',
        F: 'Tesco Mango ME BOS (250g x 8)13-14-23-32-42-80',
        G: 'BR',
        H: '28',
        I: 'cases',
        J: '134.4',
        K: '56',
        L: '425.6',
        M: 'Chilled',
        N: 'Processed',
        O: 'NIRMS',
        P: 'RMS-GB-000015-009'
      }
    ]
  },
  validHeadersNoData: {
    Sheet2: [
      {
        A: 'Item',
        B: 'Product code',
        C: 'Commodity code',
        D: 'Online Check',
        E: 'Meursing code',
        F: 'Description of goods',
        G: 'Country of Origin',
        H: 'No. of pkgs',
        I: 'Type of pkgs',
        J: 'Total Gross Weight',
        K: 'Total Net Weight',
        L: 'Total Line Value',
        M: 'GB Establishment RMS Number'
      },
      {
        K: '12kgs'
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      {
        A: 'Item',
        B: 'Product code',
        C: 'Commodity code',
        D: 'Online Check',
        E: 'Meursing code',
        F: 'Description of goods',
        G: 'Country of Origin',
        H: 'No. of pkgs',
        I: 'Type of pkgs',
        J: 'Total Gross Weight',
        K: 'Total Net Weight',
        L: 'Total Line Value',
        M: 'Nature of Product (Chilled /Ambient/ Frozen)',
        N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
        O: 'NIRMS / Non NIRMS',
        P: 'GB Establishment RMS Number'
      },
      {
        K: '12kgs'
      },
      {
        A: '1',
        B: '90930140',
        C: '0709200010',
        D: '',
        E: '',
        F: 'TS Asp Bundles 180g',
        G: 'GB',
        H: '144',
        I: 'Tray',
        J: '27.216',
        K: '25.92',
        L: '72',
        M: 'Chilled',
        N: 'Raw',
        O: 'NIRMS',
        P: 'RMS-GB-000015-009'
      }
    ],
    Sheet2: [
      {
        A: 'Item',
        B: 'Product code',
        C: 'Commodity code',
        D: 'Online Check',
        E: 'Meursing code',
        F: 'Description of goods',
        G: 'Country of Origin',
        H: 'No. of pkgs',
        I: 'Type of pkgs',
        J: 'Total Gross Weight',
        K: 'Total Net Weight',
        L: 'Total Line Value',
        M: 'Nature of Product (Chilled /Ambient/ Frozen)',
        N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
        O: 'NIRMS / Non NIRMS',
        P: 'GB Establishment RMS Number'
      },
      {
        K: 'kgs'
      },
      {
        A: '2',
        B: '81827872',
        C: '0709200010',
        D: '',
        E: '',
        F: 'TS Asp Tips Exp 125g',
        G: 'PE',
        H: '90',
        I: 'Tray',
        J: '11.813',
        K: '11.25',
        L: '45',
        M: 'Chilled',
        N: 'Raw',
        O: 'Non NIRMS',
        P: 'RMS-GB-000015-009'
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    Sheet2: [
      {
        A: 'Item',
        B: 'Product code',
        C: 'Commodity code',
        D: 'Online Check',
        E: 'Meursing code',
        F: 'Description of goods',
        G: 'Country of Origin',
        H: 'No. of pkgs',
        I: 'Type of pkgs',
        J: 'Total Gross Weight',
        K: 'Total Net Weight',
        L: 'Total Line Value',
        M: 'Nature of Product (Chilled /Ambient/ Frozen)',
        N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
        O: 'NIRMS / Non NIRMS',
        P: 'GB Establishment RMS Number'
      },
      {
        K: '12kgs'
      },
      {
        A: '1',
        B: '035557763',
        C: '0804500000',
        D: '',
        E: '',
        F: 'Tesco Mango ME BOS (120g x 8)7-8-20-36-39-77',
        G: 'BR',
        H: '4',
        I: 'cases',
        J: '4.646',
        K: null,
        L: '31.36',
        M: 'Chilled',
        N: 'Processed',
        O: 'NIRMS',
        P: 'RMS-GB-000015-009'
      },
      {
        A: '2',
        B: '037500770',
        C: null,
        D: '',
        E: '',
        F: 'Tesco Mango ME BOS (250g x 8)13-14-23-32-42-80',
        G: 'BR',
        H: '28',
        I: 'cases',
        J: '134.4',
        K: '56',
        L: '425.6',
        M: 'Chilled',
        N: 'Processed',
        O: 'NIRMS',
        P: 'RMS-GB-000015-009'
      }
    ]
  },
  wrongEstablishment: {
    Sheet1: [
      {},
      {},
      {
        M: 'INCORRECT'
      }
    ]
  },
  wrongEstablishmentMultiple: {
    Sheet1: [
      {
        A: 'Item',
        B: 'Product code',
        C: 'Commodity code',
        D: 'Online Check',
        E: 'Meursing code',
        F: 'Description of goods',
        G: 'Country of Origin',
        H: 'No. of pkgs',
        I: 'Type of pkgs',
        J: 'Total Gross Weight',
        K: 'Total Net Weight',
        L: 'Total Line Value',
        M: 'Nature of Product (Chilled /Ambient/ Frozen)',
        N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
        O: 'NIRMS / Non NIRMS',
        P: 'GB Establishment RMS Number'
      },
      {
        K: '12kgs'
      },
      {
        P: 'RMS-GB-000015-009'
      }
    ],
    Sheet2: [
      {
        A: 'Item',
        B: 'Product code',
        C: 'Commodity code',
        D: 'Online Check',
        E: 'Meursing code',
        F: 'Description of goods',
        G: 'Country of Origin',
        H: 'No. of pkgs',
        I: 'Type of pkgs',
        J: 'Total Gross Weight',
        K: 'Total Net Weight',
        L: 'Total Line Value',
        M: 'Nature of Product (Chilled /Ambient/ Frozen)',
        N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
        O: 'NIRMS / Non NIRMS',
        P: 'GB Establishment RMS Number'
      },
      {},
      {
        P: 'INCORRECT'
      }
    ]
  },
  incorrectHeader: {
    Sheet1: [
      {
        F: 'NOT',
        H: 'CORRECT',
        K: 'HEADER'
      },
      {},
      {
        M: 'RMS-GB-000015-009'
      }
    ]
  },
  incorrectHeaderMultiple: {
    Sheet1: [
      {
        F: 'Description of goods',
        H: 'No. of pkgs',
        K: 'Total Net Weight'
      },
      {},
      {
        M: 'RMS-GB-000015-009'
      }
    ],
    Sheet2: [
      {
        F: 'NOT',
        H: 'CORRECT',
        K: 'HEADER'
      },
      {},
      {
        M: 'RMS-GB-000015-009'
      }
    ]
  },
  emptyModel: {
    Sheet1: []
  },
  multipleRms: {
    Sheet2: [
      {
        A: 'Item',
        B: 'Product code',
        C: 'Commodity code',
        D: 'Online Check',
        E: 'Meursing code',
        F: 'Description of goods',
        G: 'Country of Origin',
        H: 'No. of pkgs',
        I: 'Type of pkgs',
        J: 'Total Gross Weight',
        K: 'Total Net Weight',
        L: 'Total Line Value',
        M: 'Nature of Product (Chilled /Ambient/ Frozen)',
        N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
        O: 'NIRMS / Non NIRMS',
        P: 'GB Establishment RMS Number'
      },
      {
        K: '12kgs'
      },
      {
        A: '1',
        B: '035557763',
        C: '0804500000',
        D: '',
        E: '',
        F: 'Tesco Mango ME BOS (120g x 8)7-8-20-36-39-77',
        G: 'BR',
        H: '4',
        I: 'cases',
        J: '4.646',
        K: '3.84',
        L: '31.36',
        M: 'Chilled',
        N: 'Processed',
        O: 'NIRMS',
        P: 'RMS-GB-000015-009'
      },
      {
        A: '2',
        B: '037500770',
        C: '0804500000',
        D: '',
        E: '',
        F: 'Tesco Mango ME BOS (250g x 8)13-14-23-32-42-80',
        G: 'BR',
        H: '28',
        I: 'cases',
        J: '134.4',
        K: '56',
        L: '425.6',
        M: 'Chilled',
        N: 'Processed',
        O: 'NIRMS',
        P: 'RMS-GB-000015-010'
      }
    ]
  },
  missingKgunit: {
    Sheet2: [
      {
        A: 'Item',
        B: 'Product code',
        C: 'Commodity code',
        D: 'Online Check',
        E: 'Meursing code',
        F: 'Description of goods',
        G: 'Country of Origin',
        H: 'No. of pkgs',
        I: 'Type of pkgs',
        J: 'Total Gross Weight',
        K: 'Total Net Weight',
        L: 'Total Line Value',
        M: 'Nature of Product (Chilled /Ambient/ Frozen)',
        N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
        O: 'NIRMS / Non NIRMS',
        P: 'GB Establishment RMS Number'
      },
      {
        K: '12'
      },
      {
        A: '1',
        B: '035557763',
        C: '0804500000',
        D: '',
        E: '',
        F: 'Tesco Mango ME BOS (120g x 8)7-8-20-36-39-77',
        G: 'BR',
        H: '4',
        I: 'cases',
        J: '4.646',
        K: '3.84',
        L: '31.36',
        M: 'Chilled',
        N: 'Processed',
        O: 'NIRMS',
        P: 'RMS-GB-000015-009'
      },
      {
        A: '2',
        B: '037500770',
        C: '0804500000',
        D: '',
        E: '',
        F: 'Tesco Mango ME BOS (250g x 8)13-14-23-32-42-80',
        G: 'BR',
        H: '28',
        I: 'cases',
        J: '134.4',
        K: '56',
        L: '425.6',
        M: 'Chilled',
        N: 'Processed',
        O: 'NIRMS',
        P: 'RMS-GB-000015-009'
      }
    ]
  },
  missingRow: {
    Sheet2: [
      {
        A: 'Item',
        B: 'Product code',
        C: 'Commodity code',
        D: 'Online Check',
        E: 'Meursing code',
        F: 'Description of goods',
        G: 'Country of Origin',
        H: 'No. of pkgs',
        I: 'Type of pkgs',
        J: 'Total Gross Weight',
        K: 'Total Net Weight',
        L: 'Total Line Value',
        M: 'Nature of Product (Chilled /Ambient/ Frozen)',
        N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
        O: 'NIRMS / Non NIRMS',
        P: 'GB Establishment RMS Number'
      },
      {
        K: 'KG'
      },
      {
        A: '1',
        B: '035557763',
        C: '0804500000',
        D: '',
        E: '',
        F: 'Tesco Mango ME BOS (120g x 8)7-8-20-36-39-77',
        G: 'BR',
        H: '4',
        I: 'cases',
        J: '4.646',
        K: '3.84',
        L: '31.36',
        M: 'Chilled',
        N: 'Processed',
        O: 'NIRMS',
        P: 'RMS-GB-000015-009'
      },
      {
        A: null,
        B: null,
        C: null,
        D: null,
        E: null,
        F: null,
        G: null,
        H: null,
        I: null,
        J: null,
        K: null,
        L: null,
        M: null,
        N: null,
        O: null,
        P: null
      }
    ]
  },

  // === Country of Origin (CoO) Validation Test Data ===

  // Base Tesco2 structure with CoO validation fields for helper function
  baseTesco2Structure: {
    Sheet2: [
      {
        A: 'Item',
        B: 'Product code',
        C: 'Commodity code',
        D: 'Online Check',
        E: 'Meursing code',
        F: 'Description of goods',
        G: 'Country of Origin',
        H: 'No. of pkgs',
        I: 'Type of pkgs',
        J: 'Total Gross Weight',
        K: 'Total Net Weight',
        L: 'Total Line Value',
        M: 'Nature of Product (Chilled /Ambient/ Frozen)',
        N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
        O: 'NIRMS / Non NIRMS',
        P: 'GB Establishment RMS Number'
      },
      {
        K: 'kgs'
      }
    ]
  },

  // BAC1: NOT within NIRMS Scheme
  nonNirmsModel: (() => {
    const data = JSON.parse(
      JSON.stringify({
        Sheet2: [
          {
            A: 'Item',
            B: 'Product code',
            C: 'Commodity code',
            D: 'Online Check',
            E: 'Meursing code',
            F: 'Description of goods',
            G: 'Country of Origin',
            H: 'No. of pkgs',
            I: 'Type of pkgs',
            J: 'Total Gross Weight',
            K: 'Total Net Weight',
            L: 'Total Line Value',
            M: 'Nature of Product (Chilled /Ambient/ Frozen)',
            N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
            O: 'NIRMS / Non NIRMS',
            P: 'GB Establishment RMS Number'
          },
          {
            K: '5.00kgs'
          },
          {
            A: 1,
            B: 'TEST001',
            C: '0123456789',
            D: '',
            E: '',
            F: 'Test Product',
            G: 'GB',
            H: '10',
            I: 'Box',
            J: '5.50',
            K: '5.00',
            L: '25',
            M: 'Chilled',
            N: 'Raw',
            O: 'Non NIRMS',
            P: 'RMS-GB-000015-009'
          }
        ]
      })
    )
    return data
  })(),

  // BAC2: Null NIRMS value
  nullNirmsModel: (() => {
    const data = JSON.parse(
      JSON.stringify({
        Sheet2: [
          {
            A: 'Item',
            B: 'Product code',
            C: 'Commodity code',
            D: 'Online Check',
            E: 'Meursing code',
            F: 'Description of goods',
            G: 'Country of Origin',
            H: 'No. of pkgs',
            I: 'Type of pkgs',
            J: 'Total Gross Weight',
            K: 'Total Net Weight',
            L: 'Total Line Value',
            M: 'Nature of Product (Chilled /Ambient/ Frozen)',
            N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
            O: 'NIRMS / Non NIRMS',
            P: 'GB Establishment RMS Number'
          },
          { K: 'kgs' },
          { P: 'RMS-GB-000015-009' },
          {
            A: 1,
            B: 'TEST001',
            C: '0123456789',
            F: 'Test Product',
            G: 'GB',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: null
          }
        ]
      })
    )
    return data
  })(),

  // BAC3: Invalid NIRMS value
  invalidNirmsModel: (() => {
    const data = JSON.parse(
      JSON.stringify({
        Sheet2: [
          {
            A: 'Item',
            B: 'Product code',
            C: 'Commodity code',
            D: 'Online Check',
            E: 'Meursing code',
            F: 'Description of goods',
            G: 'Country of Origin',
            H: 'No. of pkgs',
            I: 'Type of pkgs',
            J: 'Total Gross Weight',
            K: 'Total Net Weight',
            L: 'Total Line Value',
            M: 'Nature of Product (Chilled /Ambient/ Frozen)',
            N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
            O: 'NIRMS / Non NIRMS',
            P: 'GB Establishment RMS Number'
          },
          { K: 'kgs' },
          { P: 'RMS-GB-000015-009' },
          {
            A: 1,
            B: 'TEST001',
            C: '0123456789',
            F: 'Test Product',
            G: 'GB',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: 'INVALID_NIRMS'
          }
        ]
      })
    )
    return data
  })(),

  // BAC4: Null NIRMS value, more than 3
  nullNirmsMultipleModel: (() => {
    const data = JSON.parse(
      JSON.stringify({
        Sheet2: [
          {
            A: 'Item',
            B: 'Product code',
            C: 'Commodity code',
            D: 'Online Check',
            E: 'Meursing code',
            F: 'Description of goods',
            G: 'Country of Origin',
            H: 'No. of pkgs',
            I: 'Type of pkgs',
            J: 'Total Gross Weight',
            K: 'Total Net Weight',
            L: 'Total Line Value',
            M: 'Nature of Product (Chilled /Ambient/ Frozen)',
            N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
            O: 'NIRMS / Non NIRMS',
            P: 'GB Establishment RMS Number'
          },
          { K: 'kgs' },
          { P: 'RMS-GB-000015-009' },
          {
            A: 1,
            B: 'TEST001',
            C: '0123456789',
            F: 'Test Product',
            G: 'GB',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: null
          },
          {
            A: 2,
            B: 'TEST001',
            C: '0123456790',
            F: 'Test Product',
            G: 'GB',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: null
          },
          {
            A: 3,
            B: 'TEST001',
            C: '0123456791',
            F: 'Test Product',
            G: 'GB',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: null
          },
          {
            A: 4,
            B: 'TEST001',
            C: '0123456792',
            F: 'Test Product',
            G: 'GB',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: null
          }
        ]
      })
    )
    return data
  })(),

  // BAC5: Invalid NIRMS value, more than 3
  invalidNirmsMultipleModel: (() => {
    const data = JSON.parse(
      JSON.stringify({
        Sheet2: [
          {
            A: 'Item',
            B: 'Product code',
            C: 'Commodity code',
            D: 'Online Check',
            E: 'Meursing code',
            F: 'Description of goods',
            G: 'Country of Origin',
            H: 'No. of pkgs',
            I: 'Type of pkgs',
            J: 'Total Gross Weight',
            K: 'Total Net Weight',
            L: 'Total Line Value',
            M: 'Nature of Product (Chilled /Ambient/ Frozen)',
            N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
            O: 'NIRMS / Non NIRMS',
            P: 'GB Establishment RMS Number'
          },
          { K: 'kgs' },
          { P: 'RMS-GB-000015-009' },
          {
            A: 1,
            B: 'TEST001',
            C: '0123456789',
            F: 'Test Product',
            G: 'GB',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: 'INVALID'
          },
          {
            A: 2,
            B: 'TEST001',
            C: '0123456790',
            F: 'Test Product',
            G: 'GB',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: 'INVALID'
          },
          {
            A: 3,
            B: 'TEST001',
            C: '0123456791',
            F: 'Test Product',
            G: 'GB',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: 'INVALID'
          },
          {
            A: 4,
            B: 'TEST001',
            C: '0123456792',
            F: 'Test Product',
            G: 'GB',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: 'INVALID'
          }
        ]
      })
    )
    return data
  })(),

  // BAC6: Null CoO Value
  nullCooModel: (() => {
    const data = JSON.parse(
      JSON.stringify({
        Sheet2: [
          {
            A: 'Item',
            B: 'Product code',
            C: 'Commodity code',
            D: 'Online Check',
            E: 'Meursing code',
            F: 'Description of goods',
            G: 'Country of Origin',
            H: 'No. of pkgs',
            I: 'Type of pkgs',
            J: 'Total Gross Weight',
            K: 'Total Net Weight',
            L: 'Total Line Value',
            M: 'Nature of Product (Chilled /Ambient/ Frozen)',
            N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
            O: 'NIRMS / Non NIRMS',
            P: 'GB Establishment RMS Number'
          },
          { K: 'kgs' },
          { P: 'RMS-GB-000015-009' },
          {
            A: 1,
            B: 'TEST001',
            C: '0123456789',
            F: 'Test Product',
            G: null,
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: 'NIRMS'
          }
        ]
      })
    )
    return data
  })(),

  // BAC7: Invalid CoO Value
  invalidCooModel: (() => {
    const data = JSON.parse(
      JSON.stringify({
        Sheet2: [
          {
            A: 'Item',
            B: 'Product code',
            C: 'Commodity code',
            D: 'Online Check',
            E: 'Meursing code',
            F: 'Description of goods',
            G: 'Country of Origin',
            H: 'No. of pkgs',
            I: 'Type of pkgs',
            J: 'Total Gross Weight',
            K: 'Total Net Weight',
            L: 'Total Line Value',
            M: 'Nature of Product (Chilled /Ambient/ Frozen)',
            N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
            O: 'NIRMS / Non NIRMS',
            P: 'GB Establishment RMS Number'
          },
          { K: 'kgs' },
          { P: 'RMS-GB-000015-009' },
          {
            A: 1,
            B: 'TEST001',
            C: '0123456789',
            F: 'Test Product',
            G: 'INVALID_ISO',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: 'NIRMS'
          }
        ]
      })
    )
    return data
  })(),

  // BAC8: Null CoO Value, more than 3
  nullCooMultipleModel: (() => {
    const data = JSON.parse(
      JSON.stringify({
        Sheet2: [
          {
            A: 'Item',
            B: 'Product code',
            C: 'Commodity code',
            D: 'Online Check',
            E: 'Meursing code',
            F: 'Description of goods',
            G: 'Country of Origin',
            H: 'No. of pkgs',
            I: 'Type of pkgs',
            J: 'Total Gross Weight',
            K: 'Total Net Weight',
            L: 'Total Line Value',
            M: 'Nature of Product (Chilled /Ambient/ Frozen)',
            N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
            O: 'NIRMS / Non NIRMS',
            P: 'GB Establishment RMS Number'
          },
          { K: 'kgs' },
          { P: 'RMS-GB-000015-009' },
          {
            A: 1,
            B: 'TEST001',
            C: '0123456789',
            F: 'Test Product',
            G: null,
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: 'NIRMS'
          },
          {
            A: 2,
            B: 'TEST001',
            C: '0123456790',
            F: 'Test Product',
            G: null,
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: 'NIRMS'
          },
          {
            A: 3,
            B: 'TEST001',
            C: '0123456791',
            F: 'Test Product',
            G: null,
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: 'NIRMS'
          },
          {
            A: 4,
            B: 'TEST001',
            C: '0123456792',
            F: 'Test Product',
            G: null,
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: 'NIRMS'
          }
        ]
      })
    )
    return data
  })(),

  // BAC9: Invalid CoO Value, more than 3
  invalidCooMultipleModel: (() => {
    const data = JSON.parse(
      JSON.stringify({
        Sheet2: [
          {
            A: 'Item',
            B: 'Product code',
            C: 'Commodity code',
            D: 'Online Check',
            E: 'Meursing code',
            F: 'Description of goods',
            G: 'Country of Origin',
            H: 'No. of pkgs',
            I: 'Type of pkgs',
            J: 'Total Gross Weight',
            K: 'Total Net Weight',
            L: 'Total Line Value',
            M: 'Nature of Product (Chilled /Ambient/ Frozen)',
            N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
            O: 'NIRMS / Non NIRMS',
            P: 'GB Establishment RMS Number'
          },
          { K: 'kgs' },
          { P: 'RMS-GB-000015-009' },
          {
            A: 1,
            B: 'TEST001',
            C: '0123456789',
            F: 'Test Product',
            G: 'INVALID',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: 'NIRMS'
          },
          {
            A: 2,
            B: 'TEST001',
            C: '0123456790',
            F: 'Test Product',
            G: 'INVALID',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: 'NIRMS'
          },
          {
            A: 3,
            B: 'TEST001',
            C: '0123456791',
            F: 'Test Product',
            G: 'INVALID',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: 'NIRMS'
          },
          {
            A: 4,
            B: 'TEST001',
            C: '0123456792',
            F: 'Test Product',
            G: 'INVALID',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Raw',
            O: 'NIRMS'
          }
        ]
      })
    )
    return data
  })(),

  // BAC10: CoO Value is X or x
  cooPlaceholderXModel: (() => {
    const data = JSON.parse(
      JSON.stringify({
        Sheet2: [
          {
            A: 'Item',
            B: 'Product code',
            C: 'Commodity code',
            D: 'Online Check',
            E: 'Meursing code',
            F: 'Description of goods',
            G: 'Country of Origin',
            H: 'No. of pkgs',
            I: 'Type of pkgs',
            J: 'Total Gross Weight',
            K: 'Total Net Weight',
            L: 'Total Line Value',
            M: 'Nature of Product (Chilled /Ambient/ Frozen)',
            N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
            O: 'NIRMS / Non NIRMS',
            P: 'GB Establishment RMS Number'
          },
          {
            K: '5.00kgs'
          },
          {
            A: 1,
            B: 'TEST001',
            C: '0123456789',
            D: '',
            E: '',
            F: 'Test Product',
            G: 'X',
            H: '10',
            I: 'Box',
            J: '5.50',
            K: '5.00',
            L: '25',
            M: 'Chilled',
            N: 'Raw',
            O: 'NIRMS',
            P: 'RMS-GB-000015-009'
          }
        ]
      })
    )
    return data
  })(),

  // BAC11: Item Present on Prohibited Item List (Treatment Type specified)
  prohibitedItemsWithTreatmentModel: (() => {
    const data = JSON.parse(
      JSON.stringify({
        Sheet2: [
          {
            A: 'Item',
            B: 'Product code',
            C: 'Commodity code',
            D: 'Online Check',
            E: 'Meursing code',
            F: 'Description of goods',
            G: 'Country of Origin',
            H: 'No. of pkgs',
            I: 'Type of pkgs',
            J: 'Total Gross Weight',
            K: 'Total Net Weight',
            L: 'Total Line Value',
            M: 'Nature of Product (Chilled /Ambient/ Frozen)',
            N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
            O: 'NIRMS / Non NIRMS',
            P: 'GB Establishment RMS Number'
          },
          { K: 'kgs' },
          { P: 'RMS-GB-000015-009' },
          {
            A: 1,
            B: 'TEST001',
            C: '1234',
            F: 'Test Product',
            G: 'PROHIBITED_ITEM_ISO',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Processed',
            O: 'NIRMS'
          }
        ]
      })
    )
    return data
  })(),

  // BAC12: Item Present on Prohibited Item List, more than 3 (Treatment Type specified)
  prohibitedItemsMultipleWithTreatmentModel: (() => {
    const data = JSON.parse(
      JSON.stringify({
        Sheet2: [
          {
            A: 'Item',
            B: 'Product code',
            C: 'Commodity code',
            D: 'Online Check',
            E: 'Meursing code',
            F: 'Description of goods',
            G: 'Country of Origin',
            H: 'No. of pkgs',
            I: 'Type of pkgs',
            J: 'Total Gross Weight',
            K: 'Total Net Weight',
            L: 'Total Line Value',
            M: 'Nature of Product (Chilled /Ambient/ Frozen)',
            N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
            O: 'NIRMS / Non NIRMS',
            P: 'GB Establishment RMS Number'
          },
          { K: 'kgs' },
          { P: 'RMS-GB-000015-009' },
          {
            A: 1,
            B: 'TEST001',
            C: '1234',
            F: 'Test Product',
            G: 'PROHIBITED_ITEM_ISO',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Processed',
            O: 'NIRMS'
          },
          {
            A: 2,
            B: 'TEST001',
            C: '1234',
            F: 'Test Product',
            G: 'PROHIBITED_ITEM_ISO',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Processed',
            O: 'NIRMS'
          },
          {
            A: 3,
            B: 'TEST001',
            C: '1234',
            F: 'Test Product',
            G: 'PROHIBITED_ITEM_ISO',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Processed',
            O: 'NIRMS'
          },
          {
            A: 4,
            B: 'TEST001',
            C: '1234',
            F: 'Test Product',
            G: 'PROHIBITED_ITEM_ISO',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: 'Processed',
            O: 'NIRMS'
          }
        ]
      })
    )
    return data
  })(),

  // BAC13: Item Present on Prohibited Item List (no Treatment Type specified)
  prohibitedItemsNoTreatmentModel: (() => {
    const data = JSON.parse(
      JSON.stringify({
        Sheet2: [
          {
            A: 'Item',
            B: 'Product code',
            C: 'Commodity code',
            D: 'Online Check',
            E: 'Meursing code',
            F: 'Description of goods',
            G: 'Country of Origin',
            H: 'No. of pkgs',
            I: 'Type of pkgs',
            J: 'Total Gross Weight',
            K: 'Total Net Weight',
            L: 'Total Line Value',
            M: 'Nature of Product (Chilled /Ambient/ Frozen)',
            N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
            O: 'NIRMS / Non NIRMS',
            P: 'GB Establishment RMS Number'
          },
          { K: 'kgs' },
          { P: 'RMS-GB-000015-009' },
          {
            A: 1,
            B: 'TEST001',
            C: '1234',
            F: 'Test Product',
            G: 'PROHIBITED_ITEM_ISO',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: null,
            O: 'NIRMS'
          }
        ]
      })
    )
    return data
  })(),

  // BAC14: Item Present on Prohibited Item List, more than 3 (no Treatment Type specified)
  prohibitedItemsMultipleNoTreatmentModel: (() => {
    const data = JSON.parse(
      JSON.stringify({
        Sheet2: [
          {
            A: 'Item',
            B: 'Product code',
            C: 'Commodity code',
            D: 'Online Check',
            E: 'Meursing code',
            F: 'Description of goods',
            G: 'Country of Origin',
            H: 'No. of pkgs',
            I: 'Type of pkgs',
            J: 'Total Gross Weight',
            K: 'Total Net Weight',
            L: 'Total Line Value',
            M: 'Nature of Product (Chilled /Ambient/ Frozen)',
            N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
            O: 'NIRMS / Non NIRMS',
            P: 'GB Establishment RMS Number'
          },
          { K: 'kgs' },
          { P: 'RMS-GB-000015-009' },
          {
            A: 1,
            B: 'TEST001',
            C: '1234',
            F: 'Test Product',
            G: 'PROHIBITED_ITEM_ISO',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: null,
            O: 'NIRMS'
          },
          {
            A: 2,
            B: 'TEST001',
            C: '1234',
            F: 'Test Product',
            G: 'PROHIBITED_ITEM_ISO',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: null,
            O: 'NIRMS'
          },
          {
            A: 3,
            B: 'TEST001',
            C: '1234',
            F: 'Test Product',
            G: 'PROHIBITED_ITEM_ISO',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: null,
            O: 'NIRMS'
          },
          {
            A: 4,
            B: 'TEST001',
            C: '1234',
            F: 'Test Product',
            G: 'PROHIBITED_ITEM_ISO',
            H: '10',
            K: '5.00',
            M: 'Chilled',
            N: null,
            O: 'NIRMS'
          }
        ]
      })
    )
    return data
  })(),

  // Valid CoO Model with all fields properly set
  validCooModel: {
    Sheet2: [
      {
        A: 'Item',
        B: 'Product code',
        C: 'Commodity code',
        D: 'Online Check',
        E: 'Meursing code',
        F: 'Description of goods',
        G: 'Country of Origin',
        H: 'No. of pkgs',
        I: 'Type of pkgs',
        J: 'Total Gross Weight',
        K: 'Total Net Weight',
        L: 'Total Line Value',
        M: 'Nature of Product (Chilled /Ambient/ Frozen)',
        N: 'Type of Treatment (Processed/ Unprocessed/ Raw)',
        O: 'NIRMS / Non NIRMS',
        P: 'GB Establishment RMS Number'
      },
      {
        K: 'kgs'
      },
      {
        A: '1',
        B: 'TEST001',
        C: '0123456789',
        D: '',
        E: '',
        F: 'Valid Test Product 1',
        G: 'VALID_ISO',
        H: '10',
        I: 'cases',
        J: '5.50',
        K: '5.00',
        L: '15.00',
        M: 'Chilled',
        N: 'Raw',
        O: 'NIRMS',
        P: 'RMS-GB-000015-009'
      },
      {
        A: '2',
        B: 'TEST002',
        C: '0987654321',
        D: '',
        E: '',
        F: 'Valid Test Product 2',
        G: 'GB',
        H: '15',
        I: 'cases',
        J: '7.75',
        K: '7.00',
        L: '25.00',
        M: 'Frozen',
        N: 'Processed',
        O: 'Non NIRMS',
        P: 'RMS-GB-000015-009'
      }
    ]
  }
}
