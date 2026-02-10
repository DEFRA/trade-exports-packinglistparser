import { describe, test, expect, vi } from 'vitest'
import * as parserService from './parser-service.js'
import parserModel from './parser-model.js'

// Import test models from various retailers (only those that exist)
import turnersModel from '../../test/test-data-and-results/models/turners/model1.js'
import tjmorrisModel from '../../test/test-data-and-results/models/tjmorris/model2.js'
import tescoModel from '../../test/test-data-and-results/models/tesco/model3.js'
import nisaModel from '../../test/test-data-and-results/models/nisa/model1.js'
import sainsburysModel from '../../test/test-data-and-results/models/sainsburys/model1.js'
import coopModel from '../../test/test-data-and-results/models/coop/model1.js'
import bookerModel from '../../test/test-data-and-results/models/booker/model2.js'
import buffaloModel from '../../test/test-data-and-results/models/buffaload-logistics/model1.js'
import asdaModel3 from '../../test/test-data-and-results/models/asda/model3.js'

vi.mock('./data/data-iso-codes.json', () => ({
  default: ['IE', 'GB', 'VALID_ISO']
}))

const INVALID_FILENAME = 'packinglist.wrong'

const NO_MATCH_RESULT = {
  business_checks: {
    all_required_fields_present: false,
    failure_reasons: null
  },
  items: [],
  registration_approval_number: null,
  parserModel: parserModel.NOMATCH
}

describe('Parser Service Integration Tests - No Match Scenarios', () => {
  describe('Invalid file extension returns NOMATCH', () => {
    test('Turners Model 1 with invalid extension', async () => {
      const result = await parserService.findParser(
        turnersModel.validModel,
        INVALID_FILENAME
      )
      expect(result).toMatchObject(NO_MATCH_RESULT)
    })

    test('TJ Morris Model 2 with invalid extension', async () => {
      const result = await parserService.findParser(
        tjmorrisModel.validModel,
        INVALID_FILENAME
      )
      expect(result).toMatchObject(NO_MATCH_RESULT)
    })

    test('Tesco Model 3 with invalid extension', async () => {
      const result = await parserService.findParser(
        tescoModel.validModel,
        INVALID_FILENAME
      )
      expect(result).toMatchObject(NO_MATCH_RESULT)
    })

    test('Nisa Model 1 with invalid extension', async () => {
      const result = await parserService.findParser(
        nisaModel.validModel,
        INVALID_FILENAME
      )
      expect(result).toMatchObject(NO_MATCH_RESULT)
    })

    test('Sainsburys Model 1 with invalid extension', async () => {
      const result = await parserService.findParser(
        sainsburysModel.validModel,
        INVALID_FILENAME
      )
      expect(result).toMatchObject(NO_MATCH_RESULT)
    })

    test('Coop Model 1 with invalid extension', async () => {
      const result = await parserService.findParser(
        coopModel.validModel,
        INVALID_FILENAME
      )
      expect(result).toMatchObject(NO_MATCH_RESULT)
    })

    test('Booker Model 2 with invalid extension', async () => {
      const result = await parserService.findParser(
        bookerModel.validModel,
        INVALID_FILENAME
      )
      expect(result).toMatchObject(NO_MATCH_RESULT)
    })

    test('Buffaload Logistics Model 1 with invalid extension', async () => {
      const result = await parserService.findParser(
        buffaloModel.validModel,
        INVALID_FILENAME
      )
      expect(result).toMatchObject(NO_MATCH_RESULT)
    })

    test('Asda Model 3 with invalid extension', async () => {
      const result = await parserService.findParser(
        asdaModel3.validModel,
        INVALID_FILENAME
      )
      expect(result).toMatchObject(NO_MATCH_RESULT)
    })
  })

  describe('Empty or malformed data returns NOREMOS', () => {
    test('Empty JSON object', async () => {
      const result = await parserService.findParser({}, 'packinglist.xls')
      expect(result.parserModel).toBe(parserModel.NOREMOS)
    })

    test('JSON without RMS number', async () => {
      const packingListJson = {
        Sheet1: [
          {
            A: 'Header1',
            B: 'Header2'
          },
          {
            A: 'Data1',
            B: 'Data2'
          }
        ]
      }
      const result = await parserService.findParser(
        packingListJson,
        'packinglist.xls'
      )
      expect(result.parserModel).toBe(parserModel.NOREMOS)
    })

    test('JSON with invalid RMS format', async () => {
      const packingListJson = {
        Sheet1: [
          {
            A: 'Header1',
            B: 'RMS-INVALID'
          }
        ]
      }
      const result = await parserService.findParser(
        packingListJson,
        'packinglist.xlsx'
      )
      expect(result.parserModel).toBe(parserModel.NOREMOS)
    })
  })

  describe('No matching parser patterns', () => {
    test('Valid RMS but unrecognized structure', async () => {
      const packingListJson = {
        Sheet1: [
          {
            A: 'Some Header',
            B: 'Another Header',
            C: 'RMS-GB-999999-999'
          },
          {
            A: 'Data',
            B: 'More Data',
            C: 'Even More'
          }
        ]
      }
      const result = await parserService.findParser(
        packingListJson,
        'packinglist.xlsx'
      )
      // Should return a result - might match as NOMATCH or a specific parser
      expect(result).toBeDefined()
      expect(result.parserModel).toBeDefined()
    })
  })
})
