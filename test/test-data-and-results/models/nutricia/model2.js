export default {
  modelWithNoUnitInHeader: {
    DANONE: [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      { A: 'NIRMS NUMBER' },
      { A: 'RMS-GB-000133-000' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'Material description',
        E: 'Commodity code',
        F: 'coo',
        G: 'Order qty',
        H: 'Order net weight'
      },
      {
        C: 'ACTIVIA DRK FRTS 6X8X115',
        E: '403209300',
        F: 'BE',
        G: 2,
        H: 11.04
      },
      {
        C: 'ACT 00  YE&RD FRU 6X8X115',
        E: '403209100',
        F: 'FR',
        G: 5,
        H: 27.6
      }
    ]
  },
  validHeadersNoData: {
    DANONE: [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      { A: 'NIRMS NUMBER' },
      { A: 'RMS-GB-000133' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'Material description',
        E: 'Commodity code',
        F: 'coo',
        G: 'Order qty',
        H: 'Order net weight'
      }
    ]
  },
  validModelMultipleSheets: {
    Sheet1: [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      { A: 'NIRMS NUMBER' },
      { A: 'RMS-GB-000133' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'Material description',
        E: 'Commodity code',
        F: 'coo',
        G: 'Order qty',
        H: 'Order net weight'
      },
      {
        C: 'ACTIVIA DRK FRTS 6X8X115',
        E: '403209300',
        F: 'BE',
        G: 2,
        H: 11.04
      }
    ],
    Sheet2: [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      { A: 'NIRMS NUMBER' },
      { A: 'RMS-GB-000133' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'Material description',
        E: 'Commodity code',
        F: 'coo',
        G: 'Order qty',
        H: 'Order net weight'
      },
      {
        C: 'ACT 00  YE&RD FRU 6X8X115',
        E: '403209100',
        F: 'FR',
        G: 5,
        H: 27.6
      }
    ]
  },
  invalidModel_IncorrectEstablishmentNumber: {
    DANONE: [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      { A: 'NIRMS NUMBER' },
      { A: 'INCORRECT' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'Material description',
        E: 'Commodity code',
        F: 'coo',
        G: 'Order qty',
        H: 'Order net weight'
      },
      {
        C: 'ACTIVIA DRK FRTS 6X8X115',
        E: '403209300',
        G: 2,
        H: 11.04
      },
      {
        C: 'ACT 00  YE&RD FRU 6X8X115',
        E: '403209100',
        G: 5,
        H: 27.6
      }
    ]
  },
  wrongEstablishmentMultiple: {
    Sheet1: [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      { A: 'NIRMS NUMBER' },
      { A: 'RMS-GB-000133' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'Material description',
        E: 'Commodity code',
        F: 'coo',
        G: 'Order qty',
        H: 'Order net weight'
      }
    ],
    Sheet2: [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      { A: 'NIRMS NUMBER' },
      { A: 'INCORRECT' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'Material description',
        E: 'Commodity code',
        F: 'coo',
        G: 'Order qty',
        H: 'Order net weight'
      }
    ]
  },
  invalidModel_IncorrectHeaders: {
    DANONE: [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      { A: 'NIRMS NUMBER' },
      { A: 'RMS-GB-000133' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        A: 'NOT',
        B: 'CORRECT',
        C: 'HEADER'
      },
      {
        C: 'ACTIVIA DRK FRTS 6X8X115',
        E: '403209300',
        G: 2,
        H: 11.04
      },
      {
        C: 'ACT 00  YE&RD FRU 6X8X115',
        E: '403209100',
        G: 5,
        H: 27.6
      }
    ]
  },
  incorrectHeaderMultiple: {
    Sheet1: [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      { A: 'NIRMS NUMBER' },
      { A: 'RMS-GB-000133' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'Material description',
        E: 'Commodity code',
        F: 'coo',
        G: 'Order qty',
        H: 'Order net weight'
      }
    ],
    Sheet2: [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      { A: 'NIRMS NUMBER' },
      { A: 'RMS-GB-000133' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'NOT',
        G: 'CORRECT',
        H: 'HEADER'
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    DANONE: [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      { A: 'NIRMS NUMBER' },
      { A: 'RMS-GB-000133-000' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'Material description',
        E: 'Commodity code',
        F: 'coo',
        G: 'Order qty',
        H: 'Order net weight (Kg'
      },
      {
        C: 'ACTIVIA DRK FRTS 6X8X115',
        E: null,
        F: 'BE',
        G: 2,
        H: 11.04
      },
      {
        C: 'ACT 00  YE&RD FRU 6X8X115',
        E: '403209100',
        F: 'FR',
        G: 5,
        H: null
      }
    ]
  },
  emptyModel: {
    DANONE: [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'Material description',
        E: 'Commodity code',
        F: 'coo',
        G: 'Order qty',
        H: 'Order net weight'
      },
      {
        C: null
      }
    ]
  },
  matchModel: {
    sheet: [
      {
        A: 'RMS-GB-000133',
        B: 'RMS-GB-000000-000'
      },
      {
        C: 'Material description',
        E: 'Commodity code',
        F: 'coo',
        G: 'Order qty',
        H: 'Order net weight'
      }
    ]
  },
  hasSupplierButNotRms: {
    sheet: [
      {
        A: 'RMS-GB-000133'
      }
    ]
  },
  hasRmsButNotSupplier: {
    sheet: [
      {
        A: 'RMS-GB-000000-000'
      }
    ]
  },
  multipleRms: {
    sheet: [
      {
        A: 'RMS-GB-000133'
      },
      {
        A: 'RMS-GB-000000-001',
        B: 'RMS-GB-000000-002'
      },
      {
        C: 'Material description',
        E: 'Commodity code',
        F: 'coo',
        G: 'Order qty',
        H: 'Order net weight kg'
      },
      {
        C: 'ACTIVIA DRK FRTS 6X8X115',
        E: '403209300',
        F: 'BE',
        G: 2,
        H: 11.04
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    Sheet1: [
      {
        A: 'RMS-GB-000133-000'
      },
      {
        C: 'Material description',
        E: 'Commodity code',
        F: 'coo',
        G: 'Order qty',
        H: 'Order net weight kg'
      },
      {
        C: 'ACTIVIA DRK FRTS 6X8X115',
        E: '403209300',
        F: 'BE',
        G: 2,
        H: 11.04
      }
    ],
    Sheet2: [
      {
        A: 'extra row'
      },
      { A: 'RMS-GB-000133-000' },
      {
        C: 'Material description',
        E: 'Commodity code',
        F: 'coo',
        G: 'Order qty',
        H: 'Order net weight kg'
      },
      {
        C: 'ACTIVIA VANILLA 6X8X115',
        E: '403209200',
        F: 'DE',
        G: 3,
        H: 16.56
      }
    ]
  }
}
