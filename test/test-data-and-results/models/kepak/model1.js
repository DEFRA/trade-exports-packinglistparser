export default {
  validModel: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        F: 'GB',
        G: 32,
        H: 30.336
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '1602493000',
        F: 'GB',
        G: 22,
        H: 27.632
      }
    ]
  },
  validModelWithNirms: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        F: 'GB',
        G: 32,
        H: 30.336
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '1602493000',
        F: 'GB',
        G: 22,
        H: 27.632
      },
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      }
    ]
  },
  validModelWithDragdown: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        F: 'GB',
        G: 32,
        H: 30.336
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '1602493000',
        F: 'GB',
        G: 22,
        H: 27.632
      },
      {
        C: 0,
        E: 0,
        F: 0,
        G: 0,
        H: 0
      }
    ]
  },
  validHeadersNoData: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        G: 'Quantity',
        H: 'Net Weight (KG)'
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'FS MINI SAUSAGE BAP',
        E: '1602495000',
        F: 'GB',
        G: 3,
        H: 2.16
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS MEATBALL SUB',
        E: '1602495000',
        F: 'GB',
        G: 3,
        H: 1.716
      }
    ]
  },
  invalidModel_IncorrectEstablishmentNumber: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'INVALID' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        G: 32,
        H: 30.336
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '1602493000',
        G: 22,
        H: 27.632
      }
    ]
  },
  wrongEstablishmentMultiple: {
    sheet1: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'INCORRECT' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      }
    ]
  },
  invalidModel_IncorrectHeaders: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'THIS',
        E: 'IS',
        G: 'NOT',
        H: 'CORRECT'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        G: 32,
        H: 30.336
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '1602493000',
        G: 22,
        H: 27.632
      }
    ]
  },
  incorrectHeaderMultiple: {
    sheet1: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        A: 'Consignment Reference',
        B: 'Product Code',
        C: 'DESCRIPTION'
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
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
      }
    ]
  },
  invalidModel_MissingColumnCells: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        F: 'GB',
        G: null,
        H: 30.336
      },
      {
        C: null,
        E: '1602493000',
        F: 'GB',
        G: 22,
        H: 27.632
      },
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      }
    ]
  },
  emptyModel: {
    KEPAK: [
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
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight'
      },
      {
        C: null
      }
    ]
  },
  multipleRms: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      { I: 'RMS-GB-000149-006' },
      { A: 'RMS-GB-000280' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        F: 'GB',
        G: 32,
        H: 30.336
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '1602493000',
        F: 'GB',
        G: 22,
        H: 27.632
      },
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      }
    ]
  },
  missingKgunit: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        F: 'GB',
        G: 32,
        H: 30.336
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '1602493000',
        F: 'GB',
        G: 22,
        H: 27.632
      },
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      }
    ]
  },
  missingNirmsStatement: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      { H: 'Type of Treatment' },
      { H: 'Processed' },
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '1602493000',
        F: 'GB',
        G: 22,
        H: 27.632
      }
    ]
  },
  nullCoO: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      { H: 'Type of Treatment' },
      { H: 'Processed' },
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        F: null,
        G: 32,
        H: 30.336
      },
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      }
    ]
  },
  invalidCoO: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      { H: 'Type of Treatment' },
      { H: 'Processed' },
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        F: 'INVALID',
        G: 32,
        H: 30.336
      },
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      }
    ]
  },
  multipleNullCoO: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      { H: 'Type of Treatment' },
      { H: 'Processed' },
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        F: null,
        G: 32,
        H: 30.336
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '1602493000',
        F: null,
        G: 22,
        H: 27.632
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        F: null,
        G: 32,
        H: 30.336
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '1602493000',
        F: null,
        G: 22,
        H: 27.632
      },
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      }
    ]
  },
  multipleInvalidCoO: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      { H: 'Type of Treatment' },
      { H: 'Processed' },
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        F: 'INVALID',
        G: 32,
        H: 30.336
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '1602493000',
        F: 'INVALID',
        G: 22,
        H: 27.632
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        F: 'INVALID',
        G: 32,
        H: 30.336
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '1602493000',
        F: 'INVALID',
        G: 22,
        H: 27.632
      },
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      }
    ]
  },
  xCoO: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      { H: 'Type of Treatment' },
      { H: 'Processed' },
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        F: 'x',
        G: 32,
        H: 30.336
      },
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      }
    ]
  },
  ineligibleItemWithTreatment: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      { H: 'Type of Treatment' },
      { H: 'Processed' },
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '012',
        F: 'INELIGIBLE_ITEM_ISO',
        G: 32,
        H: 30.336
      },
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      }
    ]
  },
  multipleineligibleItemsWithTreatment: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      { H: 'Type of Treatment' },
      { H: 'Processed' },
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '012',
        F: 'INELIGIBLE_ITEM_ISO',
        G: 32,
        H: 30.336
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '012',
        F: 'INELIGIBLE_ITEM_ISO',
        G: 22,
        H: 27.632
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '012',
        F: 'INELIGIBLE_ITEM_ISO',
        G: 32,
        H: 30.336
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '012',
        F: 'INELIGIBLE_ITEM_ISO',
        G: 22,
        H: 27.632
      },
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      }
    ]
  },
  ineligibleItemNoTreatment: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      { H: 'Type of Treatment' },
      {},
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '012',
        F: 'INELIGIBLE_ITEM_ISO',
        G: 32,
        H: 30.336
      },
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      }
    ]
  },
  multipleineligibleItemsNoTreatment: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      { H: 'Type of Treatment' },
      {},
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '012',
        F: 'INELIGIBLE_ITEM_ISO',
        G: 32,
        H: 30.336
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '012',
        F: 'INELIGIBLE_ITEM_ISO',
        G: 22,
        H: 27.632
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '012',
        F: 'INELIGIBLE_ITEM_ISO',
        G: 32,
        H: 30.336
      },
      {
        C: 'RS BBQ RIB STD 8X157G',
        E: '012',
        F: 'INELIGIBLE_ITEM_ISO',
        G: 22,
        H: 27.632
      },
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      }
    ]
  },
  nullTreatmentTypeWithNullIdentifier: {
    KEPAK: [
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
      { I: 'RMS-GB-000149-005' },
      {},
      { A: 'RMS-GB-000280' },
      {},
      {},
      { H: 'Type of Treatment' },
      {},
      {},
      {},
      {},
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: null,
        F: 'GB',
        G: 32,
        H: 30.336
      },
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      }
    ]
  },
  validModelMultipleSheetsHeadersOnDifferentRows: {
    Sheet1: [
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      },
      { I: 'RMS-GB-000149-005' },
      { A: 'RMS-GB-000280' },
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS DOUBLE DECKER STD',
        E: '1602509590',
        F: 'GB',
        G: 32,
        H: 30.336
      }
    ],
    Sheet2: [
      {
        A: 'The exporter of the products covered by this document (NIRMS RMS-GB-000280)\n declares that these products are intend for the Green lane and will remain\n in Northern Ireland.'
      },
      { I: 'RMS-GB-000149-005' },
      { A: 'RMS-GB-000280' },
      {
        A: 'extra row'
      },
      {
        C: 'DESCRIPTION',
        E: 'Commodity Code',
        F: 'Country of Origin',
        G: 'Quantity',
        H: 'Net Weight (KG)'
      },
      {
        C: 'RS CHICKEN TIKKA STD',
        E: '1602393000',
        F: 'GB',
        G: 18,
        H: 22.5
      }
    ]
  }
}
