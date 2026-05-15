import { describe, it, expect } from 'vitest'
import { parsePackingList } from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/cds/model3.js'
import testResults from '../../test-data-and-results/results/cds/model3.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

const filename = 'packinglist-cds-model3.xlsx'

describe('matchesCdsModel3', () => {
  it('matches valid CDS Model 3 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parsePackingList(model.validModel, filename)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  it('returns No Match for incorrect file extension', async () => {
    const result = await parsePackingList(model.validModel, INVALID_FILENAME)

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })

  it('matches valid CDS Model 3 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parsePackingList(model.multipleRms, filename)

    expect(result).toMatchObject(testResults.multipleRms)
  })

  it('matches valid CDS Model 3 file with multiple sheets', async () => {
    const result = await parsePackingList(
      model.validModelMultipleSheets,
      filename
    )

    expect(result).toMatchObject(testResults.validTestResultForMultipleSheets)
  })

  it('matches valid CDS Model 3 file with multiple sheets where headers are on different rows', async () => {
    const result = await parsePackingList(
      model.validModelMultipleSheetsHeadersOnDifferentRows,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(2)
    expect(result.items[1].row_location.rowNumber).toBe(3)
  })
})
