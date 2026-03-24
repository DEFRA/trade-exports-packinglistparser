/**
 * Parser mapping utilities
 *
 * Transforms raw packing list data (Excel, CSV, PDF) into standardized item structures.
 * Handles header detection, column mapping, blanket values, and coordinate-based PDF extraction.
 */
import * as regex from '../utilities/regex.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { formatError } from '../common/helpers/logging/error-logger.js'
import { filterValidatableRows } from './validators/row-filter-utilities.js'

const logger = createLogger()

/**
 * Find column keys matching header regex patterns.
 * @param {Object} header - Header configuration with regex patterns
 * @param {Object} packingListHeader - Header row from packing list
 * @returns {Object} Mapped column keys
 */
function findHeaderCols(header, packingListHeader) {
  const headerCols = {}

  // Process required columns
  const regexHeader = header.regex
  for (const value in regexHeader) {
    headerCols[value] = Object.keys(packingListHeader).find((key) => {
      return regexHeader[value].test(packingListHeader[key])
    })
  }

  // Process optional columns
  if (header.country_of_origin) {
    headerCols.country_of_origin = Object.keys(packingListHeader).find(
      (key) => {
        return header.country_of_origin.test(packingListHeader[key])
      }
    )
  }

  if (header.total_net_weight_unit) {
    headerCols.total_net_weight_unit = Object.keys(packingListHeader).find(
      (key) => {
        return header.total_net_weight_unit.test(packingListHeader[key])
      }
    )
  }

  if (header.type_of_treatment) {
    headerCols.type_of_treatment = Object.keys(packingListHeader).find(
      (key) => {
        return header.type_of_treatment.test(packingListHeader[key])
      }
    )
  }

  if (header.nirms) {
    headerCols.nirms = Object.keys(packingListHeader).find((key) => {
      return header.nirms.test(packingListHeader[key])
    })
  }

  if (header.commodity_code) {
    headerCols.commodity_code = Object.keys(packingListHeader).find((key) => {
      return header.commodity_code.test(packingListHeader[key])
    })
  }

  if (header.nature_of_products) {
    headerCols.nature_of_products = Object.keys(packingListHeader).find(
      (key) => {
        return header.nature_of_products.test(packingListHeader[key])
      }
    )
  }

  if (header.regex?.header_net_weight_unit) {
    headerCols.header_net_weight_unit = Object.keys(packingListHeader).find(
      (key) => {
        return header.regex.header_net_weight_unit.test(packingListHeader[key])
      }
    )
  }

  if (header.box_number) {
    headerCols.box_number = Object.keys(packingListHeader).find((key) => {
      return header.box_number.test(packingListHeader[key])
    })
  }

  return headerCols
}

/**
 * Extract blanket values (applies to all rows) from document.
 * @param {Object} header - Header configuration
 * @param {Array<Object>} packingListJson - Raw packing list data
 * @param {Object} headerCols - Mapped header columns
 * @param {number} headerRow - Header row index
 * @returns {Object} Blanket values (netWeightUnit, blanketNirms, blanketTreatmentType)
 */
function extractBlanketValues(header, packingListJson, headerCols, headerRow) {
  const netWeightUnit = header.findUnitInHeader
    ? (regex.findUnit(
        packingListJson[headerRow][headerCols.total_net_weight_kg]
      ) ??
      regex.findUnit(
        packingListJson[headerRow][headerCols.header_net_weight_unit]
      ))
    : null

  const blanketNirms = regex.test(header.blanketNirms?.regex, packingListJson)
    ? header.blanketNirms?.value
    : null

  let blanketTreatmentType = null
  if (
    header.blanketTreatmentType &&
    regex.test(header.blanketTreatmentType?.regex, packingListJson)
  ) {
    blanketTreatmentType = header.blanketTreatmentType.value
  }

  if (blanketTreatmentType === null && header.blanketTreatmentTypeValue) {
    blanketTreatmentType = getBlanketValueFromOffset(
      packingListJson,
      header.blanketTreatmentTypeValue
    )
  }

  return {
    netWeightUnit,
    blanketNirms,
    blanketTreatmentType
  }
}

/**
 * Extract blanket value from document using coordinate offsets.
 * @param {Array<Object>} packingListJson - Raw packing list data
 * @param {Object} blanketValue - Configuration with regex and offset
 * @returns {string|null} Extracted value or null
 */
function getBlanketValueFromOffset(packingListJson, blanketValue) {
  try {
    // find position of blanket header value
    const [headerRow, headerCol] = regex.positionFinder(
      packingListJson,
      blanketValue.regex
    )

    if (headerRow === null || headerCol === null) {
      throw new Error('Position not found.')
    }

    // add offsets
    const row = headerRow + blanketValue.valueCellOffset.row
    const col = String.fromCodePoint(
      headerCol.codePointAt(0) + blanketValue.valueCellOffset.col
    )

    // return the value
    return packingListJson[row][col] ?? null
  } catch (error) {
    logger.error(
      formatError(error),
      'getBlanketValueFromOffset() - Position not found'
    )
    return null
  }
}

