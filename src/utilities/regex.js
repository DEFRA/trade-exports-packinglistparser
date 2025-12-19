/**
 * Regex helper utilities
 *
 * A collection of helpers that simplify searching over the common data
 * structures used in the project (arrays of row objects where each property
 * is a string). Functions are intentionally defensive about input shapes and
 * focus on returning small, usable results (booleans, first match, arrays).
 */

const remosRegex = /^RMS-GB-\d{6}-\d{3}$/i

/**
 * Create case-insensitive global regex pattern.
 * @param {RegExp|string} regex - Regex to convert
 * @returns {RegExp} Global case-insensitive regex
 */
function createSearchPattern(regex) {
  return new RegExp(regex, 'gi') // 'g' for global, 'i' for case-insensitive
}

/**
 * Check if object property is a string.
 * @param {Object} obj - Object to check
 * @param {string} key - Property key
 * @returns {boolean} True if property exists and is string
 */
function isValidStringProperty(obj, key) {
  return Object.hasOwn(obj, key) && typeof obj[key] === 'string'
}

/**
 * Get all string property keys from object.
 * @param {Object} obj - Object to extract from
 * @returns {Array<string>} Array of property keys that are strings
 */
function getStringProperties(obj) {
  return Object.keys(obj).filter((key) => isValidStringProperty(obj, key))
}

/**
 * Test if any string property in array matches regex.
 * @param {RegExp|string} regex - Pattern to test
 * @param {Array<Object>} array - Array of objects to search
 * @returns {boolean} True if any match found
 */
function test(regex, array) {
  const searchPattern = createSearchPattern(regex)

  for (const obj of array) {
    const stringProperties = getStringProperties(obj)

    for (const key of stringProperties) {
      if (searchPattern.test(obj[key])) {
        return true
      }
    }
  }

  return false
}

/**
 * Find and return first matched substring in array.
 * @param {RegExp|string} regex - Pattern to match
 * @param {Array<Object>} array - Array of objects to search
 * @returns {string|null} Matched substring or null
 */
function findMatch(regex, array) {
  const searchPattern = createSearchPattern(regex)

  for (const obj of array) {
    const stringProperties = getStringProperties(obj)

    for (const key of stringProperties) {
      const value = obj[key]
      const match = value.match(searchPattern) // Use match to extract the part of the string that matches
      if (match) {
        return match[0] // Return only the matching part of the string
      }
    }
  }

  return null
}

/**
 * Check if all regex patterns match any string property in object.
 * @param {Array<RegExp>} regexArray - Array of patterns to test
 * @param {Object} obj - Object to search
 * @returns {boolean} True if all patterns match
 */
function testAllPatterns(regexArray, obj) {
  const searchPatterns = regexArray.map((regex) => createSearchPattern(regex))
  const stringProperties = getStringProperties(obj)

  for (const pattern of searchPatterns) {
    let foundMatch = false
    for (const key of stringProperties) {
      const value = obj[key]
      if (pattern.test(value)) {
        foundMatch = true
        break // Stop searching if a match is found for this pattern
      }
    }
    if (!foundMatch) {
      return false // If any regex doesn't find a match, return false
    }
  }

  return true // All patterns have a match in the object
}

/**
 * Extract weight unit from header string.
 * @param {string} header - Header string to search
 * @returns {string|null} Matched unit or null
 */
function findUnit(header) {
  const unitRegex = /(KGS?|KILOGRAMS?|KILOS?)/i // regex of all possible units
  const match = unitRegex.exec(header)
  if (match) {
    return match[0] // return only the matching part of the string (the unit)
  }
  return null
}

/**
 * Add match to array if not already present.
 * @param {string} matchToAdd - Match to add
 * @param {Array<string>} matches - Existing matches
 * @returns {Array<string>} Updated matches array
 */
function addMatch(matchToAdd, matches) {
  if (!matches.includes(matchToAdd)) {
    matches.push(matchToAdd)
  }
  return matches
}

/**
 * Find all unique matches across array of objects.
 * @param {RegExp} searchPattern - Pattern to match
 * @param {Array<Object>} array - Array of objects to search
 * @param {Array<string>} matches - Existing matches array
 * @returns {Array<string>} Updated matches array
 */
function findAllMatches(searchPattern, array, matches) {
  for (const obj of array) {
    const stringProperties = getStringProperties(obj)

    for (const key of stringProperties) {
      const value = obj[key]
      const match = value.match(searchPattern)

      if (match) {
        matches = addMatch(match[1] ?? match[0], matches)
      }
    }
  }
  return matches
}

/**
 * Find the position (row and column) of the first match in JSON array.
 *
 * @param {Array<Object>} json - Array of objects to search
 * @param {RegExp} regex - Regex pattern to match
 * @returns {Array} [rowIndex, columnKey] or [null, null] if not found
 */
function positionFinder(json, regex) {
  let colIndex = null
  let rowIndex = null
  for (let row = 0; row < json.length; row++) {
    const match = findMatch(regex, [json[row]])
    if (match) {
      rowIndex = row
      colIndex = Object.keys(json[row]).find((key) => {
        return regex.test(json[row][key])
      })
      break
    }
  }
  return [rowIndex, colIndex]
}

export {
  remosRegex,
  test,
  findMatch,
  testAllPatterns,
  findUnit,
  findAllMatches,
  addMatch,
  positionFinder
}
