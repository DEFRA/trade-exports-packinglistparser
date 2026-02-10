import { findParser } from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/savers/model1.js'
import testResults from '../../test-data-and-results/results/savers/model1.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

const filename = 'packinglist-savers-model1.xlsx'

describe('matchesSaversModel1', () => {
  test('matches valid Savers Model 1 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await findParser(model.validModel, filename)

    expect(result).toMatchObject(testResults.validTestResultParserService)
  })

  test('matches valid Savers Model 1 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await findParser(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(
      testResults.invalidTestResult_MissingCellsParserService
    )
  })

  test("returns 'No Match' for incorrect file extension", async () => {
    const result = await findParser(model.validModel, INVALID_FILENAME)

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })
})
