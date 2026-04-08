/**
 * PDF parser mapping utilities
 *
 * Provides coordinate-based extraction functions for PDF packing lists.
 * Handles header boundary discovery, dynamic column mapping, and blanket value extraction.
 */
import * as regex from '../utilities/regex.js'
import headers from './model-headers-pdf.js'
import * as pdfHelper from '../utilities/pdf-helper.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { formatError } from '../common/helpers/logging/error-logger.js'

const logger = createLogger()

/**
 * Maximum Y-offset (in pixels) to search below a header for unit text.
 * Used when the unit appears on a separate line beneath the header
 * (e.g. "(Kg)" beneath "Tot Net Weight").
 */
const UNIT_SEARCH_Y_OFFSET = 15

/**
 * Find the net weight unit from a header string that may contain multiple weight columns.
 * Handles mega headers like "Tot Net Weight (Kg) Tot Gross Weight (Kg)" by ensuring
 * the matched unit appears after "net weight" and before "gross weight" (if present).
 * @param {string} headerStr - Header string to search
 * @returns {string|null} Net weight unit or null if not found
 */
export function findNetWeightUnit(headerStr) {
  if (!headerStr) {
    return null
  }

  const lowerHeader = headerStr.toLowerCase()

  const netWeightPos = lowerHeader.indexOf('net weight')
  if (netWeightPos === -1) {
    return null
  }

  const grossWeightPos = lowerHeader.indexOf('gross weight')

  const match = regex.kgRegex.exec(headerStr)

  if (match) {
    const unitPos = match.index

    // Unit must be after "net weight"
    const afterNetWeight = unitPos > netWeightPos + 'net weight'.length

    // If "gross weight" exists, unit must be before it
    const beforeGrossWeight = grossWeightPos === -1 || unitPos < grossWeightPos

    if (afterNetWeight && beforeGrossWeight) {
      return match[1]
    }
  }

  return null
}

/**
 * Discover the net weight unit for coordinate-based (non-AI) PDF parsing.
 * @param {Array<Object>} pageContent - PDF page content array
 * @param {string} model - Parser model identifier
 * @returns {string|null} Matched unit or null
 */
function findNonAiNetWeightUnit(pageContent, model) {
  if (!headers[model].findUnitInHeader) {
    return null
  }

  const pageHeader = pdfHelper.getHeaders(pageContent, model)
  const totalNetWeightHeader = Object.values(pageHeader).find((x) =>
    headers[model].headers.total_net_weight_kg.regex.test(x)
  )
  const unit = regex.findUnit(totalNetWeightHeader)

  // Reject units embedded within a longer word (e.g. "kGkilograms")
  if (
    unit &&
    headers[model].strictUnitMatch &&
    !regex.STRICT_KG_REGEX.test(totalNetWeightHeader)
  ) {
    return null
  }

  return unit
}

/**
 * Build a standardized packing list row from PDF coordinate data.
 * @param {Object} packingListJson - PDF page with content coordinates
 * @param {string} model - Parser model identifier
 * @param {number} y - Y-coordinate of the data row
 * @param {number} rowIndex - Zero-based row index
 * @param {string|null} netWeightUnit - Pre-resolved net weight unit
 * @param {boolean} nirmsHeaderExists - Whether NIRMS header exists on the page
 * @param {boolean} coHeaderExists - Whether Country of Origin header exists
 * @returns {Object} Standardized packing list row
 */
function buildNonAiRow(
  packingListJson,
  model,
  y,
  rowIndex,
  netWeightUnit,
  nirmsHeaderExists,
  coHeaderExists
) {
  const plRow = {
    description: null,
    nature_of_products: null,
    type_of_treatment: null,
    commodity_code: null,
    number_of_packages: null,
    total_net_weight_kg: null,
    total_net_weight_unit: netWeightUnit ?? null
  }

  for (const key of Object.keys(headers[model].headers)) {
    plRow[key] = findItemContent(
      packingListJson,
      headers[model].headers[key],
      y
    )
  }

  if (headers[model].nirms && nirmsHeaderExists) {
    plRow.nirms = findItemContent(packingListJson, headers[model].nirms, y)
  }

  if (headers[model].country_of_origin && coHeaderExists) {
    plRow.country_of_origin = findItemContent(
      packingListJson,
      headers[model].country_of_origin,
      y
    )
  }

  plRow.row_location = {
    rowNumber: rowIndex + 1,
    pageNumber: packingListJson.pageInfo.num
  }

  return plRow
}

