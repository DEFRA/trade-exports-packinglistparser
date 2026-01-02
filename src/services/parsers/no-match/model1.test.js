import { describe, test, expect } from 'vitest'
import { noRemosParse, unrecognisedParse } from './model1.js'
import parserModel from '../../parser-model.js'

describe('no-match parsers', () => {
  test('noRemosParse returns NOREMOS result', () => {
    const result = noRemosParse({}, 'test.xlsx')

    expect(result.parserModel).toBe(parserModel.NOREMOS)
    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.items).toEqual([])
    expect(result.registration_approval_number).toBe(null)
  })

  test('unrecognisedParse returns NOMATCH result', () => {
    const result = unrecognisedParse({}, 'test.xlsx')

    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
    expect(result.items).toEqual([])
    expect(result.registration_approval_number).toBe(null)
  })
})
