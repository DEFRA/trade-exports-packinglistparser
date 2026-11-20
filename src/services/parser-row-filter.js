const ZERO_TEXT_PATTERN = /^0+(\.0+)?$/

/**
 * Check whether a mapped value is zero or empty.
 * @param {*} value - Mapped cell value.
 * @returns {boolean} True for zero, zero-only text, nullish, or whitespace-only values.
 */
export function isZeroOrEmpty(value) {
  if (value === 0 || value === null || value === undefined) {
    return true
  }

  if (typeof value !== 'string') {
    return false
  }

  const text = value.trim()
  return text === '' || ZERO_TEXT_PATTERN.test(text)
}