/**
 * Map PDF coordinate-based (non-AI) data to standardized packing list items.
 * @param {Object} packingListJson - PDF page with content coordinates
 * @param {string} model - Parser model identifier
 * @param {Array<number>} ys - Y-coordinates of data rows
 * @param {boolean} nirmsHeaderExists - Flag indicating if NIRMS header exists
 * @param {boolean} coHeaderExists - Flag indicating if Country of Origin header exists
 * @returns {Array<Object>} Mapped packing list items
 */
export function mapPdfNonAiParser(
  packingListJson,
  model,
  ys,
  nirmsHeaderExists = false,
  coHeaderExists = false
) {
  const netWeightUnit = findNonAiNetWeightUnit(packingListJson.content, model)

  const packingListContents = ys.map((y, row) =>
    buildNonAiRow(
      packingListJson,
      model,
      y,
      row,
      netWeightUnit,
      nirmsHeaderExists,
      coHeaderExists
    )
  )

  applyBlanketValues(packingListJson, model, packingListContents)

  return packingListContents
}

/**
 * Discover column x-boundaries by matching header regexes against page content.
 * Finds each header item on the page and derives column boundaries from header positions.
 * @param {Array<Object>} pageContent - PDF page content array with {x, y, str, width, ...}
 * @param {Object} modelHeaders - Model header configuration with regex patterns
 * @param {number} [threshold=0] - Pixels to extend each boundary on both sides
 * @returns {Object|null} Map of field name to {x1, x2} boundaries, or null if any header is missing
 */
export function discoverHeaderBoundaries(
  pageContent,
  modelHeaders,
  threshold = 0
) {
  const found = []

  for (const [key, headerConfig] of Object.entries(modelHeaders)) {
    const item = pageContent.find((el) => headerConfig.regex.test(el.str))
    if (!item) {
      return null
    }
    found.push({ key, item, regex: headerConfig.regex })
  }

  const boundaries = {}

  for (const current of found) {
    const { x1, x2 } = deriveBoundaryFromRegex(
      current.item,
      current.regex,
      threshold
    )
    boundaries[current.key] = { x1, x2, regex: modelHeaders[current.key].regex }
  }

  return boundaries
}

/**
 * Map PDF data to standardized packing list items using dynamically discovered
 * column boundaries. Instead of relying on hardcoded x1/x2 values from model
 * headers, this function matches each header regex against the page content to
 * find the header positions, then derives column x-ranges from those positions.
 * @param {Object} packingListJson - PDF page with content coordinates
 * @param {string} model - Parser model identifier
 * @param {Array<number>} ys - Y-coordinates of data rows
 * @param {Object} headerBoundaries - Pre-computed column boundaries from discoverHeaderBoundaries
 * @param {Object|null} nirmsBoundary - Pre-computed NIRMS boundary or null
 * @param {Object|null} coBoundary - Pre-computed country of origin boundary or null
 * @param {string|null} netWeightUnit - Pre-computed net weight unit or null
 * @returns {Array<Object>} Mapped packing list items
 */
export function mapPdfDynamicHeaderParser(
  packingListJson,
  model,
  ys,
  headerBoundaries,
  nirmsBoundary = null,
  coBoundary = null,
  netWeightUnit = null
) {
  const packingListContents = []

  for (let row = 0; row < ys.length; row++) {
    const y = ys[row]
    const plRow = {
      description: null,
      nature_of_products: null,
      type_of_treatment: null,
      commodity_code: null,
      number_of_packages: null,
      total_net_weight_kg: null,
      nirms: null,
      country_of_origin: null,
      total_net_weight_unit: netWeightUnit ?? null
    }

    for (const key of Object.keys(headerBoundaries)) {
      plRow[key] = findItemContent(packingListJson, headerBoundaries[key], y)
    }

    if (nirmsBoundary) {
      plRow.nirms = findItemContent(packingListJson, nirmsBoundary, y)
    }

    if (coBoundary) {
      plRow.country_of_origin = findItemContent(packingListJson, coBoundary, y)
    }

    plRow.row_location = {
      rowNumber: row + 1,
      pageNumber: packingListJson.pageInfo.num
    }

    packingListContents.push(plRow)
  }

  applyBlanketValues(packingListJson, model, packingListContents)

  return packingListContents
}

