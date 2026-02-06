import { findParser } from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models/booker/model2.js'
import testResults from '../../test-data-and-results/results/booker/model2.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

const filename = 'packinglist-booker-model2.xls'

describe('matchesBookerModel2', () => {
  test('matches valid Booker Model 2 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await findParser(model.validModel, filename)

    expect(result).toMatchObject(testResults.validTestResultParserService)
  })

  test('matches valid Booker Model 2 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await findParser(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(testResults.invalidTestResult_MissingCells)
  })

  test("returns 'No Match' for incorrect file extension", async () => {
    const result = await findParser(model.validModel, INVALID_FILENAME)

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })
})
