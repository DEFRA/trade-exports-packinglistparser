/**
 * Giovanni Model 3 Parser Service Integration Tests
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { parsePackingList } from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models-pdf/giovanni/model3.js'
import test_results from '../../test-data-and-results/results-pdf/giovanni/model3.js'
import * as pdfHelper from '../../../src/utilities/pdf-helper.js'
import failureReasons from '../../../src/services/validators/packing-list-failure-reasons.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

vi.mock('../../../src/services/data/data-iso-codes.json', () => ({
  default: ['IT', 'GB', 'X']
}))

vi.mock('../../../src/services/data/data-ineligible-items.json', () => ({
  default: [
    {
      country_of_origin: 'IT',
      commodity_code: '190220',
      type_of_treatment: 'FRESH'
    },
    {
      country_of_origin: 'IT',
      commodity_code: '5555'
    }
  ]
}))

const filename = 'test.pdf'

function createGiovanni3PdfModel(rows, options = {}) {
  const {
    nirmsHeaderText = 'NIRMS ONLY',
    includeNirmsHeader = true,
    includeBlanketTreatment = true,
    treatmentValue = 'FRESH',
    includeTrailingZeroRow = true
  } = options

  const content = [
    {
      x: 471.46,
      y: 147.26,
      str: 'RMS-GB-000149-002',
      dir: 'ltr',
      width: 69.7464000000003,
      height: 7.2,
      fontName: 'Helvetica'
    },
    {
      x: 174.38,
      y: 285.29,
      str: 'DESCRIPTION',
      dir: 'ltr',
      width: 35.95152,
      height: 5.28,
      fontName: 'Helvetica'
    },
    {
      x: 257.33,
      y: 285.77,
      str: 'Commodity Code',
      dir: 'ltr',
      width: 43.93488,
      height: 5.28,
      fontName: 'Helvetica'
    },
    {
      x: 317.11,
      y: 282.29,
      str: 'Country of',
      dir: 'ltr',
      width: 26.6904,
      height: 5.28,
      fontName: 'Helvetica'
    },
    {
      x: 322.75,
      y: 289.25,
      str: 'Origin',
      dir: 'ltr',
      width: 15.48096,
      height: 5.28,
      fontName: 'Helvetica'
    },
    {
      x: 357.55,
      y: 285.77,
      str: 'Quantity',
      dir: 'ltr',
      width: 21.4104,
      height: 5.28,
      fontName: 'Helvetica'
    },
    {
      x: 389.59,
      y: 285.77,
      str: 'Net Weight (KG)',
      dir: 'ltr',
      width: 40.59792,
      height: 5.28,
      fontName: 'Helvetica'
    }
  ]

  if (includeNirmsHeader) {
    content.push({
      x: 480,
      y: 285.77,
      str: nirmsHeaderText,
      dir: 'ltr',
      width: 55,
      height: 5.28,
      fontName: 'Helvetica'
    })
  }

  if (includeBlanketTreatment) {
    content.push(
      {
        x: 375,
        y: 195,
        str: 'Type of Treatment',
        dir: 'ltr',
        width: 50,
        height: 5.28,
        fontName: 'Helvetica'
      },
      {
        x: 375,
        y: 210,
        str: treatmentValue,
        dir: 'ltr',
        width: 25,
        height: 5.28,
        fontName: 'Helvetica'
      }
    )
  }

  rows.forEach((row, index) => {
    const y = 303.77 + index * 10

    content.push({
      x: 145.22,
      y,
      str: row.description ?? `ITEM-${index + 1}`,
      dir: 'ltr',
      width: 95.0241599999999,
      height: 7.92,
      fontName: 'Helvetica'
    })

    if (row.commodity_code !== null && row.commodity_code !== undefined) {
      content.push({
        x: 265.13,
        y,
        str: row.commodity_code,
        dir: 'ltr',
        width: 44.3636999999999,
        height: 7.92,
        fontName: 'Helvetica'
      })
    }

    if (row.country_of_origin !== null && row.country_of_origin !== undefined) {
      content.push({
        x: 312.67,
        y,
        str: row.country_of_origin,
        dir: 'ltr',
        width: 8,
        height: 7.92,
        fontName: 'Helvetica'
      })
    }

    if (
      row.number_of_packages !== null &&
      row.number_of_packages !== undefined
    ) {
      content.push({
        x: 340,
        y,
        str: row.number_of_packages,
        dir: 'ltr',
        width: 9,
        height: 7.92,
        fontName: 'Helvetica'
      })
    }

    if (
      row.total_net_weight_kg !== null &&
      row.total_net_weight_kg !== undefined
    ) {
      content.push({
        x: 380,
        y,
        str: row.total_net_weight_kg,
        dir: 'ltr',
        width: 9,
        height: 7.92,
        fontName: 'Helvetica'
      })
    }

    if (row.nirms !== null && row.nirms !== undefined) {
      content.push({
        x: 480,
        y,
        str: row.nirms,
        dir: 'ltr',
        width: 20,
        height: 7.92,
        fontName: 'Helvetica'
      })
    }
  })

  if (includeTrailingZeroRow) {
    content.push({
      x: 38.76,
      y: 363.55,
      str: '0',
      dir: 'ltr',
      width: 4.40352,
      height: 7.92,
      fontName: 'Helvetica'
    })
  }

  return {
    pages: [
      {
        pageInfo: {
          num: 1
        },
        content
      }
    ]
  }
}

// Expected RMS establishment number for tests
const EXPECTED_RMS_NUMBER = 'RMS-GB-000149-002'

// Mock the pdf-helper module - partial mock to keep real functions
vi.mock('../../../src/utilities/pdf-helper.js', async () => {
  const actual = await vi.importActual('../../../src/utilities/pdf-helper.js')
  return {
    ...actual,
    extractPdf: vi.fn(),
    extractEstablishmentNumbers: vi.fn(() => [EXPECTED_RMS_NUMBER])
  }
})

describe('parsePackingList - Giovanni Model 3', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set default mock for extractEstablishmentNumbers (single RMS)
    vi.mocked(pdfHelper.extractEstablishmentNumbers).mockReturnValue([
      EXPECTED_RMS_NUMBER
    ])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('matches valid Giovanni Model 3 file, calls parser and extracts country_of_origin', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.validModel)
    const result = await parsePackingList({}, filename)
    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('matches valid Giovanni Model 3 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(
      model.invalidModel_MissingColumnCells
    )
    const result = await parsePackingList({}, filename)
    expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
  })

  test('parses model multiple RMS', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.multipleRms)
    vi.mocked(pdfHelper.extractEstablishmentNumbers).mockReturnValue([
      'RMS-GB-000149-002',
      'RMS-GB-000149-003'
    ])
    const result = await parsePackingList({}, filename)
    expect(result).toMatchObject(test_results.multipleRmsTestResult)
  })

  test('parses model missing unit of weight', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.missingKgunit)
    const result = await parsePackingList({}, filename)
    expect(result).toMatchObject(test_results.missingKgTestResult)
  })

  test('returns prohibited item failure when ineligible item is found', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.ineligibleItemModel)
    const result = await parsePackingList({}, filename)

    expect(result).toMatchObject(test_results.ineligibleItemTestResult)
    expect(result.business_checks.failure_reasons).toContain(
      failureReasons.PROHIBITED_ITEM
    )
  })

  test("returns 'No Match' for incorrect file extension", async () => {
    const result = await parsePackingList({}, INVALID_FILENAME)
    expect(result).toMatchObject(NO_MATCH_RESULT)
  })
})

describe('Giovanni Model 3 CoO Validation Acceptance Criteria', () => {
  test('AC1 - Valid NIRMS value passes (NIRMS ONLY header)', async () => {
    const modelAc1 = createGiovanni3PdfModel([
      {
        description: 'VALID ITEM',
        commodity_code: '1234567890',
        country_of_origin: 'IT',
        number_of_packages: '20',
        total_net_weight_kg: '48',
        nirms: 'Green'
      }
    ])

    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(modelAc1)
    const result = await parsePackingList({}, filename)

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.business_checks.failure_reasons).toBeNull()
  })

  test('AC2 - Null NIRMS value fails with missing NIRMS reason', async () => {
    const modelAc2 = createGiovanni3PdfModel([
      {
        description: 'MISSING NIRMS',
        commodity_code: '1234567890',
        country_of_origin: 'IT',
        number_of_packages: '20',
        total_net_weight_kg: '48'
      }
    ])

    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(modelAc2)
    const result = await parsePackingList({}, filename)

    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.NIRMS_MISSING} in page 1 row 1.\n`
    )
  })

  test('AC3 - Invalid NIRMS value fails with invalid NIRMS reason', async () => {
    const modelAc3 = createGiovanni3PdfModel([
      {
        description: 'INVALID NIRMS',
        commodity_code: '1234567890',
        country_of_origin: 'IT',
        number_of_packages: '20',
        total_net_weight_kg: '48',
        nirms: 'MAYBE'
      }
    ])

    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(modelAc3)
    const result = await parsePackingList({}, filename)

    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.NIRMS_INVALID} in page 1 row 1.\n`
    )
  })

  test('AC4 - Null NIRMS values >3 includes summary text', async () => {
    const baseRow = {
      description: 'NULL NIRMS',
      commodity_code: '1234567890',
      country_of_origin: 'IT',
      number_of_packages: '20',
      total_net_weight_kg: '48'
    }
    const modelAc4 = createGiovanni3PdfModel([
      baseRow,
      baseRow,
      baseRow,
      baseRow
    ])

    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(modelAc4)
    const result = await parsePackingList({}, filename)

    expect(result.business_checks.failure_reasons).toContain(
      `${failureReasons.NIRMS_MISSING} in page 1 row 1, page 1 row 2, page 1 row 3 in addition to 1 other locations.\n`
    )
  })

  test('AC5 - Invalid NIRMS values >3 includes summary text', async () => {
    const baseRow = {
      description: 'INVALID NIRMS',
      commodity_code: '1234567890',
      country_of_origin: 'IT',
      number_of_packages: '20',
      total_net_weight_kg: '48',
      nirms: 'MAYBE'
    }
    const modelAc5 = createGiovanni3PdfModel([
      baseRow,
      baseRow,
      baseRow,
      baseRow
    ])

    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(modelAc5)
    const result = await parsePackingList({}, filename)

    expect(result.business_checks.failure_reasons).toContain(
      `${failureReasons.NIRMS_INVALID} in page 1 row 1, page 1 row 2, page 1 row 3 in addition to 1 other locations.\n`
    )
  })

  test('AC6 - Null CoO with true NIRMS fails', async () => {
    const modelAc6 = createGiovanni3PdfModel([
      {
        description: 'NULL COO',
        commodity_code: '1234567890',
        number_of_packages: '20',
        total_net_weight_kg: '48',
        nirms: 'Y'
      }
    ])

    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(modelAc6)
    const result = await parsePackingList({}, filename)

    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.COO_MISSING} in page 1 row 1.\n`
    )
  })

  test('AC7 - Invalid CoO with true NIRMS fails', async () => {
    const modelAc7 = createGiovanni3PdfModel([
      {
        description: 'INVALID COO',
        commodity_code: '1234567890',
        country_of_origin: 'ZZ',
        number_of_packages: '20',
        total_net_weight_kg: '48',
        nirms: 'NIRMS'
      }
    ])

    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(modelAc7)
    const result = await parsePackingList({}, filename)

    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.COO_INVALID} in page 1 row 1.\n`
    )
  })

  test('AC8 - Null CoO >3 with true NIRMS includes summary text', async () => {
    const baseRow = {
      description: 'NULL COO',
      commodity_code: '1234567890',
      number_of_packages: '20',
      total_net_weight_kg: '48',
      nirms: 'GREEN'
    }
    const modelAc8 = createGiovanni3PdfModel([
      baseRow,
      baseRow,
      baseRow,
      baseRow
    ])

    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(modelAc8)
    const result = await parsePackingList({}, filename)

    expect(result.business_checks.failure_reasons).toContain(
      `${failureReasons.COO_MISSING} in page 1 row 1, page 1 row 2, page 1 row 3 in addition to 1 other locations.\n`
    )
  })

  test('AC9 - Invalid CoO >3 with true NIRMS includes summary text', async () => {
    const baseRow = {
      description: 'INVALID COO',
      commodity_code: '1234567890',
      country_of_origin: 'ZZ',
      number_of_packages: '20',
      total_net_weight_kg: '48',
      nirms: 'G'
    }
    const modelAc9 = createGiovanni3PdfModel([
      baseRow,
      baseRow,
      baseRow,
      baseRow
    ])

    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(modelAc9)
    const result = await parsePackingList({}, filename)

    expect(result.business_checks.failure_reasons).toContain(
      `${failureReasons.COO_INVALID} in page 1 row 1, page 1 row 2, page 1 row 3 in addition to 1 other locations.\n`
    )
  })

  test('AC10 - CoO value X or x passes when NIRMS is true', async () => {
    const modelAc10 = createGiovanni3PdfModel([
      {
        description: 'X COO',
        commodity_code: '1234567890',
        country_of_origin: 'x',
        number_of_packages: '20',
        total_net_weight_kg: '48',
        nirms: 'YES'
      }
    ])

    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(modelAc10)
    const result = await parsePackingList({}, filename)

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.business_checks.failure_reasons).toBeNull()
  })

  test('AC12 - Prohibited item >3 with treatment includes summary text', async () => {
    const baseRow = {
      description: 'PROHIBITED WITH TREATMENT',
      commodity_code: '1902209990',
      country_of_origin: 'IT',
      number_of_packages: '20',
      total_net_weight_kg: '48',
      nirms: 'NIRMS'
    }
    const modelAc12 = createGiovanni3PdfModel([
      baseRow,
      baseRow,
      baseRow,
      baseRow
    ])

    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(modelAc12)
    const result = await parsePackingList({}, filename)

    expect(result.business_checks.failure_reasons).toContain(
      `${failureReasons.PROHIBITED_ITEM} in page 1 row 1, page 1 row 2, page 1 row 3 in addition to 1 other locations.\n`
    )
  })

  test('AC13 - Prohibited item without treatment rule fails', async () => {
    const modelAc13 = createGiovanni3PdfModel([
      {
        description: 'PROHIBITED NO TREATMENT',
        commodity_code: '55551234',
        country_of_origin: 'IT',
        number_of_packages: '20',
        total_net_weight_kg: '48',
        nirms: 'YES'
      }
    ])

    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(modelAc13)
    const result = await parsePackingList({}, filename)

    expect(result.business_checks.failure_reasons).toBe(
      `${failureReasons.PROHIBITED_ITEM} in page 1 row 1.\n`
    )
  })

  test('AC14 - Prohibited item >3 without treatment includes summary text', async () => {
    const baseRow = {
      description: 'PROHIBITED NO TREATMENT',
      commodity_code: '55551234',
      country_of_origin: 'IT',
      number_of_packages: '20',
      total_net_weight_kg: '48',
      nirms: 'G'
    }
    const modelAc14 = createGiovanni3PdfModel([
      baseRow,
      baseRow,
      baseRow,
      baseRow
    ])

    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(modelAc14)
    const result = await parsePackingList({}, filename)

    expect(result.business_checks.failure_reasons).toContain(
      `${failureReasons.PROHIBITED_ITEM} in page 1 row 1, page 1 row 2, page 1 row 3 in addition to 1 other locations.\n`
    )
  })

  test('AC15 - trailing zero rows are ignored and do not create failures', async () => {
    const modelAc15 = createGiovanni3PdfModel([
      {
        description: 'VALID ITEM 1',
        commodity_code: '1234567890',
        country_of_origin: 'IT',
        number_of_packages: '20',
        total_net_weight_kg: '48',
        nirms: 'YES'
      }
    ])

    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(modelAc15)
    const result = await parsePackingList({}, filename)

    expect(result.items).toHaveLength(1)
    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.business_checks.failure_reasons).toBeNull()
  })
})
