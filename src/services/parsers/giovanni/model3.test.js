/**
 * Giovanni Model 3 PDF Parser Tests
 */

import { describe, it, expect } from 'vitest'
import { parse } from './model3.js'
import parserModel from '../../parser-model.js'

describe('Giovanni Model 3 PDF Parser', () => {
  it('should export parse function', () => {
    expect(parse).toBeDefined()
    expect(typeof parse).toBe('function')
  })

  it('should return NOMATCH for invalid PDF', async () => {
    // Mock invalid PDF
    const mockInvalidPdf = Buffer.from('invalid')
    const result = await parse(mockInvalidPdf)

    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.items).toEqual([])
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })
})
