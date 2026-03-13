/**
 * Lightweight Excel -> JSON utility wrapper
 *
 * This module provides a small wrapper around the `@boterop/convert-excel-to-json`
 * library used across the project to turn Excel workbooks into a plain
 * JavaScript object. The wrapper ensures two behaviours needed by the
 * packing-list parsers:
 *
 * 1. `includeEmptyLines: true` is passed to the converter so that blank
 *    rows in sheets are represented in the output.
 * 2. Any null entries in the sheet arrays are normalised to empty objects
 *    (i.e. `{}`) to avoid callers having to check for `null` before
 *    accessing row properties.
 *
 * The output shape is the one produced by `convert-excel-to-json` — an
 * object whose keys are sheet names and values are arrays of row objects.
 */

import excelToJson from '@boterop/convert-excel-to-json'
import * as XLSX from 'xlsx'
import fs from 'node:fs'

const CELL_ADDR_RE = /^([A-Z]+)(\d+)$/

/**
 * Convert an Excel file to JSON with project-specific normalisation.
 *
 * @param {Object} options - Options forwarded to `@boterop/convert-excel-to-json`.
 *                           At minimum the caller should include `sourceFile`.
 * @returns {Object} result - Map of sheet name -> array of row objects. Empty
 *                            rows are kept and any `null` array entries are
 *                            replaced with an empty object to simplify downstream
 *                            parser logic.
 */
export function convertExcelToJson(options) {
  const result = excelToJson({
    // Keep blank rows so parser code can rely on row positions.
    ...options,
    includeEmptyLines: true
  })

  // Normalise `null` entries to `{}`. The converter sometimes inserts
  // null into arrays for empty lines — parsers expect objects and would
  // otherwise need to null-check every row access. Replacing with `{}` is
  // a small, safe transformation that preserves indices while simplifying
  // caller code.
  for (const sheet of Object.keys(result)) {
    for (let i = 0; i < result[sheet].length; i++) {
      if (result[sheet][i] == null) {
        result[sheet][i] = {}
      }
    }
  }

  return result
}

/**
 * Restore formatted display strings (.w) for numeric cells where
 * `@boterop/convert-excel-to-json` discarded them in favour of the raw
 * number (.v). This is needed for cells with custom number formats such as
 * a commodity code stored as 810902010 but displayed as '0810902010'.
 *
 * Uses fs.readFileSync + XLSX.read(buffer) rather than XLSX.readFile() to
 * avoid the ESM build of xlsx failing to access the filesystem.
 *
 * Call this explicitly after convertExcelToJson only where formatted display
 * values matter — it re-reads the source, so avoid calling it in hot
 * paths unless required.
 *
 * @param {Object} result - Sheet map produced by convertExcelToJson
 * @param {string|Buffer} source - Path to the original Excel file, or the raw file Buffer
 */
function patchCell(result, sheetName, cell, addr) {
  if ((cell.t !== 'n' && cell.t !== 'd') || cell.w == null) {
    return
  }
  const match = CELL_ADDR_RE.exec(addr)
  if (!match) {
    return
  }
  const col = match[1]
  const rowIdx = Number.parseInt(match[2], 10) - 1 // result rows are 0-based
  const row = result[sheetName]?.[rowIdx]
  if (row?.[col] != null && String(row[col]) !== cell.w.trim()) {
    row[col] = cell.w.trim()
  }
}

export function restoreFormattedValues(result, source) {
  const buffer = Buffer.isBuffer(source) ? source : fs.readFileSync(source)
  const workbook = XLSX.read(buffer, {
    sheetStubs: true,
    cellDates: true
  })

  for (const sheetName of Object.keys(result)) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) {
      continue
    }
    for (const addr of Object.keys(sheet)) {
      if (!addr.startsWith('!')) {
        patchCell(result, sheetName, sheet[addr], addr)
      }
    }
  }
}
