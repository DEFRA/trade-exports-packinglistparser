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
