/**
 * CSV helper utilities
 *
 * Provides CSV file detection and conversion functions
 */

import { convertCsvToJson as convertCsvToJsonUtil } from './csv-utility.js'

/**
 * Check if filename is CSV format
 * @param {string} filename - Filename to check
 * @returns {boolean} True if CSV file
 */
export function isCsv(filename) {
  return filename.toLowerCase().endsWith('.csv')
}

/**
 * Convert CSV input to an array of records
 * @param {Buffer|string|Readable} bufferOrFilename - CSV source
 * @returns {Promise<Array>} rows - Array of row arrays
 */
export async function convertCsvToJson(bufferOrFilename) {
  return convertCsvToJsonUtil(bufferOrFilename)
}
