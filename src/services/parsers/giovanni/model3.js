/**
 * Giovanni Model 3 PDF Parser
 *
 * Parses Giovanni PDF packing lists using coordinate-based extraction (non-AI).
 * Extracts data from specific X/Y positions on the page.
 */

import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import * as combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers-pdf.js'
import * as regex from '../../../utilities/regex.js'
import { mapPdfNonAiParser } from '../../parser-map-pdf.js'
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

    const nirmsHeaderExists = pdfJson.pages[0].content.some((item) =>
      headers.GIOVANNI3.nirms.regex.test(item.str)
    )

    const coHeaderExists = pdfJson.pages[0].content.some((item) =>
      headers.GIOVANNI3.country_of_origin.regex.test(item.str)
    )

    const blanketNirms = null

    for (const page of pdfJson.pages) {
      const ys = getYsForRows(page.content, model)
      packingListContentsTemp = mapPdfNonAiParser(
        page,
        model,
        ys,
        nirmsHeaderExists,
        coHeaderExists,
        blanketNirms
      )
      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    const establishmentNumbers = extractEstablishmentNumbers(pdfJson)

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.GIOVANNI3,
      establishmentNumbers,
      {
        ...headers.GIOVANNI3,
        blanketNirms: false
      }
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in parse()')
    return combineParser.combine(null, [], false, parserModel.NOMATCH)
  }
}

/**
 * Maximum Y difference (pixels) between two content items to treat them
 * as belonging to the same logical row. PDF renderers can place cells in
 * the same row at slightly different Y values.
 */
const ROW_Y_TOLERANCE = 5

/**
 * Extract Y-coordinates of data rows from page content.
 *
 * Groups content items into logical rows using a Y-tolerance so that cells
 * rendered at slightly different Y values (a common PDF quirk) are treated
 * as the same row. The representative Y for each group is the minimum Y seen
 * in that cluster, which is the value used by findItemContent to retrieve
 * column values (findItemContent also applies a ±1 tolerance on Y).
 *
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

    // Collect all distinct Y values below the header, sorted ascending
    const allYs = [
      ...new Set(
        pageContent
          .filter((item) => item.y >= firstY)
          .map((item) => Number(item.y.toFixed(2)))
      )
    ].sort((a, b) => a - b)

    // Cluster Y values that are within ROW_Y_TOLERANCE of each other into
    // a single logical row, represented by the smallest Y in the cluster.
    const rowYs = []
    for (const y of allYs) {
      const lastRowY = rowYs[rowYs.length - 1]
      if (lastRowY === undefined || y - lastRowY > ROW_Y_TOLERANCE) {
        rowYs.push(y)
      }
    }

    // For each logical row Y, count all items within ROW_Y_TOLERANCE to
    // determine whether this is a data row or a stopping row.
    const ysInRange = []
    const minItemsPerRow = 5
    for (const rowY of rowYs) {
      const rowItems = pageContent.filter(
        (item) =>
          Number(item.y.toFixed(2)) >= rowY &&
          Number(item.y.toFixed(2)) <= rowY + ROW_Y_TOLERANCE &&
          item.str.trim() !== ''
      )
      if (rowItems.length < minItemsPerRow || rowItems[0].str.trim() === '0') {
        break // Stop if row is sparse or is a totals/summary row
      }
      ysInRange.push(rowY)
    }

    return ysInRange
  } catch (err) {
    logger.error(formatError(err), 'Error in getYsForRows()')
    return []
  }
}
