/**
 * ASDA Model 4 CSV Parser Service Integration Tests
 *
 * Tests the complete parser service workflow for ASDA4 CSV model.
 * Copied from legacy repository with minimal changes (ES6 imports/exports, vitest instead of jest).
 */
import { describe, test, expect, vi } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import model from '../../test-data-and-results/models-csv/asda/model4.js'
import test_results from '../../test-data-and-results/results-csv/asda/model4.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

// Mock deprecated to false for testing
vi.mock('../../../src/services/model-headers-csv.js', async () => {
  const originalModule = await vi.importActual(
    '../../../src/services/model-headers-csv.js'
  )

  return {
    ...originalModule,
    default: {
      ...originalModule.default,
      ASDA4: {
        ...originalModule.default.ASDA4,
        deprecated: false
      }
    }
  }
})

const filename = 'packinglist.csv'

describe('matchesAsdaModel4', () => {
  test('matches valid ASDA Model 4 CSV file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(model.validModel, filename)

    expect(result).toMatchObject(test_results.validTestResult)
  })

  test('matches valid ASDA Model 4 CSV file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.findParser(
      model.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(test_results.invalidTestResult_MissingCells)
  })

  test("returns 'No Match' for incorrect file extension", async () => {
    const result = await parserService.findParser(
      model.validModel,
      INVALID_FILENAME
    )

    expect(result).toMatchObject(NO_MATCH_RESULT)
  })

  test('matches valid ASDA Model 4 CSV file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parserService.findParser(
      model.invalidModel_MultipleRms,
      filename
    )

    expect(result).toMatchObject(test_results.invalidTestResult_MultipleRms)
  })
})
