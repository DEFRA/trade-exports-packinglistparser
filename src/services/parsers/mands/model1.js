/**
 * M&S PDF parser - Model 1
 * @module parsers/mands/model1
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import * as combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers-pdf.js'
import * as regex from '../../../utilities/regex.js'
import { mapPdfNonAiParser } from '../../parser-map.js'
import {
  extractPdf,
  extractEstablishmentNumbers,
  groupByYCoordinate
} from '../../../utilities/pdf-helper.js'

const logger = createLogger()

/**
 * Parse M&S Model 1 PDF document using coordinate-based extraction.
 * @param {Buffer} packingList - PDF file buffer
 * @returns {Promise<Object>} Combined parser result with items and metadata
 */
export async function parse(packingList) {
  try {
    const pdfJson = await extractPdf(packingList)

    if (pdfJson.pages.length === 0) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    const firstPage = pdfJson.pages[0]

    const establishmentNumber = regex.findMatch(
      headers.MANDS1.establishmentNumber.regex,
      firstPage.content
    )

    const establishmentNumbers = extractEstablishmentNumbers(
      pdfJson,
      headers.MANDS1.establishmentNumber.establishmentRegex
    )

    const header = extractHeader(
      firstPage.content,
      headers.MANDS1.minHeadersY,
      headers.MANDS1.maxHeadersY
    )
    const headersExist = checkHeadersExist(header, headers.MANDS1)

    const packingListContents = processPages(pdfJson.pages, headersExist)

    const filteredContents = packingListContents.filter(
      (row) => !isEmptyRow(row)
    )

    return combineParser.combine(
      establishmentNumber,
      filteredContents,
      true,
      parserModel.MANDS1,
      establishmentNumbers,
      headers.MANDS1
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
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}

/**
 * Process all pages and extract packing list items.
 * @param {Array} pages - Array of PDF pages
 * @param {Object} headersExist - Flags indicating which headers are present
 * @returns {Array} Combined packing list contents from all pages
 */
function processPages(pages, headersExist) {
  let allContents = []

  for (const page of pages) {
    const groupedByY = groupByYCoordinate(page.content)
    page.content = groupedByY

    const ys = getYsForRows(page.content, headers.MANDS1)
    const pageContents = mapPdfNonAiParser(
      page,
      'MANDS1',
      ys,
      headersExist.nirms,
      headersExist.countryOfOrigin
    )

    // Apply net weight unit to all items (header only on first page)
    pageContents.forEach((item) => {
      item.total_net_weight_unit = headersExist.totalNetWeightUnit
    })

    allContents = allContents.concat(pageContents)

    // Stop if footer found (prevents processing final page as valid table)
    const hasFooter = page.content.some((item) =>
      headers.MANDS1.footer.test(item.str)
    )
    if (hasFooter) {
      break
    }
  }

  return allContents
}

/**
 * Extract header items within Y-coordinate range.
 * @param {Array} pageContent - Page content array
 * @param {number} minY - Minimum Y coordinate
 * @param {number} maxY - Maximum Y coordinate
 * @returns {Array} Header items
 */
function extractHeader(pageContent, minY, maxY) {
  return pageContent.filter((item) => item.y >= minY && item.y <= maxY)
}

/**
 * Check which headers exist in the header row.
 * @param {Array} header - Header items
 * @param {Object} modelHeaders - Model header configuration
 * @returns {Object} Flags indicating which headers exist
 */
function checkHeadersExist(header, modelHeaders) {
  const totalNetWeightHeader = header.find((x) =>
    modelHeaders.headers.total_net_weight_kg.regex.test(x.str)
  )?.str

  return {
    nirms: header.some((item) => modelHeaders.nirms.regex.test(item.str)),
    countryOfOrigin: header.some((item) =>
      modelHeaders.country_of_origin.regex.test(item.str)
    ),
    totalNetWeightUnit: findNetWeightUnit(totalNetWeightHeader)
  }
}

/**
 * Find the net weight unit from the total net weight header.
 * @param {string} totalNetWeightHeader - Total net weight header string
 * @returns {string|null} Net weight unit or null if not found
 */
export function findNetWeightUnit(totalNetWeightHeader) {
  if (!totalNetWeightHeader) {
    return null
  }

  const lowerHeader = totalNetWeightHeader.toLowerCase()

  // Find positions of key strings
  const netWeightPos = lowerHeader.indexOf('net weight')
  if (netWeightPos === -1) {
    return null
  }

  const grossWeightPos = lowerHeader.indexOf('gross weight')

  // Use regex to find unit pattern
  const match = regex.kgRegex.exec(totalNetWeightHeader)

  if (match) {
    const unitPos = match.index

    // Unit must be after "net weight"
    const afterNetWeight = unitPos > netWeightPos + 'net weight'.length

    // If "gross weight" exists, unit must be before it
    const beforeGrossWeight = grossWeightPos === -1 || unitPos < grossWeightPos

    if (afterNetWeight && beforeGrossWeight) {
      // Return the matched unit with original casing
      return match[1]
    }
  }

  return null
}

/**
 * Determine the Y coordinates for rows between header and footer on a PDF page.
 * @param {Array} pageContent - Array of PDF text items with positions
 * @param {Object} model - Model header configuration
 * @returns {Array<number>} Unique Y coordinates for rows
 */
function getYsForRows(pageContent, model) {
  try {
    const pageNumberY = pageContent.find((item) =>
      model.pageNumber.test(item.str)
    )?.y
    const isFirstPage = pageContent.some((item) =>
      model.firstPage.test(item.str)
    )
    const firstY = isFirstPage ? model.maxHeadersY : pageNumberY
    const lastPageY = pageContent.find((item) => model.footer.test(item.str))?.y

    const lastY = lastPageY ?? Math.max(...pageContent.map((item) => item.y))
    const ys = [
      ...new Set(
        pageContent
          .filter(
            (item) =>
              item.y > firstY && item.y < lastY && item.str.trim() !== ''
          )
          .map((item) => item.y)
      )
    ].sort((a, b) => a - b)

    return ys
  } catch (err) {
    return []
  }
}

/**
 * Check if a row is empty (has no meaningful data).
 * @param {Object} row - Parsed row object
 * @returns {boolean} True if row is empty
 */
function isEmptyRow(row) {
  return (
    !row.description &&
    !row.commodity_code &&
    !row.number_of_packages &&
    !row.total_net_weight_kg
  )
}
