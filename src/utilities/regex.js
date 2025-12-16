/**
 * Regex utilities
 *
 * Common regex patterns and helpers used across parsers.
 */

/**
 * REMOS regex pattern for RMS establishment numbers.
 * Format: RMS-GB-XXXXXX-XXX where X is a digit.
 */
const remosRegex = /^RMS-GB-\d{6}-\d{3}$/i

/**
 * Find first match of a regex pattern in data structure.
 * Recursively searches through arrays and objects.
 *
 * @param {RegExp} regex - Regex pattern to match
 * @param {*} data - Data to search (object, array, or primitive)
 * @returns {string|null} First matching value or null
 */
function findMatch(regex, data) {
  if (!data) {
    return null
  }

  if (typeof data === 'string') {
    return regex.test(data) ? data : null
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      const match = findMatch(regex, item)
      if (match) {
        return match
      }
    }
  } else if (typeof data === 'object') {
    for (const key in data) {
      const match = findMatch(regex, data[key])
      if (match) {
        return match
      }
    }
  }

  return null
}

/**
 * Find all matches of a regex pattern in data structure.
 * Recursively searches through arrays and objects.
 *
 * @param {RegExp} regex - Regex pattern to match
 * @param {*} data - Data to search (object, array, or primitive)
 * @param {Array} accumulator - Array to accumulate matches (optional)
 * @returns {Array} All matching values (unique)
 */
function findAllMatches(regex, data, accumulator = []) {
  if (!data) {
    return accumulator
  }

  if (typeof data === 'string') {
    if (regex.test(data) && !accumulator.includes(data)) {
      accumulator.push(data)
    }
  } else if (Array.isArray(data)) {
    for (const item of data) {
      findAllMatches(regex, item, accumulator)
    }
  } else if (typeof data === 'object') {
    for (const key in data) {
      findAllMatches(regex, data[key], accumulator)
    }
  }

  return accumulator
}

/**
 * Test if any value in data structure matches the regex.
 *
 * @param {RegExp} regex - Regex pattern to test
 * @param {*} data - Data to search
 * @returns {boolean} True if any match found
 */
function test(regex, data) {
  return findMatch(regex, data) !== null
}

/**
 * Test if all patterns match at least once in the data.
 * Used for header validation.
 *
 * @param {Array<RegExp>} patterns - Array of regex patterns
 * @param {*} data - Data to search
 * @returns {boolean} True if all patterns found
 */
function testAllPatterns(patterns, data) {
  return patterns.every((pattern) => test(pattern, data))
}

module.exports = {
  remosRegex,
  findMatch,
  findAllMatches,
  test,
  testAllPatterns
}
