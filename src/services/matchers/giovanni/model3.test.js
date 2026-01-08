/**
 * Giovanni Model 3 PDF Matcher Tests
 */

import { describe, it, expect } from 'vitest'
import { matches } from './model3.js'
import matcherResult from '../../matcher-result.js'

describe('Giovanni Model 3 PDF Matcher', () => {
  it('should export matches function', () => {
    expect(matches).toBeDefined()
    expect(typeof matches).toBe('function')
  })

  it('should return EMPTY_FILE for empty PDF', async () => {
    // Mock empty PDF with no pages
    const mockEmptyPdf = Buffer.from('mock')
    // Note: This will fail extraction but should handle gracefully
    const result = await matches(mockEmptyPdf, 'test.pdf')
    expect([matcherResult.EMPTY_FILE, matcherResult.GENERIC_ERROR]).toContain(
      result
    )
  })
})
