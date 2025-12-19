/**
 * PDF helper utilities for coordinate-based extraction
 *
 * Minimal utilities for extracting and processing PDF content using pdf.js-extract.
 * Supports coordinate-based parsing (non-AI) for Giovanni and other retailers.
 */

import headers from '../services/model-headers-pdf.js'
import { PDFExtract } from 'pdf.js-extract'
import { findAllMatches, remosRegex } from './regex.js'

const pdfExtract = new PDFExtract()

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
    console.error('src/utilities/pdf-helper.js getHeaders() error:', err)
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
