/**
 * Giovanni Model 3 PDF Matcher Tests
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { matches } from './model3.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models-pdf/giovanni/model3.js'
import * as pdfHelper from '../../../utilities/pdf-helper.js'

const filename = 'giovanni-packinglist.pdf'

// Mock the pdf-helper module - only mock extractPdf, keep getHeaders real
vi.mock('../../../utilities/pdf-helper.js', async () => {
  const actual = await vi.importActual('../../../utilities/pdf-helper.js')
  return {
    ...actual,
    extractPdf: vi.fn()
  }
})

describe('Giovanni Model 3 PDF Matcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('return correct', async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.validModel)
    const result = await matches(Buffer.from('mock-pdf'), filename)
    expect(result).toBe(matcherResult.CORRECT)
  })

  test("returns 'Empty File' matcher result for empty json", async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue({ pages: [] })
    const result = await matches(Buffer.from('mock-pdf'), filename)
    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test("returns 'Wrong Establishment Number' matcher result for missing establishment number", async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.wrongEstablishment)
    const result = await matches(Buffer.from('mock-pdf'), filename)
    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test("return 'Wrong Header' matcher result for incorrect header values", async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(model.incorrectHeader)
    const result = await matches(Buffer.from('mock-pdf'), filename)
    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test("return 'Wrong Header' matcher result for incorrect header values for multiple pages", async () => {
    vi.mocked(pdfHelper.extractPdf).mockResolvedValue(
      model.incorrectHeaderMulitplePages
    )
    const result = await matches(Buffer.from('mock-pdf'), filename)
    expect(result).toBe(matcherResult.WRONG_HEADER)
  })

  test("return 'Generic Error' matcher result when an error occurs", async () => {
    vi.mocked(pdfHelper.extractPdf).mockRejectedValue(new Error('Mock error'))
    const result = await matches(null, null)
    expect(result).toBe(matcherResult.GENERIC_ERROR)
  })
})
