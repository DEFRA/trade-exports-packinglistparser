import { describe, it, expect } from 'vitest'
import { buildIneligibleIndexByCountry } from './ineligible-index-cache.js'

describe('buildIneligibleIndexByCountry', () => {
  it('should skip items with empty country_of_origin', () => {
    const data = [
      { country_of_origin: ' ' },
      { country_of_origin: '' },
      { country_of_origin: '\t' },
      { country_of_origin: 'US' }
    ]
    const result = buildIneligibleIndexByCountry(data)
    expect(result.size).toBe(1)
    expect(result.has('us')).toBe(true)
    expect(result.get('us')).toHaveLength(1)
  })

  it('should skip items with non-string country_of_origin', () => {
    const data = [
      { country_of_origin: null },
      { country_of_origin: undefined },
      { country_of_origin: 123 },
      { country_of_origin: {} },
      { country_of_origin: 'CA' }
    ]
    const result = buildIneligibleIndexByCountry(data)
    expect(result.size).toBe(1)
    expect(result.has('ca')).toBe(true)
    expect(result.get('ca')).toHaveLength(1)
  })
})
