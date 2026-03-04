/**
 * Burbank Model 1 – test model fixtures
 *
 * Represents Excel-to-JSON workbook shapes consumed by
 * the matcher, parser, and parser-service integration tests.
 *
 * Column mapping (Revised sheet, header row index 43):
 *   A: Item
 *   B: Product code
 *   C: Commodity code
 *   F: Description of goods
 *   G: Country of Origin
 *   H: No. of packages
 *   I: Type of packages
 *   K: Item Net Weight (kgs)
 *   M: NIIRMS Dispatch number  (establishment number)
 *   N: Nature of Product
 *   O: Type of Treatment
 *   P: NIRMS Red/Green Lane
 */

// ── helpers ──────────────────────────────────────────────────────────────────

const ESTABLISHMENT_NUMBER = 'RMS-GB-000219-001'

/** 43 empty rows that precede the header row in the "Revised" sheet */
const emptyRows = new Array(43).fill({})

const headerRow = {
  A: 'Item',
  B: 'Product code',
  C: 'Commodity code',
  F: 'Description of goods',
  G: 'Country of Origin',
  H: 'No. of packages',
  I: 'Type of packages',
  K: 'Item Net Weight (kgs)',
  M: 'NIIRMS Dispatch number',
  N: 'Nature of Product',
  O: 'Type of Treatment',
  P: 'NIRMS Red/Green Lane'
}

const lookupSheets = {
  References: [{ A: 'Country of Origin', B: 'ISO Code' }],
  Lookups: [{ A: 'Incoterms', B: 'Incoterms Desc' }],
  Meursing: [{ I: 'Sucrose' }]
}

// ── exported models ──────────────────────────────────────────────────────────

