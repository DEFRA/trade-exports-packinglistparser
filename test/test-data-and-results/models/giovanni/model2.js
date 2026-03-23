export default {
  validModel: {
    'SUMMARY FOR GC': [
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000149-006) declares that these products are intend for the Green lane and will remain in Northern Ireland. '
      },
      {
        C: 'DESCRIPTION',
        F: 'Country of Origin',
        G: 'Qauntity',
        H: 'Net Weight (KG)',
        E: 'Commodity Code'
      },
      {
        C: 'SPINACH AND RICOTTA TORT',
        F: 'IT',
        G: 17,
        H: 40.8,
        E: '1902209990'
      },
      {
        C: 'FOUR CHEESE TORT',
        F: 'IT',
        G: 10,
        H: 24,
        E: '1902209990'
      }
    ]
  },
  validHeadersNoData: {
    'SUMMARY FOR GC': [
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000149-006) declares that these products are intend for the Green lane and will remain in Northern Ireland. '
      },
      {
        C: 'DESCRIPTION',
        F: 'Country of Origin',
        G: 'Qauntity',
        H: 'Net Weight (KG)'
      }
    ]
  },
  validModelMultipleSheets: {
    'SUMMARY FOR GC': [
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000149-006) declares that these products are intend for the Green lane and will remain in Northern Ireland. '
      },
      {
        C: 'DESCRIPTION',
        F: 'Country of Origin',
        G: 'Qauntity',
        H: 'Net Weight (KG)',
        E: 'Commodity Code'
      },
      {
        C: 'RANA CHICKEN&BACON TORT',
        F: 'IT',
        G: 21,
        H: 31.5,
        E: '1902209990'
      }
    ],
    'SUMMARY FOR GC 2': [
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000149-006) declares that these products are intend for the Green lane and will remain in Northern Ireland. '
      },
      {
        C: 'DESCRIPTION',
        F: 'Country of Origin',
        G: 'Qauntity',
        H: 'Net Weight (KG)',
        E: 'Commodity Code'
      },
      {
        C: 'RANA HAM&CHEESE TORT',
        F: 'IT',
        G: 10,
        H: 15,
        E: '1902209990'
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    'SUMMARY FOR GC': [
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000149-006) declares that these products are intend for the Green lane and will remain in Northern Ireland. '
      },
      {
        C: 'DESCRIPTION',
        F: 'Country of Origin',
        G: 'Qauntity',
        H: 'Net Weight (KG)',
        E: 'Commodity Code'
      },
      {
        C: 'SPINACH AND RICOTTA TORT',
        F: 'IT',
        G: null,
        H: 40.8,
        E: '1902209990'
      },
      {
        C: 'FOUR CHEESE TORT',
        F: 'IT',
        G: 10,
        H: null,
        E: '1902209990'
      }
    ]
  },
  incorrectEstablishmentNumber: {
    'SUMMARY FOR GC': [
      {
        A: 'INVALID'
      },
      {
        C: 'DESCRIPTION',
        F: 'Country of Origin',
        G: 'Qauntity',
        H: 'Net Weight (KG)',
        E: 'Commodity Code'
      },
      {
        C: 'SPINACH AND RICOTTA TORT',
        G: 17,
        H: 40.8,
        E: '1902209990'
      },
      {
        C: 'FOUR CHEESE TORT',
        G: 10,
        H: 24,
        E: '1902209990'
      }
    ]
  },
  wrongEstablishmentMultiple: {
    sheet1: [
      {
        A: 'RMS-GB-000149-003'
      },
      {
        C: 'DESCRIPTION',
        G: 'Qauntity',
        H: 'Net Weight (KG)',
        E: 'Commodity Code',
        F: 'Country of Origin'
      }
    ],
    sheet2: [
      {
        A: 'INCORRECT'
      },
      {
        C: 'DESCRIPTION',
        G: 'Qauntity',
        H: 'Net Weight (KG)',
        E: 'Commodity Code',
        F: 'Country of Origin'
      }
    ]
  },
  incorrectHeader: {
    'SUMMARY FOR GC': [
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000149-006)'
      },
      {
        C: 'INVALID',
        G: 'INVALID',
        H: 'INVALID',
        E: 'INVALID'
      },
      {
        C: 'SPINACH AND RICOTTA TORT',
        G: 17,
        H: 40.8,
        E: '1902209990'
      },
      {
        C: 'FOUR CHEESE TORT',
        G: 10,
        H: 24,
        E: '1902209990'
      }
    ]
  },
  incorrectHeaderMultiple: {
    sheet1: [
      {
        A: 'RMS-GB-000149-006'
      },
      {
        C: 'DESCRIPTION',
        G: 'Qauntity',
        H: 'Net Weight (KG)',
        E: 'Commodity Code'
      }
    ],
    sheet2: [
      {
        A: 'RMS-GB-000149-006'
      },
      {
        C: 'DESCRIPTION',
        G: 'INCORRECT',
        H: 'HEADER',
        E: 'Commodity Code'
      }
    ]
  },
  emptyModel: {
    'SUMMARY FOR GC': [
      {
        A: null
      },
      {
        C: 'DESCRIPTION',
        F: 'Country of Origin',
        G: 'Qauntity',
        H: 'Net Weight (KG)',
        E: 'Commodity Code'
      },
      {}
    ]
  },
  multipleRms: {
    'SUMMARY FOR GC': [
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000149-006) declares that these products are intend for the Green lane and will remain in Northern Ireland. ',
        B: '(NIRMS RMS-GB-000149-007)'
      },
      {
        C: 'DESCRIPTION',
        F: 'Country of Origin',
        G: 'Qauntity',
        H: 'Net Weight (KG)',
        E: 'Commodity Code'
      },
      {
        C: 'SPINACH AND RICOTTA TORT',
        F: 'IT',
        G: 17,
        H: 40.8,
        E: '1902209990'
      },
      {
        C: 'FOUR CHEESE TORT',
        F: 'IT',
        G: 10,
        H: 24,
        E: '1902209990'
      }
    ]
  },
  missingKgunit: {
    'SUMMARY FOR GC': [
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000149-006) declares that these products are intend for the Green lane and will remain in Northern Ireland. '
      },
      {
        C: 'DESCRIPTION',
        F: 'Country of Origin',
        G: 'Qauntity',
        H: 'Net Weight',
        E: 'Commodity Code'
      },
      {
        C: 'SPINACH AND RICOTTA TORT',
        F: 'IT',
        G: 17,
        H: 40.8,
        E: '1902209990'
      },
      {
        C: 'FOUR CHEESE TORT',
        F: 'IT',
        G: 10,
        H: 24,
        E: '1902209990'
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    'SUMMARY FOR GC': [
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000149-006) declares that these products are intend for the Green lane and will remain in Northern Ireland. '
      },
      {
        C: 'DESCRIPTION',
        F: 'Country of Origin',
        G: 'Qauntity',
        H: 'Net Weight (KG)',
        E: 'Commodity Code'
      },
      {
        C: 'SPINACH AND RICOTTA TORT',
        F: 'IT',
        G: 17,
        H: 40.8,
        E: '1902209990'
      }
    ],
    'SUMMARY FOR GC 2': [
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000149-006) declares that these products are intend for the Green lane and will remain in Northern Ireland. '
      },
      {
        A: 'Extra row 1'
      },
      {
        C: 'DESCRIPTION',
        F: 'Country of Origin',
        G: 'Qauntity',
        H: 'Net Weight (KG)',
        E: 'Commodity Code'
      },
      {
        C: 'MUSHROOM AND HERB TORT',
        F: 'IT',
        G: 12,
        H: 28.8,
        E: '1902209990'
      }
    ]
  }
}
