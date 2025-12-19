import { describe, it, expect } from 'vitest'
import { rowFinder } from './row-finder.js'

describe('findHeaderRow', () => {
  it.each([
    ['DESCRIPTION', 1],
    ['DESCRIPTIONN', -1]
  ])("when the header is '%s' should return '%s'", (header, expected) => {
    const input = [
      {},
      {
        G: 'DESCRIPTION'
      }
    ]

    expect(rowFinder(input, (x) => x.G === header)).toBe(expected)
  })
})