export default {
  // ─── Valid ─────────────────────────────────────────────────────────────────
  validModel: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '709999090',
        F: 'Herb Lovage x1kg',
        G: 'VALID_ISO',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'Green'
      },
      {
        A: '2',
        C: '702000007',
        F: 'Tomato Cherry Mixed x9x250gm',
        G: 'VALID_ISO',
        H: '10',
        I: 'Cases',
        K: '22.5',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'Green'
      }
    ],
    ...lookupSheets
  },

  // ─── Valid with multiple sheets ────────────────────────────────────────────
  validModel_Multiple: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '709999090',
        F: 'Herb Lovage x1kg',
        G: 'VALID_ISO',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'Green'
      }
    ],
    Revised2: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '702000007',
        F: 'Tomato Cherry Mixed x9x250gm',
        G: 'VALID_ISO',
        H: '10',
        I: 'Cases',
        K: '22.5',
        M: 'RMS-GB-000219-002',
        N: 'Chilled',
        O: 'Raw',
        P: 'Green'
      }
    ],
    ...lookupSheets
  },

  // ─── Invalid – missing column cells ────────────────────────────────────────
  invalidModel_MissingColumnCells: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '709999090',
        F: 'Herb Lovage x1kg',
        G: 'VALID_ISO',
        H: '2',
        I: 'Cases',
        K: null,
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'Green'
      }
    ],
    ...lookupSheets
  },

  // ─── Invalid – incorrect establishment number ──────────────────────────────
  invalid_Model_IncorrectEstablishmentNumber: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '709999090',
        F: 'Herb Lovage x1kg',
        H: '2',
        K: '2',
        M: 'INCORRECT',
        N: 'Chilled',
        O: 'Raw',
        P: 'Green'
      }
    ],
    ...lookupSheets
  },

  // ─── Invalid – incorrect header ────────────────────────────────────────────
  invalid_Model_IncorrectHeader: {
    Revised: [
      {
        A: 'NOT',
        B: 'CORRECT',
        C: 'HEADER',
        M: ESTABLISHMENT_NUMBER
      }
    ],
    ...lookupSheets
  },

  // ─── Invalid – missing headers (empty sheet with establishment number) ─────
  invalidModel_MissingHeaders: {
    Revised: [{ M: ESTABLISHMENT_NUMBER }],
    ...lookupSheets
  },

  // ─── Multiple RMS numbers in a single sheet ────────────────────────────────
  multipleRms: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '709999090',
        F: 'Herb Lovage x1kg',
        G: 'VALID_ISO',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'Green'
      },
      {
        A: '2',
        C: '702000007',
        F: 'Tomato Cherry Mixed x9x250gm',
        G: 'VALID_ISO',
        H: '10',
        I: 'Cases',
        K: '22.5',
        M: 'RMS-GB-000219-002',
        N: 'Chilled',
        O: 'Raw',
        P: 'Green'
      }
    ],
    ...lookupSheets
  },

  // ─── Missing kg unit (header has no 'kg' annotation) ──────────────────────
  missingKgunit: {
    Revised: [
      ...emptyRows,
      {
        ...headerRow,
        K: 'Item Net Weight'
      },
      {
        A: '1',
        C: '709999090',
        F: 'Herb Lovage x1kg',
        G: 'VALID_ISO',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'Green'
      }
    ],
    ...lookupSheets
  },

  // ─── Empty model ───────────────────────────────────────────────────────────
  emptyModel: {
    Revised: [{ M: ESTABLISHMENT_NUMBER }, headerRow],
    ...lookupSheets
  },

  // ── CoO / NIRMS validation models ─────────────────────────────────────────

  nonNirms: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '709999090',
        F: 'Herb Lovage x1kg',
        G: 'VALID_ISO',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'Red'
      }
    ],
    ...lookupSheets
  },

  invalidNirms: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '709999090',
        F: 'Herb Lovage x1kg',
        G: 'VALID_ISO',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'INVALID'
      }
    ],
    ...lookupSheets
  },

  missingNirms: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '709999090',
        F: 'Herb Lovage x1kg',
        G: 'VALID_ISO',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw'
      }
    ],
    ...lookupSheets
  },

  missingCoO: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '709999090',
        F: 'Herb Lovage x1kg',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'Green'
      },
      {
        A: '2',
        C: '702000007',
        F: 'Tomato Cherry Mixed',
        H: '10',
        I: 'Cases',
        K: '22.5',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'yes'
      },
      {
        A: '3',
        C: '709601000',
        F: 'Red Peppers',
        H: '5',
        I: 'Cases',
        K: '5',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'nirms'
      },
      {
        A: '4',
        C: '706100000',
        F: 'Carrots',
        H: '3',
        I: 'Cases',
        K: '3',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'y'
      },
      {
        A: '5',
        C: '705110000',
        F: 'Lettuce',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'g'
      }
    ],
    ...lookupSheets
  },

  invalidCoO: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '709999090',
        F: 'Herb Lovage x1kg',
        G: 'INVALID',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'Green'
      },
      {
        A: '2',
        C: '702000007',
        F: 'Tomato Cherry Mixed',
        G: 'INVALID',
        H: '10',
        I: 'Cases',
        K: '22.5',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'yes'
      },
      {
        A: '3',
        C: '709601000',
        F: 'Red Peppers',
        G: 'INVALID',
        H: '5',
        I: 'Cases',
        K: '5',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'nirms'
      },
      {
        A: '4',
        C: '706100000',
        F: 'Carrots',
        G: 'INVALID',
        H: '3',
        I: 'Cases',
        K: '3',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'y'
      },
      {
        A: '5',
        C: '705110000',
        F: 'Lettuce',
        G: 'INVALID',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'g'
      }
    ],
    ...lookupSheets
  },

  xCoO: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '709999090',
        F: 'Herb Lovage x1kg',
        G: 'X',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'Green'
      },
      {
        A: '2',
        C: '702000007',
        F: 'Tomato Cherry Mixed',
        G: 'x',
        H: '10',
        I: 'Cases',
        K: '22.5',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'nirms'
      }
    ],
    ...lookupSheets
  },

  ineligibleItems: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '012',
        F: 'Mocked Ineligible Item Product',
        G: 'INELIGIBLE_ITEM_ISO',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'INELIGIBLE_ITEM_TREATMENT',
        P: 'Green'
      },
      {
        A: '2',
        C: '012',
        F: 'Mocked Ineligible Item Non-match Treatment',
        G: 'INELIGIBLE_ITEM_ISO',
        H: '10',
        I: 'Cases',
        K: '10',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'NOT_INELIGIBLE_ITEM_TREATMENT',
        P: 'Green'
      },
      {
        A: '3',
        C: '012',
        F: 'Mocked Ineligible Item No Treatment',
        G: 'INELIGIBLE_ITEM_ISO',
        H: '5',
        I: 'Cases',
        K: '5',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        P: 'Green'
      },
      {
        A: '4',
        C: '012',
        F: 'Mocked Ineligible Item Red Lane',
        G: 'INELIGIBLE_ITEM_ISO',
        H: '3',
        I: 'Cases',
        K: '3',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'INELIGIBLE_ITEM_TREATMENT',
        P: 'Red'
      }
    ],
    ...lookupSheets
  },

  // ─── AC2: Valid model with empty and partial rows that should be ignored ───
  validModel_EmptyAndPartialRows: {
    Revised: [
      ...emptyRows,
      headerRow,
      {},
      { A: '1' },
      {
        A: '2',
        C: '709999090',
        F: 'Herb Lovage x1kg',
        G: 'VALID_ISO',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'Green'
      },
      {},
      {
        A: '3',
        C: '702000007',
        F: 'Tomato Cherry Mixed x9x250gm',
        G: 'VALID_ISO',
        H: '10',
        I: 'Cases',
        K: '22.5',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'Green'
      }
    ],
    ...lookupSheets
  },

  // ─── AC7: More than 3 null NIRMS lane values ──────────────────────────────
  missingNirms_MoreThan3: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '709999090',
        F: 'Herb Lovage x1kg',
        G: 'VALID_ISO',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw'
      },
      {
        A: '2',
        C: '702000007',
        F: 'Tomato Cherry Mixed',
        G: 'VALID_ISO',
        H: '10',
        I: 'Cases',
        K: '22.5',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw'
      },
      {
        A: '3',
        C: '709601000',
        F: 'Red Peppers',
        G: 'VALID_ISO',
        H: '5',
        I: 'Cases',
        K: '5',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw'
      },
      {
        A: '4',
        C: '706100000',
        F: 'Carrots',
        G: 'VALID_ISO',
        H: '3',
        I: 'Cases',
        K: '3',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw'
      }
    ],
    ...lookupSheets
  },

  // ─── AC8: More than 3 invalid NIRMS lane values ───────────────────────────
  invalidNirms_MoreThan3: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '709999090',
        F: 'Herb Lovage x1kg',
        G: 'VALID_ISO',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'INVALID'
      },
      {
        A: '2',
        C: '702000007',
        F: 'Tomato Cherry Mixed',
        G: 'VALID_ISO',
        H: '10',
        I: 'Cases',
        K: '22.5',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'INVALID'
      },
      {
        A: '3',
        C: '709601000',
        F: 'Red Peppers',
        G: 'VALID_ISO',
        H: '5',
        I: 'Cases',
        K: '5',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'INVALID'
      },
      {
        A: '4',
        C: '706100000',
        F: 'Carrots',
        G: 'VALID_ISO',
        H: '3',
        I: 'Cases',
        K: '3',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'Raw',
        P: 'INVALID'
      }
    ],
    ...lookupSheets
  },

  // ─── AC15: More than 3 prohibited items with treatment type ────────────────
  ineligibleItems_MoreThan3_WithTreatment: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '012',
        F: 'Prohibited Item 1',
        G: 'INELIGIBLE_ITEM_ISO',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'INELIGIBLE_ITEM_TREATMENT',
        P: 'Green'
      },
      {
        A: '2',
        C: '012',
        F: 'Prohibited Item 2',
        G: 'INELIGIBLE_ITEM_ISO',
        H: '3',
        I: 'Cases',
        K: '3',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'INELIGIBLE_ITEM_TREATMENT',
        P: 'Green'
      },
      {
        A: '3',
        C: '012',
        F: 'Prohibited Item 3',
        G: 'INELIGIBLE_ITEM_ISO',
        H: '5',
        I: 'Cases',
        K: '5',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'INELIGIBLE_ITEM_TREATMENT',
        P: 'Green'
      },
      {
        A: '4',
        C: '012',
        F: 'Prohibited Item 4',
        G: 'INELIGIBLE_ITEM_ISO',
        H: '4',
        I: 'Cases',
        K: '4',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        O: 'INELIGIBLE_ITEM_TREATMENT',
        P: 'Green'
      }
    ],
    ...lookupSheets
  },

  // ─── AC17: More than 3 prohibited items without treatment type ─────────────
  ineligibleItems_MoreThan3_NoTreatment: {
    Revised: [
      ...emptyRows,
      headerRow,
      {
        A: '1',
        C: '012',
        F: 'Prohibited Item No Treatment 1',
        G: 'INELIGIBLE_ITEM_ISO',
        H: '2',
        I: 'Cases',
        K: '2',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        P: 'Green'
      },
      {
        A: '2',
        C: '012',
        F: 'Prohibited Item No Treatment 2',
        G: 'INELIGIBLE_ITEM_ISO',
        H: '3',
        I: 'Cases',
        K: '3',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        P: 'Green'
      },
      {
        A: '3',
        C: '012',
        F: 'Prohibited Item No Treatment 3',
        G: 'INELIGIBLE_ITEM_ISO',
        H: '5',
        I: 'Cases',
        K: '5',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        P: 'Green'
      },
      {
        A: '4',
        C: '012',
        F: 'Prohibited Item No Treatment 4',
        G: 'INELIGIBLE_ITEM_ISO',
        H: '4',
        I: 'Cases',
        K: '4',
        M: ESTABLISHMENT_NUMBER,
        N: 'Chilled',
        P: 'Green'
      }
    ],
    ...lookupSheets
  }
}
