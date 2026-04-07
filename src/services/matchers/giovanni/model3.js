/**
 * Giovanni Model 3 PDF Matcher
 *
 * Matches Giovanni PDF packing lists using coordinate-based extraction.
 * Validates establishment number and header positions.
 */

import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import matcherResult from '../../matcher-result.js'
import headers from '../../model-headers-pdf.js'
import * as regex from '../../../utilities/regex.js'
import * as pdfHelper from '../../../utilities/pdf-helper.js'

const logger = createLogger()

/**
 * Check if packing list matches Giovanni Model 3 format.
 * @param {Buffer} packingList - PDF file buffer
 * @param {string} filename - Original filename
 * @returns {Promise<number>} Match result code
 */
export async function matches(packingList, filename) {
  try {
    const pdfJson = await pdfHelper.extractPdf(packingList)
    let result

    if (pdfJson.pages.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    const estNoConfig = headers.GIOVANNI3.establishmentNumber
    let foundEstablishmentPage = false

    // For each page, check if this is a header page by looking for the
    // establishment number at its known coordinate region. Data-only continuation
    // pages will have no content in that region and are skipped.
    for (const page of pdfJson.pages) {
      const itemsInRegion = page.content.filter(
        (item) =>
          item.x >= estNoConfig.x1 &&
          item.x <= estNoConfig.x2 &&
          item.y >= estNoConfig.y1 &&
          item.y <= estNoConfig.y2
      )

      if (itemsInRegion.length === 0) {
        // Continuation/data page — no establishment number region, skip
        continue
      }

      foundEstablishmentPage = true

      if (!regex.test(estNoConfig.regex, itemsInRegion)) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // match header
      result = matchHeaders(page.content)
      if (result === matcherResult.WRONG_HEADER) {
        return matcherResult.WRONG_HEADER
      }
    }

    if (!foundEstablishmentPage) {
      return matcherResult.WRONG_ESTABLISHMENT_NUMBER
    }

    if (result === matcherResult.CORRECT) {
      logger.info(`${filename} Packing list matches Giovanni Model 3`)
    }

    return result
  } catch (err) {
    logger.error(formatError(err), 'Error in matches() for Giovanni Model 3')
    return matcherResult.GENERIC_ERROR
  }
}

/**
 * Check page content for Giovanni Model 3 headers.
 * @param {Array} pageContent - Extracted page content
 * @returns {number} matcherResult - `CORRECT` or `WRONG_HEADER`
 */
function matchHeaders(pageContent) {
  const isHeader = findHeader('GIOVANNI3', pageContent)
  if (isHeader === matcherResult.CORRECT) {
    return matcherResult.CORRECT
  } else {
    return matcherResult.WRONG_HEADER
  }
}

/**
 * Check if header matches using Y-range coordinates on page content.
 * @param {Object} matchHeader - Header configuration with Y-range
 * @param {Array} pageContent - Extracted page content
 * @returns {boolean} True if header is found
 */
function matchHeaderWithYRange(matchHeader, pageContent) {
  return pageContent.some(
    (item) =>
      matchHeader.regex.test(item.str) &&
      item.x >= matchHeader.x1 &&
      item.x <= matchHeader.x2 &&
      item.y >= matchHeader.minHeadersY &&
      item.y <= matchHeader.maxHeadersY
  )
}

/**
 * Check if header matches using X-range coordinates in header object.
 * @param {Object} matchHeader - Header configuration
 * @param {Object} header - Extracted header object
 * @returns {boolean} True if header is found
 */
function matchHeaderWithXRange(matchHeader, header) {
  return Object.keys(header).some(
    (i) =>
      matchHeader.regex.test(header[i]) &&
      i >= matchHeader.x1 &&
      i <= matchHeader.x2
  )
}

/**
 * Locate a header for a specific model within page content.
 * @param {string} model - Header model key (e.g., 'GIOVANNI3')
 * @param {Array} pageContent - Extracted page content
 * @returns {number} matcherResult - `CORRECT` or `WRONG_HEADER`
 */
function findHeader(model, pageContent) {
  const header = pdfHelper.getHeaders(pageContent, model)
  const modelHeaders = headers[model].headers

  for (const key in modelHeaders) {
    if (!Object.hasOwn(modelHeaders, key)) {
      return matcherResult.WRONG_HEADER
    }

    const matchHeader = modelHeaders[key]
    const hasYRange = matchHeader.minHeadersY !== undefined

    const isMatch = hasYRange
      ? matchHeaderWithYRange(matchHeader, pageContent) // use this to match blanket headers
      : matchHeaderWithXRange(matchHeader, header) // use this to match normal column headers

    if (!isMatch) {
      return matcherResult.WRONG_HEADER
    }
  }

  return matcherResult.CORRECT
}
