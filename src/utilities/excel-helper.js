/**
 * Excel helper utilities
 *
 * Provides Excel file detection and conversion functions
 */

import { convertExcelToJson as convertExcelToJsonUtil } from './excel-utility.js'

/**
 * Check if filename is Excel format (.xls or .xlsx)
 * @param {string} filename - Filename to check
 * @returns {boolean} True if Excel file
 */
export function isExcel(filename) {
  const lower = filename.toLowerCase()
  return lower.endsWith('.xls') || lower.endsWith('.xlsx')
}

/**
 * Convert an Excel file to JSON
 * @param {Object} options - Options for conversion (can include source Buffer or sourceFile path)
 * @returns {Object} result - Map of sheet name -> array of row objects
 */
export function convertExcelToJson(options) {
  return convertExcelToJsonUtil(options)
}
