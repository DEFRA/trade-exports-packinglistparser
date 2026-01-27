/**
 * Row finder helper
 *
 * Thin wrapper around Array.findIndex to keep calling code explicit and
 * readable when locating header or data rows in a sheet representation.
 */

/**
 * Find the index of the first row matching a callback predicate.
 * Used to locate header rows in packing list sheets.
 *
 * @param {Array} packingList - Array of row objects
 * @param {Function} callback - Predicate called for each row
 * @returns {number} Index of first matching row or -1 when not found
 */
function rowFinder(packingList, callback) {
  return packingList.findIndex((element) => callback(element))
}

export { rowFinder }
