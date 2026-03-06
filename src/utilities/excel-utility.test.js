import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { convertExcelToJson } from './excel-utility.js'
import * as XLSX from 'xlsx'

// Set up fs for xlsx in Node.js
XLSX.set_fs(fs)

describe('excel-utility', () => {
  const tmpDir = path.join(process.cwd(), 'test-output')
  const tmpFile = path.join(tmpDir, 'test-excel-utility.xlsx')

  beforeAll(() => {
    // Create test directory if it doesn't exist
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }

    // Create a test Excel file using xlsx
    const wsData = [
      ['Name', 'Age'],
      ['Alice', 30],
      ['Bob', 25],
      [],
      ['Charlie', 35]
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, tmpFile)
  })

  afterAll(() => {
    // Cleanup
    try {
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile)
      }
    } catch (e) {
      // ignore cleanup errors
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
    result.Sheet1.forEach((row, index) => {
      expect(row).not.toBeNull()
      expect(typeof row).toBe('object')
    })
  })
})
