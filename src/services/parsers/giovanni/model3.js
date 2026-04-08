/**
 * Giovanni Model 3 PDF Parser
 *
 * Parses Giovanni PDF packing lists using coordinate-based extraction (non-AI).
 * Uses dynamic header boundary discovery to handle layout variations across
 * different Giovanni PDF formats.
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
  expandBoundariesToMidpoints,
  deriveBoundaryFromRegex,
  discoverNetWeightUnit
} from '../../parser-map-pdf.js'
import {
  extractPdf,
  extractEstablishmentNumbers
} from '../../../utilities/pdf-helper.js'

const logger = createLogger()

/**
 * Threshold (in pixels) applied to each side of a header boundary.
 * Allows data slightly outside the header text region to be captured.
 */
const BOUNDARY_THRESHOLD = 15

/**
 * Core column headers required for data extraction.
 * Excludes type_of_treatment which lives in a separate Y region
 * and is applied via blanket values instead.
 */
const CORE_HEADERS = {
  description: headers.GIOVANNI3.headers.description,
  commodity_code: headers.GIOVANNI3.headers.commodity_code,
  number_of_packages: headers.GIOVANNI3.headers.number_of_packages,
  total_net_weight_kg: { regex: /Net Weight.*/i }
}

/**
 * Optional anchor columns whose positions establish midpoints that prevent
 * adjacent columns from bleeding into each other. These are added to the
 * boundary set before expansion, then removed before data extraction.
 */
const ANCHOR_HEADERS = {
  country_of_origin: { regex: headers.GIOVANNI3.country_of_origin.regex },
  gross_weight: { regex: /Gross Weight.*/i }
}

/**
 * Edge padding (in pixels) for the leftmost and rightmost discovered columns.
 * Ensures data that starts to the left of the header text (e.g. long
 * descriptions) or extends to the right is still captured.
 */
const EDGE_PADDING = 50

/**
 * Discover optional NIRMS and country-of-origin boundaries from page content.
 * @param {Array} pageContent - PDF page content
 * @returns {{ nirmsBoundary: Object|null, coBoundary: Object|null }}
 */
function discoverOptionalBoundaries(pageContent) {
  const nirmsItem = pageContent.find((item) =>
    headers.GIOVANNI3.nirms.regex.test(item.str)
  )
  const nirmsBoundary = nirmsItem
    ? deriveBoundaryFromRegex(
        nirmsItem,
        headers.GIOVANNI3.nirms.regex,
        BOUNDARY_THRESHOLD
      )
    : null

  const coItem = pageContent.find((item) =>
    headers.GIOVANNI3.country_of_origin.regex.test(item.str)
  )
  const coBoundary = coItem
    ? deriveBoundaryFromRegex(
        coItem,
        headers.GIOVANNI3.country_of_origin.regex,
        BOUNDARY_THRESHOLD
      )
    : null

  return { nirmsBoundary, coBoundary }
}

/**
 * Discover anchor header boundaries from page content and merge them into
 * the core boundaries. Anchors that are not found are silently skipped.
 * @param {Array} headerRowContent - Page content filtered to header Y range
 * @param {Object} coreBoundaries - Already-discovered core boundaries
 * @returns {Object} Merged boundaries including any found anchors
 */
function mergeAnchorBoundaries(headerRowContent, coreBoundaries) {
  const merged = { ...coreBoundaries }

  for (const [key, config] of Object.entries(ANCHOR_HEADERS)) {
    const item = headerRowContent.find((el) => config.regex.test(el.str))
    if (item) {
      const { x1, x2 } = deriveBoundaryFromRegex(item, config.regex)
      merged[key] = { x1, x2, regex: config.regex }
    }
  }

  return merged
}

/**
 * Parse Giovanni Model 3 PDF document using dynamic header discovery.
 * @param {Buffer} packingList - PDF file buffer
 * @returns {Promise<Object>} Combined parser result with items and metadata
 */
export async function parse(packingList) {
  try {
    const pdfJson = await extractPdf(packingList)
    const firstPage = pdfJson.pages[0]
    const model = 'GIOVANNI3'

    const establishmentNumber = regex.findMatch(
      headers.GIOVANNI3.establishmentNumber.regex,
      firstPage.content
    )

    const headerRowContent = firstPage.content.filter(
      (item) =>
        item.y >= headers.GIOVANNI3.minHeadersY &&
        item.y <= headers.GIOVANNI3.maxHeadersY
    )

    const coreBoundaries = discoverHeaderBoundaries(
      headerRowContent,
      CORE_HEADERS
    )

    if (!coreBoundaries) {
      logger.info(
        'Giovanni Model 3 — dynamic header discovery failed, no match'
      )
      return combineParser.combine(null, [], false, parserModel.NOMATCH)
    }

    const allBoundaries = mergeAnchorBoundaries(
      headerRowContent,
      coreBoundaries
    )

    const expandedBoundaries = expandBoundariesToMidpoints(
      allBoundaries,
      EDGE_PADDING
    )

    // Remove gross_weight — included only to establish midpoint divider.
    // Keep country_of_origin in expanded boundaries for properly bounded
    // extraction (the separate discoverOptionalBoundaries threshold is too
    // wide for CO and can bleed into adjacent columns).
    delete expandedBoundaries.gross_weight

    const { nirmsBoundary } = discoverOptionalBoundaries(firstPage.content)

    const netWeightUnit = discoverNetWeightUnit(firstPage.content, model)

    let packingListContents = []

    for (const page of pdfJson.pages) {
      const ys = getYsForRows(page.content, model)
      const pageContents = mapPdfDynamicHeaderParser(
        page,
        model,
        ys,
        expandedBoundaries,
        nirmsBoundary,
        null,
        netWeightUnit
      )
      packingListContents = packingListContents.concat(pageContents)
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
      const lastRowY = rowYs.at(-1)
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
