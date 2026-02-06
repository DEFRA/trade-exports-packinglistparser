/**
 * Mars Model 1 parser-service integration tests
 */
import { vi, describe, it, expect } from 'vitest'
import * as parserService from '../../../src/services/parser-service.js'
import testData from '../../test-data-and-results/models/mars/model1.js'
import testResults from '../../test-data-and-results/results/mars/model1.js'
import ParserModel from '../../../src/services/parser-model.js'

// Mock data for validation testing
vi.mock('../../../src/services/data/data-iso-codes.json', () => ({
  default: [
    'VALID_ISO',
    'INELIGIBLE_ITEM_ISO',
    'GB',
    'CN',
    'IT',
    'DE',
    'FR',
    'ES',
    'US'
  ]
}))

vi.mock('../../../src/services/data/data-ineligible-items.json', () => ({
  default: [
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO',
      commodity_code: '012',
      type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT'
    }
  ]
}))

const filename = 'packinglist-mars-model1.xlsx'

describe('parsesMarsModel1', () => {
  it('matches valid Mars Model 1 file, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(testData.validModel, filename)

    expect(result).toMatchObject(testResults.validTestResult)
  })

  it('matches valid Mars Model 1 file, calls parser, but returns all_required_fields_present as false when cells missing', async () => {
    const result = await parserService.findParser(
      testData.invalidModel_MissingColumnCells,
      filename
    )

    expect(result).toMatchObject(testResults.invalidTestResult_MissingCells)
  })

  it("returns 'No Match' for incorrect file extension", async () => {
    const filename = 'packinglist.wrong'
    const invalidTestResult_NoMatch = {
      business_checks: {
        all_required_fields_present: false,
        failure_reasons: null
      },
      items: [],
      registration_approval_number: null,
      parserModel: ParserModel.NOMATCH
    }

    const result = await parserService.findParser(testData.validModel, filename)

    expect(result).toMatchObject(invalidTestResult_NoMatch)
  })

  it('matches valid Mars Model 1 file, calls parser and returns all_required_fields_present as false for multiple rms', async () => {
    const result = await parserService.findParser(
      testData.multipleRms,
      filename
    )

    expect(result).toMatchObject(testResults.multipleRms)
  })

  it('matches valid Mars Model 1 file, calls parser and returns all_required_fields_present as false for missing kg unit', async () => {
    const result = await parserService.findParser(
      testData.missingKgunit,
      filename
    )
    expect(result).toMatchObject(testResults.missingKgunit)
  })

  it('matches valid Mars Model 1 file with multiple sheets where headers are on different rows, calls parser and returns all_required_fields_present as true', async () => {
    const result = await parserService.findParser(
      testData.validModelMultipleSheetsHeadersOnDifferentRows,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBe(true)
    expect(result.items[0].row_location.rowNumber).toBe(3)
    expect(result.items[1].row_location.rowNumber).toBe(4)
  })
})

describe('CoO Validation Tests', () => {
  it.each([
    {
      description: 'missing Nirms',
      model: testData.missingNirms,
      expected: 'NIRMS/Non-NIRMS goods not specified'
    },
    {
      description: 'invalid Nirms',
      model: testData.invalidNirms,
      expected: 'Invalid entry for NIRMS/Non-NIRMS'
    },
    {
      description: 'missing CoO',
      model: testData.missingCoO,
      expected: 'Missing Country of Origin'
    },
    {
      description: 'invalid CoO',
      model: testData.invalidCoO,
      expected: 'Invalid Country of Origin ISO Code'
    },
    {
      description: 'ineligible item',
      model: testData.ineligibleItem,
      expected: 'Prohibited item identified on the packing list'
    }
  ])('checks CoO validation for $description', async ({ model, expected }) => {
    const result = await parserService.findParser(model, filename)

    expect(result.business_checks.failure_reasons).not.toBeNull()
    expect(result.business_checks.failure_reasons).toContain(expected)
  })
})
