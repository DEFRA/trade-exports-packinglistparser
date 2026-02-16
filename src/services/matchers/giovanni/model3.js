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

    // check for correct establishment number
    for (const page of pdfJson.pages) {
      if (
        !regex.test(headers.GIOVANNI3.establishmentNumber.regex, page.content)
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // match header
      result = matchHeaders(page.content)
      if (result === matcherResult.WRONG_HEADER) {
        return matcherResult.WRONG_HEADER
      }
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
 * Locate a header for a specific model within page content.
 * @param {string} model - Header model key (e.g., 'GIOVANNI3')
 * @param {Array} pageContent - Extracted page content
 * @returns {number} matcherResult - `CORRECT` or `WRONG_HEADER`
 */
function findHeader(model, pageContent) {
  const header = pdfHelper.getHeaders(pageContent, model)
  let isHeader = matcherResult.WRONG_HEADER
  for (const x in headers[model].headers) {
    if (!Object.hasOwn(headers[model].headers, x)) {
      return isHeader
    }
    const matchHeader = headers[model].headers[x]
    for (const i in header) {
      if (
        matchHeader.regex.test(header[i]) &&
        i >= matchHeader.x1 &&
        i <= matchHeader.x2
      ) {
        isHeader = matcherResult.CORRECT
        break
      } else {
        isHeader = matcherResult.WRONG_HEADER
      }
    }
    if (isHeader === matcherResult.WRONG_HEADER) {
      break
    }
  }
  return isHeader
}
