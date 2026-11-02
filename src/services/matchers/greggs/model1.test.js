/**
 * Greggs Model 1 PDF matcher tests
 *
 * Tests the matcher logic for Greggs landscape packing list PDFs.
 */
import { describe, test, expect, afterEach, vi } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models-pdf/greggs/model1.js'
import { extractPdf } from '../../../utilities/pdf-helper.js'

vi.mock('../../../utilities/pdf-helper.js', () => {
  const actual = vi.importActual('../../../utilities/pdf-helper.js')
  return {
    ...actual,
    extractPdf: vi.fn()
  }
})

describe('matchesGreggs', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('returns EMPTY_FILE when PDF has no pages', async () => {
    extractPdf.mockImplementation(() => ({ pages: [] }))

    const result = await matches({}, 'PackingList.pdf')

    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test.each([
    [matcherResult.CORRECT, model.validModel],
    [matcherResult.GENERIC_ERROR, {}],
    [
      matcherResult.WRONG_ESTABLISHMENT_NUMBER,
      model.invalidModel_WrongRemosNumber
    ],
    [matcherResult.WRONG_HEADER, model.invalidModel_WrongHeaders]
  ])("returns '%s' for greggs model", async (expected, inputModel) => {
    extractPdf.mockImplementation(() => inputModel)

    const result = await matches({}, 'PackingList.pdf')

    expect(result).toBe(expected)
  })
})
