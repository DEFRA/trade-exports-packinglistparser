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
