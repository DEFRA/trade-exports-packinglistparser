/**
 * Giovanni Model 3 PDF Parser
 *
 * Parses Giovanni PDF packing lists using coordinate-based extraction (non-AI).
 * Extracts data from specific X/Y positions on the page.
 */

import { createLogger } from '../../../common/helpers/logging/logger.js'
import * as combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers-pdf.js'
import * as regex from '../../../utilities/regex.js'
import { mapPdfNonAiParser } from '../../parser-map.js'
import {
  extractPdf,
  extractEstablishmentNumbers
} from '../../../utilities/pdf-helper.js'

const logger = createLogger()

/**
 * Parse Giovanni Model 3 PDF document using coordinate-based extraction.
 * @param {Buffer} packingList - PDF file buffer
 * @returns {Promise<Object>} Combined parser result with items and metadata
 */
export async function parse(packingList) {
  try {
    let packingListContents = []
    let packingListContentsTemp = []

    const pdfJson = await extractPdf(packingList)
    const establishmentNumber = regex.findMatch(
      headers.GIOVANNI3.establishmentNumber.regex,
      pdfJson.pages[0].content
    )

    const model = 'GIOVANNI3'

    for (const page of pdfJson.pages) {
      const ys = getYsForRows(page.content, model)
      packingListContentsTemp = mapPdfNonAiParser(page, model, ys)
      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    const establishmentNumbers = extractEstablishmentNumbers(pdfJson)

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.GIOVANNI3,
      establishmentNumbers,
      headers.GIOVANNI3
    )
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in parse()'
    )
    return combineParser.combine(null, [], false, parserModel.NOMATCH)
  }
}

/**
 * Extract Y-coordinates of data rows from page content.
 * @param {Array} pageContent - Page content array
 * @param {string} model - Parser model identifier
 * @returns {Array<number>} Array of Y-coordinates for data rows
 */
function getYsForRows(pageContent, model) {
  try {
    const headerY = headers[model].maxHeadersY

    // Find the first Y after the header
    const firstY = pageContent.find((item) => item.y > headerY)?.y
    if (!firstY) {
      return []
    }

    // Group items by Y value
    const rowsByY = {}
    for (const item of pageContent) {
      const y = Number(item.y.toFixed(2))
      if (!rowsByY[y]) {
        rowsByY[y] = []
      }
      rowsByY[y].push(item.str.trim())
    }

    // Sort Y values and collect rows until stopping condition
    const sortedYs = Object.keys(rowsByY)
      .map(Number)
      .sort((a, b) => a - b)

    const ysInRange = []
    const filteredYs = sortedYs.filter((y) => y >= firstY)
    const maxRows = 5
    for (const y of filteredYs) {
      const row = rowsByY[y]
      if (row.length < maxRows || row[0] === '0') {
        break // Stop if row is short or starts with '0'
      }
      ysInRange.push(y)
    }

    return ysInRange
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in getYsForRows()'
    )
    return []
  }
}
