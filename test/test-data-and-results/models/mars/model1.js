export default {
  validModel: {
    Sheet1: [
      {
        A: 'Despatch Location : '
      },
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      },
      {
        C: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        D: 8,
        E: 24,
        G: '21032000',
        H: 'GB',
        I: 'Ambient',
        J: 'Red Lane - No OCR'
      },
      {
        C: 'BEN Mexican 6*220g GB',
        D: 336,
        E: 443.52,
        G: '19049010',
        H: 'GB',
        I: 'Ambient',
        J: 'Red Lane - No OCR'
      }
    ]
  },
  validHeadersNoData: {
    Sheet1: [
      {
        A: 'Despatch Location : '
      },
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      {
        A: 'Despatch Location : '
      },
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      },
      {
        C: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        D: 8,
        E: 24,
        G: '21032000',
        H: 'GB',
        I: 'Ambient',
        J: 'Red Lane - No OCR'
      },
      {
        C: 'BEN Mexican 6*220g GB',
        D: 336,
        E: 443.52,
        G: '19049010',
        H: 'GB',
        I: 'Ambient',
        J: 'Red Lane - No OCR'
      }
    ],
    Sheet2: [
      {
        A: 'Despatch Location : '
      },
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      },
      {
        C: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        D: 8,
        E: 24,
        G: '21032000',
        H: 'GB',
        I: 'Ambient',
        J: 'Red Lane - No OCR'
      },
      {
        C: 'BEN Mexican 6*220g GB',
        D: 336,
        E: 443.52,
        G: '19049010',
        H: 'GB',
        I: 'Ambient',
        J: 'Red Lane - No OCR'
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    Sheet1: [
      {
        A: 'Despatch Location : '
      },
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      },
      {
        C: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        D: null,
        E: 24,
        G: '21032000',
        H: 'GB',
        J: 'Red Lane - No OCR'
      },
      {
        C: 'BEN Mexican 6*220g GB',
        D: 336,
        E: null,
        G: '19049010',
        H: 'GB',
        J: 'Red Lane - No OCR'
      }
    ]
  },
  incorrectHeader: {
    Sheet1: [
      {
        A: 'Despatch Location : '
      },
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'INVALID',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code'
      },
      {
        C: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        D: 8,
        E: 24,
        G: '21032000'
      },
      {
        C: 'BEN Mexican 6*220g GB',
        D: 336,
        E: 443.52,
        G: '19049010'
      }
    ]
  },
  incorrectHeaderMultiple: {
    Sheet1: [
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code'
      }
    ],
    Sheet2: [
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Invalid',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code'
      }
    ]
  },
  incorrectEstablishmentNumber: {
    Sheet1: [
      {
        A: 'Despatch Location : '
      },
      {
        A: 'INVALID'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code'
      },
      {
        C: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        D: 8,
        E: 24,
        G: '21032000'
      },
      {
        C: 'BEN Mexican 6*220g GB',
        D: 336,
        E: 443.52,
        G: '19049010'
      }
    ]
  },
  emptyModel: {
    Sheet1: [
      {
        A: null
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      },
      {}
    ]
  },
  wrongEstablishmentMultiple: {
    Sheet1: [
      {
        A: 'Despatch Location : '
      },
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      }
    ],
    Sheet2: [
      {
        A: 'Despatch Location : '
      },
      {
        A: 'INCORRECT'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      }
    ]
  },
  multipleRms: {
    Sheet1: [
      {
        A: 'RMS-GB-000213-001',
        B: 'RMS-GB-000213-002'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      },
      {
        C: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        D: 8,
        E: 24,
        G: '21032000',
        I: 'Ambient',
        J: 'Red Lane - No OCR'
      }
    ]
  },
  missingKgunit: {
    Sheet1: [
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      },
      {
        C: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        D: 8,
        E: 24,
        G: '21032000',
        H: 'GB',
        I: 'Ambient',
        J: 'Red Lane - No OCR'
      }
    ]
  },
  missingCoO: {
    Sheet1: [
      {
        A: 'Despatch Location : '
      },
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      },
      {
        C: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        D: 8,
        E: 24,
        G: '21032000',
        I: 'Ambient',
        J: 'Green Lane - OCR'
      }
    ]
  },
  invalidCoO: {
    Sheet1: [
      {
        A: 'Despatch Location : '
      },
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      },
      {
        C: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        D: 8,
        E: 24,
        G: '21032000',
        H: 'Great Britain',
        I: 'Ambient',
        J: 'Green Lane - OCR'
      }
    ]
  },
  missingNirms: {
    Sheet1: [
      {
        A: 'Despatch Location : '
      },
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      },
      {
        C: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        D: 8,
        E: 24,
        G: '21032000',
        H: 'GB',
        I: 'Ambient'
      }
    ]
  },
  invalidNirms: {
    Sheet1: [
      {
        A: 'Despatch Location : '
      },
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      },
      {
        C: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        D: 8,
        E: 24,
        G: '21032000',
        H: 'Great Britain',
        I: 'Ambient',
        J: 'SPS'
      }
    ]
  },
  ineligibleItem: {
    Sheet1: [
      {
        A: 'Despatch Location : '
      },
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      },
      {
        C: 'Ineligible ITEM',
        D: 8,
        E: 24,
        G: '012', // Ineligible commodity code
        H: 'INELIGIBLE_ITEM_ISO', // Ineligible country
        I: 'INELIGIBLE_ITEM_TREATMENT',
        J: 'Green Lane - OCR'
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    Sheet1: [
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      },
      {
        C: 'DO BOL ORIGINAL LIGHT 6X500G GB/IR',
        D: 8,
        E: 24,
        G: '21032000',
        H: 'GB',
        I: 'Ambient',
        J: 'Red Lane - No OCR'
      }
    ],
    Sheet2: [
      {
        A: 'Extra row 1'
      },
      {
        A: 'RMS-GB-000213-001'
      },
      {
        C: 'Description',
        D: 'Case Qty',
        E: 'Net Weight KG',
        G: 'Commodity Code',
        H: 'Country Code',
        I: 'Type of Treatment',
        J: 'SPS'
      },
      {
        C: 'BEN Mexican 6*220g GB',
        D: 336,
        E: 443.52,
        G: '19049030',
        H: 'GB',
        I: 'Ambient',
        J: 'Red Lane - No OCR'
      }
    ]
  }
}
