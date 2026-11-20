import { describe, expect, it } from 'vitest'
import { isZeroOrEmpty } from './parser-row-filter.js'

describe('isZeroOrEmpty', () => {
  it.each([0, null, undefined, '', ' \t\r\n', '0', '00', '0.00', ' 0.00 '])(
    'returns true for %s',
    (value) => {
      expect(isZeroOrEmpty(value)).toBe(true)
    }
  )

  it.each(['0.01', '0.', '.0', '-0', '0kg', '(blank)', 1, false])(
    'returns false for %s',
    (value) => {
      expect(isZeroOrEmpty(value)).toBe(false)
    }
  )
})
