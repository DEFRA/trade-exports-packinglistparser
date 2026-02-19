import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models/boots/model1.js'

describe('matchesBoots', () => {
  test.each([
    [matcherResult.CORRECT, model.validModel],
    [matcherResult.GENERIC_ERROR, null],
    [matcherResult.WRONG_ESTABLISHMENT_NUMBER, model.wrongEstablishment],
    [
      matcherResult.WRONG_ESTABLISHMENT_NUMBER,
      model.wrongEstablishment_clippedRMS
    ],
    [matcherResult.WRONG_HEADER, model.incorrectHeader],
    [matcherResult.EMPTY_FILE, model.emptyFile]
  ])("returns '%s' for boots model", async (expected, inputModel) => {
    const filename = 'PackingList.xlsx'

    const result = matches(inputModel, filename)

    expect(result).toEqual(expected)
  })
})
