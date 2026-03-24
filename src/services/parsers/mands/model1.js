/**
 * M&S PDF parser - Model 1
 * @module parsers/mands/model1
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import * as combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers-pdf.js'
import * as regex from '../../../utilities/regex.js'
import {
  mapPdfDynamicHeaderParser,
  discoverHeaderBoundaries,
  deriveBoundaryFromRegex,
  discoverNetWeightUnit
} from '../../parser-map-pdf.js'
import {
  extractPdf,
  extractEstablishmentNumbers,
  groupByYCoordinate
} from '../../../utilities/pdf-helper.js'

const logger = createLogger()

/**
 * Threshold (in pixels) applied to each side of a header boundary.
 * Allows data slightly outside the header text region to be captured.
 */
const BOUNDARY_THRESHOLD = 15

/**
 * Discover optional NIRMS and country of origin boundaries from page content.
 * @param {Array} pageContent - PDF page content
 * @returns {Object} Object with nirmsBoundary and coBoundary (may be null)
 */
function discoverOptionalBoundaries(pageContent) {
  const nirmsItem = pageContent.find((item) =>
    headers.MANDS1.nirms.regex.test(item.str)
  )
  const nirmsBoundary = nirmsItem
    ? deriveBoundaryFromRegex(
        nirmsItem,
        headers.MANDS1.nirms.regex,
        BOUNDARY_THRESHOLD
      )
    : null

  const coItem = pageContent.find((item) =>
    headers.MANDS1.country_of_origin.regex.test(item.str)
  )
  const coBoundary = coItem
    ? deriveBoundaryFromRegex(
        coItem,
        headers.MANDS1.country_of_origin.regex,
        BOUNDARY_THRESHOLD
      )
    : null

  return { nirmsBoundary, coBoundary }
}

/**
 * Calculate the Y coordinate below which data rows start.
 * Uses the lowest y of the commodity code header (may be split across two lines).
 * @param {Array} pageContent - PDF page content
 * @param {Object} headerBoundaries - Discovered header boundaries
 * @returns {number} Y coordinate for data row start
 */
function calculateHeaderY(pageContent, headerBoundaries) {
  const commodityItem = pageContent.find((item) =>
    headers.MANDS1.headers.commodity_code.regex.test(item.str)
  )

  if (!commodityItem) {
    return Math.max(...Object.values(headerBoundaries).map((b) => b.x1))
  }

  const cmX1 = commodityItem.x
  const cmX2 = commodityItem.x + (commodityItem.width ?? 0)
  const continuationItem = pageContent.find(
    (item) =>
      item.y > commodityItem.y &&
      item.y <= commodityItem.y + BOUNDARY_THRESHOLD &&
      item.x >= cmX1 &&
      item.x <= cmX2 &&
      item.str.trim() !== '' &&
      item !== commodityItem
  )

  return continuationItem ? continuationItem.y : commodityItem.y
}

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

    const headerBoundaries = discoverHeaderBoundaries(
      firstPage.content,
      headers.MANDS1.headers,
      BOUNDARY_THRESHOLD
    )

    if (!headerBoundaries) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    const { nirmsBoundary, coBoundary } = discoverOptionalBoundaries(
      firstPage.content
    )
    const headerY = calculateHeaderY(firstPage.content, headerBoundaries)
    const netWeightUnit = discoverNetWeightUnit(firstPage.content, 'MANDS1')

    const packingListContents = processPages(
      pdfJson.pages,
      headerBoundaries,
      nirmsBoundary,
      coBoundary,
      netWeightUnit,
      headerY
    )

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
    logger.error(formatError(err), 'Error in parse()')
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}

/**
 * Process all pages and extract packing list items.
 * @param {Array} pages - Array of PDF pages
 * @param {Object} headerBoundaries - Pre-computed column boundaries
 * @param {Object|null} nirmsBoundary - Pre-computed NIRMS boundary
 * @param {Object|null} coBoundary - Pre-computed country of origin boundary
 * @param {string|null} netWeightUnit - Pre-computed net weight unit
 * @param {number} headerY - Y coordinate below which data rows start on first page
 * @returns {Array} Combined packing list contents from all pages
 */
function processPages(
  pages,
  headerBoundaries,
  nirmsBoundary,
  coBoundary,
  netWeightUnit,
  headerY
) {
  let allContents = []

  for (const page of pages) {
    const groupedByY = groupByYCoordinate(page.content)
    page.content = groupedByY

    const ys = getYsForRows(page.content, headers.MANDS1, headerY)
    const pageContents = mapPdfDynamicHeaderParser(
      page,
      'MANDS1',
      ys,
      headerBoundaries,
      nirmsBoundary,
      coBoundary,
      netWeightUnit
    )

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
 * @param {number} headerY - Y coordinate of the lowest header (data starts below this)
 * @returns {Array<number>} Unique Y coordinates for rows
 */
export function getYsForRows(pageContent, model, headerY) {
  try {
    const pageNumberY = pageContent.find((item) =>
      model.pageNumber.test(item.str)
    )?.y
    const isFirstPage = pageContent.some((item) =>
      model.firstPage.test(item.str)
    )
    const firstY = isFirstPage ? headerY : pageNumberY
    const lastPageY = pageContent.find((item) => model.footer.test(item.str))?.y

    const lastY =
      lastPageY ?? Math.max(...pageContent.map((item) => item.y)) + 1
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
    logger.error(formatError(err), 'Error in getYsForRows()')
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
