/**
 * PDF helper utilities for coordinate-based extraction
 *
 * Minimal utilities for extracting and processing PDF content using pdf.js-extract.
 * Supports coordinate-based parsing (non-AI) for Giovanni and other retailers.
 */

import headers from '../services/model-headers-pdf.js'
import { PDFExtract } from 'pdf.js-extract'
import { findAllMatches, remosRegex } from './regex.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { formatError } from '../common/helpers/logging/error-logger.js'

const pdfExtract = new PDFExtract()
const logger = createLogger()

/**
 * Extract structured JSON from a PDF buffer and run sanitisation on it.
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<Object>} Sanitised PDF JSON structure
 */
export async function extractPdf(buffer) {
  const pdfJson = await pdfExtract.extractBuffer(buffer)
  const sanitisedJson = sanitise(pdfJson)
  return sanitisedJson
}

/**
 * Remove elements whose width is zero from page content.
 * @param {Array} pageContent - Array of PDF content elements
 * @returns {Array} Filtered page content
 */
function removeEmptyStringElements(pageContent) {
  for (let i = pageContent.length - 1; i >= 0; i--) {
    if (pageContent[i].width === 0) {
      pageContent.splice(i, 1)
    }
  }

  return pageContent
}

/**
 * Sanitise raw PDF JSON by removing empty elements and sorting content.
 * @param {Object} pdfJson - Raw PDF JSON from pdf.js-extract
 * @returns {Object} Sanitised PDF JSON
 */
function sanitise(pdfJson) {
  for (const page in pdfJson.pages) {
    if (Object.hasOwn(pdfJson.pages, page)) {
      // remove empty string elements
      pdfJson.pages[page].content = removeEmptyStringElements(
        pdfJson.pages[page].content
      )

      // order by y then x
      pdfJson.pages[page].content.sort((a, b) => {
        if (a.y === b.y) {
          return a.x - b.x
        }
        return a.y - b.y
      })
    }
  }

  return pdfJson
}

/**
 * Locate and group header text fragments by X coordinate.
 * @param {Array} pageContent - Page content array
 * @param {string} model - Parser model identifier
 * @returns {Object} Header text grouped by X coordinate
 */
export function getHeaders(pageContent, model) {
  try {
    const y1 = headers[model].minHeadersY
    const y2 = headers[model].maxHeadersY
    const header = pageContent.filter(
      (item) => item.y >= y1 && item.y <= y2 && item.str.trim() !== ''
    )

    const groupedByX = header.reduce((acc, obj) => {
      if (!acc[obj.x]) {
        acc[obj.x] = ''
      }
      acc[obj.x] += (acc[obj.x] ? ' ' : '') + obj.str
      return acc
    }, {})

    return groupedByX
  } catch (err) {
    logger.error(formatError(err), 'Error extracting headers from PDF')
    return []
  }
}

/**
 * Extract establishment numbers (RMS numbers) from PDF page content.
 * @param {Object} pdfJson - PDF JSON structure
 * @param {RegExp} remosRegexPattern - REMOS pattern (default: regex.remosRegex)
 * @returns {Array<string>} Array of unique establishment numbers
 */
export function extractEstablishmentNumbers(
  pdfJson,
  remosRegexPattern = remosRegex
) {
  let establishmentNumbers = []
  for (const page of pdfJson.pages) {
    establishmentNumbers = findAllMatches(
      remosRegexPattern,
      page.content,
      establishmentNumbers
    )
  }
  return establishmentNumbers
}

/**
 * Groups text objects by X coordinate and Y coordinate proximity.
 * Objects are grouped if they have the same X coordinate AND consecutive Y differences are within threshold.
 *
 * @param {Array} textObjects - Array of text objects with x, y, str properties
 * @param {number} yThreshold - Maximum Y difference between consecutive objects to consider for grouping (default: 10)
 * @returns {Array} Grouped text objects with concatenated strings
 */
export function groupByYCoordinate(textObjects, yThreshold = 10) {
  if (!textObjects || textObjects.length === 0) {
    return []
  }

  // Sort by X coordinate first, then by Y coordinate to ensure proper grouping
  const sortedObjects = textObjects.slice().sort((a, b) => {
    if (a.x !== b.x) {
      return a.x - b.x
    }
    return a.y - b.y
  })

  const grouped = []
  let currentGroup = [sortedObjects[0]]

  for (let i = 1; i < sortedObjects.length; i++) {
    const current = sortedObjects[i]
    const previous = sortedObjects[i - 1]

    // Check if current object should be grouped with previous
    // Group only if X coordinates are the same AND Y difference is within threshold
    if (
      current.x === previous.x &&
      Math.abs(current.y - previous.y) < yThreshold
    ) {
      currentGroup.push(current)
    } else {
      // Process current group and start new one
      grouped.push(processGroup(currentGroup))
      currentGroup = [current]
    }
  }

  // Process the last group
  if (currentGroup.length > 0) {
    grouped.push(processGroup(currentGroup))
  }

  return grouped
}

/**
 * Processes a group of text objects by concatenating their strings,
 * using properties from the first object in the group, and setting Y to the average.
 *
 * @param {Array} group - Array of text objects to process
 * @returns {Object} Single text object with concatenated string and average Y coordinate
 */
function processGroup(group) {
  if (group.length === 1) {
    return group[0]
  }

  // Use the first object as base and concatenate all strings
  const baseObject = { ...group[0] }
  const concatenatedStr = group.map((obj) => obj.str).join(' ')

  // Use the largest width from all objects in the group
  const maxWidth = Math.max(...group.map((obj) => obj.width))

  // Calculate average Y coordinate of all objects in the group
  const averageY = group.reduce((sum, obj) => sum + obj.y, 0) / group.length

  return {
    ...baseObject,
    str: concatenatedStr,
    width: maxWidth,
    y: averageY
  }
}
