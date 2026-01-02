/**
 * CSV utility wrapper
 *
 * Provides a minimal helper to convert CSV content into an array of rows
 * using `csv-parse`. The function is intentionally permissive and accepts
 * a `Buffer`, a `Readable` stream, or a filename. Returned rows are the
 * raw arrays produced by `csv-parse` (no header mapping is applied here).
 */

import { parse } from 'csv-parse'
import fs from 'node:fs'
import { Readable } from 'node:stream'

/**
 * Convert CSV input to an array of records.
 *
 * - Accepts a Buffer, a Readable stream, or a filename/path string.
 * - Uses `skip_empty_lines: true` to ignore fully empty lines.
 * - `columns: false` returns rows as arrays (parsers expect this shape).
 * - `bom: true` strips a UTF-8 BOM if present.
 *
 * @param {Buffer|string|Readable} bufferOrFilename - CSV source
 * @returns {Promise<Array>} rows - Array of row arrays (each record is an array)
 */
export async function convertCsvToJson(bufferOrFilename) {
  // Accept a Buffer, a Readable stream, or a filename string
  const parser = createInputStream(bufferOrFilename).pipe(
    parse({
      columns: false,
      skip_empty_lines: true,
      trim: true,
      bom: true // strip BOM if present
    })
  )

  const results = []
  for await (const record of parser) {
    results.push(record)
  }

  return results
}

/**
 * Create a readable stream from the provided input.
 *
 * If a Buffer is provided, a stream is created from the single buffer value.
 * If an object with a `pipe` method is provided, it is assumed to already be
 * a stream and returned as-is. Otherwise the value is treated as a filename
 * and `fs.createReadStream` is used.
 */
function createInputStream(bufferOrFilename) {
  if (Buffer.isBuffer(bufferOrFilename)) {
    return Readable.from([bufferOrFilename])
  } else if (
    bufferOrFilename &&
    typeof bufferOrFilename === 'object' &&
    typeof bufferOrFilename.pipe === 'function'
  ) {
    // Already a stream
    return bufferOrFilename
  } else {
    // Assume a filename/path
    return fs.createReadStream(bufferOrFilename)
  }
}