/**
 * Discover the net weight unit from page content by finding the header item
 * matching the total_net_weight_kg regex. The unit may appear in the header text
 * itself (e.g. "Tot Net Weight kg") or on a separate line just below the header
 * (e.g. "(Kg)" beneath "Tot Net Weight").
 * Uses findNetWeightUnit to handle mega headers with multiple weight columns.
 * @param {Array<Object>} pageContent - PDF page content array with {x, y, str, width, ...}
 * @param {string} model - Parser model identifier
 * @returns {string|null} Net weight unit or null if not found
 */
export function discoverNetWeightUnit(pageContent, model) {
  if (!headers[model].findUnitInHeader) {
    return null
  }

  const netWeightHeaderItem = pageContent.find((item) =>
    headers[model].headers.total_net_weight_kg.regex.test(item.str)
  )

  if (!netWeightHeaderItem) {
    return null
  }

  // Unit may be in the header text itself (e.g. "Tot Net Weight kg")
  // Use findNetWeightUnit to handle mega headers with multiple weight columns
  const unit = findNetWeightUnit(netWeightHeaderItem.str)
  if (unit) {
    return unit
  }

  // Or on a separate line just below the header (e.g. "(Kg)" beneath "Tot Net Weight")
  const headerX1 = netWeightHeaderItem.x
  const headerX2 = netWeightHeaderItem.x + (netWeightHeaderItem.width ?? 0)
  const headerY = netWeightHeaderItem.y
  const unitItem = pageContent.find(
    (item) =>
      item.y > headerY &&
      item.y <= headerY + UNIT_SEARCH_Y_OFFSET &&
      item.x >= headerX1 &&
      item.x <= headerX2 &&
      regex.findUnit(item.str)
  )

  if (!unitItem) {
    return null
  }

  const foundUnit = regex.findUnit(unitItem.str)

  // Reject units embedded within a longer word (e.g. "kGkilograms")
  if (
    foundUnit &&
    headers[model].strictUnitMatch &&
    !regex.STRICT_KG_REGEX.test(unitItem.str)
  ) {
    return null
  }

  return foundUnit
}

/**
 * Derive x-boundary from a content item's position and width.
 * @param {Object} item - Item with {x, width}
 * @returns {Object} Boundary with {x1, x2}
 */
export function deriveBoundary(item) {
  const x1 = Math.round(item.x)
  const width = item.width ?? 0
  const x2 = Math.round(item.x + width)

  return { x1, x2 }
}

/**
 * Derive x-boundary from a content item using the regex match position within
 * the string. When a PDF text element contains multiple merged headers
 * (e.g. "Co. of Origin EU Commodity Code"), this function uses the character
 * position of the regex match to proportionally calculate the x-boundary for
 * just the matched portion.
 * @param {Object} item - PDF text item with {x, str, width}
 * @param {RegExp} matchRegex - Regex pattern to locate within the string
 * @param {number} [threshold=0] - Pixels to extend x1 boundary to the left
 * @returns {Object} Boundary with {x1, x2}
 */
export function deriveBoundaryFromRegex(item, matchRegex, threshold = 0) {
  const str = item.str ?? ''
  const width = item.width ?? 0

  if (str.length === 0 || width === 0) {
    const base = deriveBoundary(item)
    return {
      x1: Math.max(0, base.x1 - threshold),
      x2: base.x2
    }
  }

  const match = matchRegex.exec(str)
  if (!match) {
    const base = deriveBoundary(item)
    return {
      x1: Math.max(0, base.x1 - threshold),
      x2: base.x2
    }
  }

  // If the match covers the entire string, use simple boundary
  if (match.index === 0 && match[0].length === str.length) {
    const base = deriveBoundary(item)
    return {
      x1: Math.max(0, base.x1 - threshold),
      x2: base.x2
    }
  }

  // Calculate proportional x position based on match position within the string
  const charWidth = width / str.length
  const x1 = Math.round(item.x + match.index * charWidth)
  const x2 = Math.round(item.x + (match.index + match[0].length) * charWidth)

  return {
    x1: Math.max(0, x1 - threshold),
    x2
  }
}

/**
 * Expand column boundaries so each column fills the gap to its neighbours.
 * For adjacent columns sorted left-to-right, the dividing line is the midpoint
 * between the right edge of the left column and the left edge of the right
 * column. This prevents data items that sit slightly outside their header's
 * text region from being missed during extraction.
 * @param {Object} allBoundaries - Map of field name to boundary objects with at least {x1, x2}
 * @param {number} [edgePadding=10] - Extra padding for the leftmost x1 and rightmost x2
 * @returns {Object} Expanded boundaries with adjusted x1/x2 values (other properties preserved)
 */
