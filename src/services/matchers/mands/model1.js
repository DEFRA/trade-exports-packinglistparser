/**
 * M&S Model 1 PDF Matcher
 *
 * Matches M&S PDF packing lists using coordinate-based extraction.
 * Validates establishment number and header positions.
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import matcherResult from '../../matcher-result.js'
import headers from '../../model-headers-pdf.js'
import * as regex from '../../../utilities/regex.js'
import * as pdfHelper from '../../../utilities/pdf-helper.js'

const logger = createLogger()

/**
 * Check if packing list matches M&S Model 1 format.
 * @param {Buffer} packingList - PDF file buffer
 * @param {string} filename - Original filename
 * @returns {Promise<string>} Match result code
 */
export async function matches(packingList, filename) {
  try {
    const pdfJson = await pdfHelper.extractPdf(packingList)

    if (pdfJson.pages.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    // Headers only appear on the first page
    const firstPage = pdfJson.pages[0]

    // Check for correct establishment number
    if (
      !regex.test(headers.MANDS1.establishmentNumber.regex, firstPage.content)
    ) {
      return matcherResult.WRONG_ESTABLISHMENT_NUMBER
    }

    // Match header
    const result = findHeader(firstPage.content)

    if (result === matcherResult.CORRECT) {
      logger.info(`${filename} Packing list matches M&S Model 1`)
    }

    return result
  } catch (err) {
    logger.error(`Error in matches() for file ${filename}`, { err })
    return matcherResult.GENERIC_ERROR
  }
}

/**
 * Locate and validate headers for M&S Model 1 within page content.
 * Validates that each model header regex matches at least one extracted header text.
 * @param {Array} pageContent - Extracted page content
 * @returns {string} matcherResult - `CORRECT` if all headers match, otherwise `WRONG_HEADER`
 */
function findHeader(pageContent) {
  const y1 = headers.MANDS1.minHeadersY
  const y2 = headers.MANDS1.maxHeadersY
  const header = pageContent.filter(
    (item) => item.y >= y1 && item.y <= y2 && item.str.trim() !== ''
  )
  const mandsHeaders = headers.MANDS1.headers

  for (const headerField in mandsHeaders) {
    if (!Object.hasOwn(mandsHeaders, headerField)) {
      continue
    }
    // Check if any of the str fields in header match headerField regex
    const matchFound = header.some((item) =>
      mandsHeaders[headerField].regex.test(item.str)
    )

    if (!matchFound) {
      return matcherResult.WRONG_HEADER
    }
  }

  // All headers matched successfully
  return matcherResult.CORRECT
}
