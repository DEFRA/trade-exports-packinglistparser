/**
 * M&S Model 1 PDF matcher tests
 *
 * Tests the matcher logic for M&S packing list PDFs.
 * ALL test cases copied from legacy repository without modification.
 */
import { describe, test, expect, afterEach, vi } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models-pdf/mands/model1.js'
import { extractPdf } from '../../../utilities/pdf-helper.js'
import headers from '../../model-headers-pdf.js'

vi.mock('../../../utilities/pdf-helper.js', () => {
  const actual = vi.importActual('../../../utilities/pdf-helper.js')
  return {
    ...actual,
    extractPdf: vi.fn()
  }
})

describe('matchesMandS', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('returns EMPTY_FILE when PDF has no pages', async () => {
    extractPdf.mockImplementation(() => ({ pages: [] }))

    const result = await matches({}, 'PackingList.pdf')

    expect(result).toEqual(matcherResult.EMPTY_FILE)
  })

  test('ignores inherited header fields when validating headers', async () => {
    const originalHeaders = headers.MANDS1.headers
    const inheritedHeaders = {
      inheritedField: { regex: /this-should-not-be-checked/ }
    }
    const headersWithPrototype = Object.create(inheritedHeaders)
    Object.assign(headersWithPrototype, originalHeaders)
    try {
      headers.MANDS1.headers = headersWithPrototype

      extractPdf.mockImplementation(() => model.validModel)

      const result = await matches({}, 'PackingList.pdf')

      expect(result).toEqual(matcherResult.CORRECT)
    } finally {
      headers.MANDS1.headers = originalHeaders
    }
  })

  test.each([
    [matcherResult.CORRECT, model.validModel],
    [matcherResult.GENERIC_ERROR, {}],
    [
      matcherResult.WRONG_ESTABLISHMENT_NUMBER,
      model.invalidModel_WrongRemosNumber
    ],
    [
      matcherResult.WRONG_ESTABLISHMENT_NUMBER,
      model.invalidModel_MissingRemosElement
    ],
    [matcherResult.WRONG_HEADER, model.invalidModel_WrongHeaders]
  ])("returns '%s' for mands model", async (expected, inputModel) => {
    const filename = 'PackingList.xlsx'
    extractPdf.mockImplementation(() => {
      return inputModel
    })

    const result = await matches({}, filename)

    expect(result).toEqual(expected)
  })
})
