/**
 * Unit tests for row filter utilities
 */
import { describe, test, expect } from 'vitest'
import {
  isTotalsRow,
  isRepeatedHeaderRow,
  isEmptyRow,
  filterValidatableRows
} from './row-filter-utilities.js'

describe('Row Filter Utilities', () => {
  describe('isTotalsRow', () => {
    const headerCols = {
      description: 'A',
      commodity_code: 'B',
      number_of_packages: 'C',
      total_net_weight_kg: 'D',
      gross_weight_kg: 'E'
    }

    const config = {
      skipTotalsRows: true,
      totalsRowKeywords: ['TOTAL', 'SUBTOTAL', 'SUM', 'SUMMARY', 'GRAND TOTAL'],
      totalsRowPattern: {
        hasNumericOnly: true,
        descriptionEmpty: true,
        commodityCodeEmpty: true
      }
    }

    test('should identify row with TOTAL keyword in description', () => {
      const row = {
        A: 'TOTAL',
        B: null,
        C: 100,
        D: 500
      }
      expect(isTotalsRow(row, headerCols, config)).toBe(true)
    })

    test('should identify row with empty description and commodity code but numeric data', () => {
      const row = {
        A: null,
        B: null,
        C: 75,
        D: 300
      }
      expect(isTotalsRow(row, headerCols, config)).toBe(true)
    })

    test('should NOT identify row with description as totals row', () => {
      const row = {
        A: 'Product Name',
        B: null,
        C: 10,
        D: 50
      }
      expect(isTotalsRow(row, headerCols, config)).toBe(false)
    })

    test('should return false when skipTotalsRows is false', () => {
      const row = {
        A: 'TOTAL',
        B: null,
        C: 100
      }
      const configDisabled = { ...config, skipTotalsRows: false }
      expect(isTotalsRow(row, headerCols, configDisabled)).toBe(false)
    })

    test('should return false when totalsRowKeywords is missing', () => {
      const row = {
        A: 'TOTAL',
        B: null,
        C: 100
      }
      const configNoKeywords = { ...config, totalsRowKeywords: null }
      expect(isTotalsRow(row, headerCols, configNoKeywords)).toBe(false)
    })

    test('should still check pattern when headerCols.description is missing', () => {
      const row = {
        A: null,
        B: null,
        C: 100,
        D: 500
      }
      const headerColsNoDesc = { ...headerCols, description: null }
      // Should still match via pattern check
      expect(isTotalsRow(row, headerColsNoDesc, config)).toBe(true)
    })

    test('should still check pattern when description value is not a string', () => {
      const row = {
        A: 12345,
        B: null,
        C: 100,
        D: 500
      }
      // Should still match via pattern check (numeric data present)
      expect(isTotalsRow(row, headerCols, config)).toBe(true)
    })

    test('should identify row with country_of_origin populated as NOT totals', () => {
      const row = {
        A: null,
        B: null,
        C: 75,
        D: 300
      }
      const headerColsWithCoO = {
        ...headerCols,
        country_of_origin: 'F'
      }
      const rowWithCoO = {
        ...row,
        F: 'GB'
      }
      expect(isTotalsRow(rowWithCoO, headerColsWithCoO, config)).toBe(false)
    })

    test('should handle pattern with hasNumericOnly false', () => {
      const row = {
        A: null,
        B: null,
        C: null,
        D: null
      }
      const configNoNumeric = {
        ...config,
        totalsRowPattern: {
          ...config.totalsRowPattern,
          hasNumericOnly: false
        }
      }
      expect(isTotalsRow(row, headerCols, configNoNumeric)).toBe(false)
    })

    test('should return false when totalsRowPattern is not defined', () => {
      const row = {
        A: null,
        B: null,
        C: 75,
        D: 300
      }
      const configNoPattern = {
        skipTotalsRows: true,
        totalsRowKeywords: []
      }
      expect(isTotalsRow(row, headerCols, configNoPattern)).toBe(false)
    })

    test('should identify totals when commodity code is populated but pattern allows', () => {
      const row = {
        A: null,
        B: 'Some code',
        C: 75,
        D: 300
      }
      const configNoCommodityCheck = {
        ...config,
        totalsRowPattern: {
          hasNumericOnly: true,
          descriptionEmpty: true,
          commodityCodeEmpty: false
        }
      }
      expect(isTotalsRow(row, headerCols, configNoCommodityCheck)).toBe(true)
    })

    test('should identify totals when description is populated but pattern allows', () => {
      const row = {
        A: 'Some text',
        B: null,
        C: 75,
        D: 300
      }
      const configNoDescCheck = {
        ...config,
        totalsRowPattern: {
          hasNumericOnly: true,
          descriptionEmpty: false,
          commodityCodeEmpty: true
        }
      }
      expect(isTotalsRow(row, headerCols, configNoDescCheck)).toBe(true)
    })

    test('should return false when no numeric data exists', () => {
      const row = {
        A: null,
        B: null,
        C: null,
        D: null
      }
      expect(isTotalsRow(row, headerCols, config)).toBe(false)
    })

    test('should NOT identify row as totals when commodity code is populated and pattern requires empty', () => {
      const row = {
        A: null,
        B: '12345',
        C: 75,
        D: 300
      }
      expect(isTotalsRow(row, headerCols, config)).toBe(false)
    })

    test('should NOT identify row as totals when description is populated and pattern requires empty', () => {
      const row = {
        A: 'Product description',
        B: null,
        C: 75,
        D: 300
      }
      expect(isTotalsRow(row, headerCols, config)).toBe(false)
    })
  })

  describe('isRepeatedHeaderRow', () => {
    const headerCols = {
      description: 'A',
      commodity_code: 'B',
      number_of_packages: 'C'
    }

    const originalHeaderRow = {
      A: 'Description',
      B: 'Commodity Code',
      C: 'No of Packages'
    }

    const config = {
      skipRepeatedHeaders: true,
      regex: {
        description: /description/i,
        commodity_code: /commodity/i,
        number_of_packages: /packages/i
      }
    }

    test('should identify exact header match', () => {
      const row = {
        A: 'Description',
        B: 'Commodity Code',
        C: 'No of Packages'
      }
      expect(
        isRepeatedHeaderRow(row, originalHeaderRow, headerCols, config)
      ).toBe(true)
    })

    test('should identify case-insensitive header match', () => {
      const row = {
        A: 'description',
        B: 'commodity code',
        C: 'no of packages'
      }
      expect(
        isRepeatedHeaderRow(row, originalHeaderRow, headerCols, config)
      ).toBe(true)
    })

    test('should NOT identify row with different values', () => {
      const row = {
        A: 'Product 1',
        B: '12345',
        C: '10'
      }
      expect(
        isRepeatedHeaderRow(row, originalHeaderRow, headerCols, config)
      ).toBe(false)
    })

    test('should return false when skipRepeatedHeaders is false', () => {
      const row = {
        A: 'Description',
        B: 'Commodity Code',
        C: 'No of Packages'
      }
      const configDisabled = { ...config, skipRepeatedHeaders: false }
      expect(
        isRepeatedHeaderRow(row, originalHeaderRow, headerCols, configDisabled)
      ).toBe(false)
    })

    test('should return false when config.regex is missing', () => {
      const row = {
        A: 'Description',
        B: 'Commodity Code',
        C: 'No of Packages'
      }
      const configNoRegex = { skipRepeatedHeaders: true }
      expect(
        isRepeatedHeaderRow(row, originalHeaderRow, headerCols, configNoRegex)
      ).toBe(false)
    })

    test('should return false when no mandatory fields are mapped', () => {
      const row = {
        A: 'Description',
        B: 'Commodity Code',
        C: 'No of Packages'
      }
      const emptyHeaderCols = {}
      expect(
        isRepeatedHeaderRow(row, originalHeaderRow, emptyHeaderCols, config)
      ).toBe(false)
    })

    test('should return false when row value is missing', () => {
      const row = {
        A: null,
        B: 'Commodity Code',
        C: 'No of Packages'
      }
      expect(
        isRepeatedHeaderRow(row, originalHeaderRow, headerCols, config)
      ).toBe(false)
    })

    test('should return false when originalHeaderRow value is missing', () => {
      const row = {
        A: 'Description',
        B: 'Commodity Code',
        C: 'No of Packages'
      }
      const incompleteHeaderRow = {
        A: null,
        B: 'Commodity Code',
        C: 'No of Packages'
      }
      expect(
        isRepeatedHeaderRow(row, incompleteHeaderRow, headerCols, config)
      ).toBe(false)
    })

    test('should return false when only some mandatory fields match', () => {
      const row = {
        A: 'Description',
        B: 'Different Value',
        C: 'No of Packages'
      }
      expect(
        isRepeatedHeaderRow(row, originalHeaderRow, headerCols, config)
      ).toBe(false)
    })
  })

  describe('isEmptyRow', () => {
    const headerCols = {
      description: 'A',
      commodity_code: 'B',
      number_of_packages: 'C'
    }

    test('should identify row with all null values', () => {
      const row = {
        A: null,
        B: null,
        C: null
      }
      expect(isEmptyRow(row, headerCols)).toBe(true)
    })

    test('should identify row with empty strings', () => {
      const row = {
        A: '',
        B: '',
        C: ''
      }
      expect(isEmptyRow(row, headerCols)).toBe(true)
    })

    test('should identify row with whitespace only', () => {
      const row = {
        A: '   ',
        B: '  ',
        C: ''
      }
      expect(isEmptyRow(row, headerCols)).toBe(true)
    })

    test('should NOT identify row with any non-empty value', () => {
      const row = {
        A: 'Product',
        B: null,
        C: null
      }
      expect(isEmptyRow(row, headerCols)).toBe(false)
    })
  })

  describe('filterValidatableRows', () => {
    const headerCols = {
      description: 'A',
      commodity_code: 'B',
      number_of_packages: 'C',
      total_net_weight_kg: 'D'
    }

    const config = {
      skipTotalsRows: true,
      skipRepeatedHeaders: true,
      totalsRowKeywords: ['TOTAL'],
      totalsRowPattern: {
        hasNumericOnly: true,
        descriptionEmpty: true,
        commodityCodeEmpty: true
      },
      regex: {
        description: /description/i,
        commodity_code: /commodity/i
      }
    }

    test('should filter out empty rows', () => {
      const packingListJson = [
        { A: 'Description', B: 'Commodity Code', C: 'Packages', D: 'Weight' },
        { A: 'Product 1', B: '12345', C: '10', D: '100' },
        { A: null, B: null, C: null, D: null },
        { A: 'Product 2', B: '67890', C: '5', D: '50' }
      ]

      const result = filterValidatableRows(
        packingListJson,
        0,
        1,
        headerCols,
        config,
        'Sheet1'
      )

      expect(result).toHaveLength(2)
      expect(result[0].row.A).toBe('Product 1')
      expect(result[1].row.A).toBe('Product 2')
    })

    test('should filter out totals rows', () => {
      const packingListJson = [
        { A: 'Description', B: 'Commodity Code', C: 'Packages', D: 'Weight' },
        { A: 'Product 1', B: '12345', C: '10', D: '100' },
        { A: 'TOTAL', B: null, C: '10', D: '100' },
        { A: 'Product 2', B: '67890', C: '5', D: '50' }
      ]

      const result = filterValidatableRows(
        packingListJson,
        0,
        1,
        headerCols,
        config,
        'Sheet1'
      )

      expect(result).toHaveLength(2)
      expect(result[0].row.A).toBe('Product 1')
      expect(result[1].row.A).toBe('Product 2')
    })

    test('should filter out repeated header rows', () => {
      const packingListJson = [
        { A: 'Description', B: 'Commodity Code', C: 'Packages', D: 'Weight' },
        { A: 'Product 1', B: '12345', C: '10', D: '100' },
        { A: 'Description', B: 'Commodity Code', C: 'Packages', D: 'Weight' },
        { A: 'Product 2', B: '67890', C: '5', D: '50' }
      ]

      const result = filterValidatableRows(
        packingListJson,
        0,
        1,
        headerCols,
        config,
        'Sheet1'
      )

      expect(result).toHaveLength(2)
      expect(result[0].row.A).toBe('Product 1')
      expect(result[1].row.A).toBe('Product 2')
    })

    test('should include row metadata', () => {
      const packingListJson = [
        { A: 'Description', B: 'Commodity Code', C: 'Packages', D: 'Weight' },
        { A: 'Product 1', B: '12345', C: '10', D: '100' }
      ]

      const result = filterValidatableRows(
        packingListJson,
        0,
        1,
        headerCols,
        config,
        'TestSheet'
      )

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('row')
      expect(result[0]).toHaveProperty('originalIndex', 1)
      expect(result[0]).toHaveProperty('actualRowNumber', 2)
      expect(result[0]).toHaveProperty('sheetName', 'TestSheet')
    })
  })
})