/**
 * Get column value or null if empty.
 * @param {*} value - Column value
 * @returns {*} Value or null
 */
function columnValue(value) {
  return value != null && value !== '' ? value : null
}

/**
 * Check if row has any data in mapped columns.
 * @param {Object} col - Row data
 * @param {Object} headerCols - Mapped header columns
 * @returns {boolean} True if row has data
 */
function isNotEmpty(col, headerCols) {
  return Object.values(headerCols).some((key) => {
    const value = col[key]
    return value != null && value !== ''
  })
}

/**
 * Get type of treatment value (from column or blanket value).
 * @param {Object} col - Row data
 * @param {Object} headerCols - Mapped header columns
 * @param {Object} blanketValues - Blanket values
 * @param {boolean} hasData - Whether row has data
 * @returns {*} Treatment type value
 */
function getTypeOfTreatment(col, headerCols, blanketValues, hasData) {
  if (!hasData) {
    return null
  }
  return (
    columnValue(col[headerCols.type_of_treatment]) ||
    blanketValues.blanketTreatmentType ||
    null
  )
}

/**
 * Get net weight unit (from column, header, or blanket value).
 * @param {Object} col - Row data
 * @param {Object} headerCols - Mapped header columns
 * @param {Object} blanketValues - Blanket values
 * @param {boolean} hasData - Whether row has data
 * @returns {*} Net weight unit value
 */
function getNetWeightUnit(col, headerCols, blanketValues, hasData) {
  if (!hasData) {
    return null
  }
  return (
    columnValue(col[headerCols.total_net_weight_unit]) ||
    blanketValues.netWeightUnit ||
    null
  )
}

/**
 * Get NIRMS value (from column or blanket value).
 * @param {Object} col - Row data
 * @param {Object} headerCols - Mapped header columns
 * @param {Object} blanketValues - Blanket values
 * @param {boolean} hasData - Whether row has data
 * @returns {*} NIRMS value
 */
function getNirms(col, headerCols, blanketValues, hasData) {
  if (!hasData) {
    return null
  }
  return (
    columnValue(col[headerCols.nirms]) || blanketValues.blanketNirms || null
  )
}

/**
 * Map Excel/CSV data rows to standardized packing list items.
 * @param {Array<Object>} packingListJson - Raw packing list data
 * @param {number} headerRow - Row index containing headers
 * @param {number} dataRow - First row index containing data
 * @param {Object} header - Header configuration
 * @param {string|null} sheetName - Sheet name for row location
 * @returns {Array<Object>} Mapped packing list items
 */
export function mapParser(
  packingListJson,
  headerRow,
  dataRow,
  header,
  sheetName = null
) {
  // Find columns containing header names
  const headerCols = findHeaderCols(header, packingListJson[headerRow])

  // Extract blanket values
  const blanketValues = extractBlanketValues(
    header,
    packingListJson,
    headerCols,
    headerRow
  )

  // Filter rows if configuration is present
  let rowsToProcess
  if (header.skipTotalsRows || header.skipRepeatedHeaders) {
    rowsToProcess = filterValidatableRows(
      packingListJson,
      headerRow,
      dataRow,
      headerCols,
      header,
      sheetName
    )
  } else {
    // Fallback to original behavior
    rowsToProcess = packingListJson.slice(dataRow).map((row, index) => ({
      row,
      originalIndex: dataRow + index,
      actualRowNumber: dataRow + index + 1,
      sheetName
    }))
  }

  // Filter out rows with box numbers if configured
  if (header.skipBoxNumberRows && headerCols.box_number) {
    rowsToProcess = rowsToProcess.filter(({ row }) => {
      const boxNumberValue = row[headerCols.box_number]
      return !boxNumberValue || String(boxNumberValue).trim() === ''
    })
  }

  // Parse the packing list contents based on columns identified
  const packingListContents = rowsToProcess.map(
    ({ row: col, actualRowNumber }) => {
      const hasData = isNotEmpty(col, headerCols)

      return {
        description: columnValue(col[headerCols.description]),
        nature_of_products: columnValue(col[headerCols.nature_of_products]),
        type_of_treatment: getTypeOfTreatment(
          col,
          headerCols,
          blanketValues,
          hasData
        ),
        commodity_code: columnValue(col[headerCols.commodity_code]),
        number_of_packages: columnValue(col[headerCols.number_of_packages]),
        total_net_weight_kg: columnValue(col[headerCols.total_net_weight_kg]),
        total_net_weight_unit: getNetWeightUnit(
          col,
          headerCols,
          blanketValues,
          hasData
        ),
        country_of_origin: columnValue(col[headerCols.country_of_origin]),
        nirms: getNirms(col, headerCols, blanketValues, hasData),
        row_location: {
          rowNumber: actualRowNumber,
          sheetName
        }
      }
    }
  )

  return packingListContents
}
