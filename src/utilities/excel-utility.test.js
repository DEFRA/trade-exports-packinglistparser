import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { convertExcelToJson, restoreFormattedValues } from './excel-utility.js'
import * as XLSX from 'xlsx'

describe('excel-utility', () => {
  const tmpDir = path.join(process.cwd(), 'test-output')
  const tmpFile = path.join(tmpDir, 'test-excel-utility.xlsx')
  const tmpFileFormatted = path.join(
    tmpDir,
    'test-excel-utility-formatted.xlsx'
  )

  beforeAll(async () => {
    // Create test directory if it doesn't exist
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }

    // Create a test Excel file using xlsx
    const workbook = XLSX.utils.book_new()
    const worksheetData = [
      ['Name', 'Age'],
      ['Alice', 30],
      ['Bob', 25],
      [],
      ['Charlie', 35]
    ]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    // Write file using buffer approach
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    fs.writeFileSync(tmpFile, buffer)

    // Create a second workbook with a custom-formatted numeric cell
    // (simulates a commodity code stored as a number but displayed with a leading zero)
    const wb2 = XLSX.utils.book_new()
    const ws2 = XLSX.utils.aoa_to_sheet([['Code'], [810902010]])
    // Apply a custom number format that adds a leading zero: '0000000000' (10 digits)
    // The header 'Code' is in A1, so the value cell is A2
    const codeCell = ws2['A2']
    codeCell.z = '0000000000'
    // xlsx does not automatically compute .w at write time with custom formats,
    // so set it manually to reflect what Excel would display in the cell
    codeCell.w = '0810902010'
    XLSX.utils.book_append_sheet(wb2, ws2, 'Sheet1')
    fs.writeFileSync(
      tmpFileFormatted,
      XLSX.write(wb2, { type: 'buffer', bookType: 'xlsx' })
    )
  })

  afterAll(() => {
    // Cleanup
    for (const f of [tmpFile, tmpFileFormatted]) {
      try {
        if (fs.existsSync(f)) fs.unlinkSync(f)
      } catch {
        // ignore cleanup errors
      }
    }
  })

  it('should convert Excel file to JSON', () => {
    const result = convertExcelToJson({ sourceFile: tmpFile })

    expect(result).toBeDefined()
    expect(result.Sheet1).toBeDefined()
    expect(Array.isArray(result.Sheet1)).toBe(true)
    expect(result.Sheet1.length).toBeGreaterThan(0)
  })

  it('should include empty lines', () => {
    const result = convertExcelToJson({ sourceFile: tmpFile })

    // Should have header + 3 data rows + 1 empty row + 1 data row = 5 rows minimum
    expect(result.Sheet1.length).toBeGreaterThanOrEqual(5)
  })

  it('should normalize null entries to empty objects', () => {
    const result = convertExcelToJson({ sourceFile: tmpFile })

    // Check that all entries are objects (not null)
    result.Sheet1.forEach((row) => {
      expect(row).not.toBeNull()
      expect(typeof row).toBe('object')
    })
  })

  it('should return the formatted display value for custom-formatted numeric cells when restoreFormattedValues is called with a file path', () => {
    const result = convertExcelToJson({ sourceFile: tmpFileFormatted })
    restoreFormattedValues(result, tmpFileFormatted)

    // The cell stores 810902010 as a number but the custom format displays it
    // as '0810902010' — the parser should receive the formatted string, not the
    // raw number, so that commodity codes with leading zeros are preserved.
    const codeCell = result.Sheet1?.[1]?.A
    expect(codeCell).toBe('0810902010')
  })

  it('should return the formatted display value when restoreFormattedValues is called with a Buffer', () => {
    const buffer = fs.readFileSync(tmpFileFormatted)
    const result = convertExcelToJson({ source: buffer })
    restoreFormattedValues(result, buffer)

    const codeCell = result.Sheet1?.[1]?.A
    expect(codeCell).toBe('0810902010')
  })

  it('should not change cell values where the formatted string already matches the raw value', () => {
    // A plain number like 30 has .w = '30' and .v = 30.
    // String(30) === '30', so the condition is false and the value should remain unchanged.
    const result = convertExcelToJson({ sourceFile: tmpFile })
    const originalValue = result.Sheet1[1].B // Age column for 'Alice' row = 30
    restoreFormattedValues(result, tmpFile)
    expect(result.Sheet1[1].B).toBe(originalValue)
  })

  it('should skip sheets present in the result but not in the workbook', () => {
    const result = convertExcelToJson({ sourceFile: tmpFile })
    result.NonExistentSheet = [{ A: 'orphaned' }]
    // Should not throw and the extra sheet entry should remain unmodified
    expect(() => restoreFormattedValues(result, tmpFile)).not.toThrow()
    expect(result.NonExistentSheet[0].A).toBe('orphaned')
  })
})
