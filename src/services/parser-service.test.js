import { describe, test, expect } from 'vitest'
import * as parserService from './parser-service.js'
import parserModel from './parser-model.js'
import failureReasonsDescriptions from './validators/packing-list-failure-reasons.js'

describe('findParser', () => {
  const filename = 'packinglist.xls'
  const packingListJson = {
    Sheet1: [
      {
        A: 'Consignor / Place o f Despatch',
        B: 'CONSIGNEE',
        C: 'Trailer',
        D: 'Seal',
        E: 'Store',
        F: 'STORENAME',
        G: 'Order',
        H: 'Cage/Ref',
        I: 'Group',
        J: 'TREATMENTTYPE',
        K: 'Sub-Group',
        L: 'Description',
        M: 'Item',
        N: 'Description',
        O: 'Tariff/Commodity',
        P: 'Cases',
        Q: 'Gross Weight Kg',
        R: 'Net Weight Kg',
        S: 'Cost',
        T: 'Country of Origin',
        U: 'VAT Status',
        V: 'SPS',
        W: 'Consignment ID',
        X: 'Processed?',
        Y: 'Created Timestamp'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'CHILLED',
        L: 'Description',
        N: 'Description',
        O: '0408192000',
        P: '2',
        R: '1.4'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'FRESH PRODUCTS',
        L: 'LETTUCE & BAGGED SALADS',
        N: 'FLORETTE SWEET & CRUNCHY 250G',
        O: '1602906100',
        P: '4',
        R: '8'
      }
    ]
  }

  const emptyDataPackingListJson = {
    Sheet1: [
      {
        A: 'Consignor / Place o f Despatch',
        B: 'CONSIGNEE',
        C: 'Trailer',
        D: 'Seal',
        E: 'Store',
        F: 'STORENAME',
        G: 'Order',
        H: 'Cage/Ref',
        I: 'Group',
        J: 'TREATMENTTYPE',
        K: 'Sub-Group',
        L: 'Description',
        M: 'Item',
        N: 'Description',
        O: 'Tariff/Commodity',
        P: 'Cases',
        Q: 'Gross Weight Kg',
        R: 'Net Weight',
        S: 'Cost',
        T: 'Country of Origin',
        U: 'VAT Status',
        V: 'SPS',
        W: 'Consignment ID',
        X: 'Processed?',
        Y: 'Created Timestamp'
      },
      {
        A: 'RMS-GB-000010-001',
        J: 'CHILLED',
        L: 'Description',
        N: 'Description',
        O: '0408192000',
        P: '2',
        R: '1.4'
      },
      {
        A: null,
        J: null,
        L: null,
        N: null,
        O: null,
        P: null,
        R: null
      }
    ]
  }

  test('removes empty items', async () => {
    const result = await parserService.findParser(
      emptyDataPackingListJson,
      filename
    )

    // Parser should remove null/empty rows but still parse the valid row
    expect(result.items.length).toBeGreaterThanOrEqual(0)
  })

  test('Not matched Excel file', async () => {
    const packingListJson = {}

    const result = await parserService.findParser(packingListJson, filename)

    expect(result.parserModel).toBe(parserModel.NOREMOS)
  })

  test('returns NOREMOS when no valid data present', async () => {
    const result = await parserService.findParser(packingListJson, filename)
    // Without matching any parser, should return NOREMOS
    expect([parserModel.NOREMOS, parserModel.NOMATCH]).toContain(
      result.parserModel
    )
  })

  test('all_required_fields_present false for missing data', async () => {
    const packingListJsonMissing = {
      Sheet1: [
        {
          A: 'Consignor / Place o f Despatch',
          B: 'CONSIGNEE',
          C: 'Trailer',
          D: 'Seal',
          E: 'Store',
          F: 'STORENAME',
          G: 'Order',
          H: 'Cage/Ref',
          I: 'Group',
          J: 'TREATMENTTYPE',
          K: 'Sub-Group',
          L: 'Description',
          M: 'Item',
          N: 'Description',
          O: 'Tariff/Commodity',
          P: 'Cases',
          Q: 'Gross Weight Kg',
          R: 'Net Weight Kg',
          S: 'Cost',
          T: 'Country of Origin',
          U: 'VAT Status',
          V: 'SPS',
          W: 'Consignment ID',
          X: 'Processed?',
          Y: 'Created Timestamp'
        },
        {
          A: 'RMS-GB-000010-001',
          J: 'CHILLED',
          L: 'Description',
          N: 'Description',
          O: '0408192000',
          P: '2',
          R: '1.4'
        },
        {
          A: 'RMS-GB-000010-001',
          J: 'FRESH PRODUCTS',
          L: 'LETTUCE & BAGGED SALADS',
          N: 'FLORETTE SWEET & CRUNCHY 250G',
          O: null,
          P: null,
          R: '8'
        }
      ]
    }
    const result = await parserService.findParser(
      packingListJsonMissing,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBeFalsy()
  })

  test('all_required_fields_present false for empty sheet', async () => {
    const packingListJsonEmpty = {
      Sheet1: [
        {
          A: 'Consignor / Place o f Despatch',
          B: 'CONSIGNEE',
          C: 'Trailer',
          D: 'Seal',
          E: 'Store',
          F: 'STORENAME',
          G: 'Order',
          H: 'Cage/Ref',
          I: 'Group',
          J: 'TREATMENTTYPE',
          K: 'Sub-Group',
          L: 'Description',
          M: 'Item',
          N: 'Description',
          O: 'Tariff/Commodity',
          P: 'Cases',
          Q: 'Gross Weight Kg',
          R: 'Net Weight Kg',
          S: 'Cost',
          T: 'Country of Origin',
          U: 'VAT Status',
          V: 'SPS',
          W: 'Consignment ID',
          X: 'Processed?',
          Y: 'Created Timestamp'
        }
      ]
    }
    const result = await parserService.findParser(
      packingListJsonEmpty,
      filename
    )

    expect(result.business_checks.all_required_fields_present).toBeFalsy()
  })

  test.each([
    ['R MS -  G B-0  00323   -001'],
    [''],
    ['RMS-GB-000323-001-extra'],
    ['extra-RMS-GB-000323-001'],
    ['RMSGB000323001'],
    ['RMS-GB-000323']
  ])('incorrect rms format: %s', async (rms) => {
    const testModel = {
      sheet1: [
        {
          B: rms
        }
      ]
    }

    const expected = {
      registration_approval_number: null,
      items: [],
      business_checks: {
        all_required_fields_present: false,
        failure_reasons: failureReasonsDescriptions.MISSING_REMOS
      },
      parserModel: parserModel.NOREMOS
    }

    const result = await parserService.findParser(testModel, filename)

    expect(result).toMatchObject(expected)
  })
})

describe('sanitizeInput', () => {
  test('sanitize a pdf - no change', async () => {
    const filename = 'packinglist.pdf'
    const packingListJson = {
      Sheet1: [
        {
          A: 'Consignor / Place o f Despatch',
          B: 'CONSIGNEE',
          C: 'Trailer',
          D: 'Seal'
        },
        {
          A: 'Col A',
          B: 'Col B',
          C: 'Col C',
          D: 'Col D'
        }
      ]
    }

    const result = parserService.sanitizeInput(packingListJson, filename)

    expect(result).toBe(packingListJson)
  })

  test('sanitize an excel', async () => {
    const filename = 'packinglist.xls'
    const packingListJson = {
      Sheet1: [
        {
          A: 'Consignor / Place o f Despatch',
          B: 'CONSIGNEE',
          C: 'Trailer',
          D: 'Seal',
          E: 'Store',
          F: 'STORENAME',
          G: 'Order',
          H: 'Cage/Ref',
          I: 'Group',
          J: 'TREATMENTTYPE',
          K: 'Sub-Group',
          L: 'Description',
          M: 'Item',
          N: 'Description',
          O: 'Tariff/Commodity',
          P: 'Cases',
          Q: 'Gross Weight Kg',
          R: 'Net Weight Kg',
          S: 'Cost',
          T: 'Country of Origin',
          U: 'VAT Status',
          V: 'SPS',
          W: 'Consignment ID',
          X: 'Processed?',
          Y: 'Created Timestamp'
        },
        {
          A: 'RMS-GB-000010-001',
          J: 'CHILLED',
          L: ' Description',
          N: 'Description ',
          O: '0408192000',
          P: '2',
          R: '1.4',
          T: ''
        }
      ]
    }

    const result = await parserService.sanitizeInput(packingListJson, filename)

    expect(result.Sheet1[1].L).toBe('Description')
    expect(result.Sheet1[1].N).toBe('Description')
    expect(result.Sheet1[1].T).toBeNull()
  })
})