export function expandBoundariesToMidpoints(allBoundaries, edgePadding = 10) {
  const entries = Object.entries(allBoundaries)
    .map(([key, boundary]) => ({ key, boundary }))
    .sort((a, b) => a.boundary.x1 - b.boundary.x1)

  if (entries.length === 0) {
    return {}
  }

  const expanded = {}

  for (let i = 0; i < entries.length; i++) {
    const { key, boundary } = entries[i]
    const prev = i > 0 ? entries[i - 1].boundary : null
    const next = i < entries.length - 1 ? entries[i + 1].boundary : null

    const x1 = prev
      ? Math.floor((prev.x2 + boundary.x1) / 2)
      : Math.max(0, boundary.x1 - edgePadding)

    const x2 = next
      ? Math.floor((boundary.x2 + next.x1) / 2) - 1
      : boundary.x2 + edgePadding

    expanded[key] = { ...boundary, x1, x2 }
  }

  return expanded
}

/**
 * Apply blanket values (treatment type and NIRMS) to packing list items.
 * @param {Object} packingListJson - PDF page with content coordinates
 * @param {string} model - Parser model identifier
 * @param {Array<Object>} packingListContents - Array of packing list items
 */
function applyBlanketValues(packingListJson, model, packingListContents) {
  // set all type of treatment values to blanket value if it exists
  if (headers[model].blanketTreatmentTypeValue) {
    const blanketTreatmentType = extractBlanketValuesPdf(
      packingListJson.content,
      headers[model].blanketTreatmentTypeValue
    )

    packingListContents.forEach((item) => {
      item.type_of_treatment = blanketTreatmentType
    })
  }

  // set nirms to blanket value if row nirms is null and blanket value exists
  if (headers[model].blanketNirmsValue) {
    const blanketNirmsValue = extractBlanketValuesPdf(
      packingListJson.content,
      headers[model].blanketNirmsValue
    )

    packingListContents.forEach((item) => {
      if (!item.nirms) {
        item.nirms = blanketNirmsValue
      }
    })
  }
}

/**
 * Extract a blanket value from PDF page content using the blanketValue
 * header config. Locates the header item by regex, then finds the value in the next
 * row below using an X boundary derived from the header's X position.
 * The value is determined by finding the next distinct Y coordinate below the header
 * that has content within the X boundary, and concatenating all content at that Y coordinate.
 *
 * @param {Array<Object>} pageContent - PDF page content array with {x, y, str, ...}
 * @param {Object} blanketValue - Config with `regex`
 * @returns {string|null} Extracted value or null
 */
export function extractBlanketValuesPdf(pageContent, blanketValue) {
  try {
    const headerItem = pageContent.find((item) =>
      blanketValue.regex.test(item.str)
    )

    if (!headerItem) {
      return null
    }

    const { y: headerY } = headerItem

    // Filter items within X boundary first, then find next distinct Y
    const itemsInXRange = pageContent.filter(
      (item) =>
        item.x >= blanketValue.x1 &&
        item.x <= blanketValue.x2 &&
        item.str.trim() !== ''
    )

    const distinctYs = [
      ...new Set(
        itemsInXRange
          .filter(
            (item) => item.y > headerY && item.y < blanketValue.maxHeadersY
          )
          .map((item) => item.y)
      )
    ].sort((a, b) => a - b)

    const nextY = distinctYs[0]

    if (nextY === undefined) {
      return null
    }

    const matches = itemsInXRange
      .filter((item) => Math.abs(item.y - nextY) <= 1)
      .sort((a, b) => a.x - b.x)

    if (matches.length === 0) {
      return null
    }

    return (
      matches
        .map((item) => item.str)
        .join('')
        .trim() || null
    )
  } catch (error) {
    logger.error(
      formatError(error),
      'extractBlanketValuesPdf() - Error extracting value'
    )
    return null
  }
}

/**
 * Find content items at specific Y-coordinate within X-range.
 * @param {Object} packingListJson - PDF content with coordinates
 * @param {Object} header - Header with x1, x2 range
 * @param {number} y - Y-coordinate to search
 * @returns {string|null} Concatenated content or null
 */
function findItemContent(packingListJson, header, y) {
  const result = packingListJson.content.filter(
    (item) =>
      Math.abs(item.y - y) <= 1 &&
      Math.round(item.x) >= header.x1 &&
      Math.round(item.x) <= header.x2 &&
      item.str.trim() !== '' &&
      !/^[""\u201C\u201D]$/.test(item.str.trim())
  )
  if (result.length > 0) {
    return result.map((obj) => obj.str).join('')
  } else {
    return null
  }
}
