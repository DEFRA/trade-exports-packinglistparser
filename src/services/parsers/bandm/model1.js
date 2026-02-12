/**
 * B&M Excel parser - Model 1
 * @module parsers/bandm/model1
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import * as regex from '../../../utilities/regex.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'

const logger = createLogger()

/**
 * Parse the provided packing list JSON for B&M model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    const packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    const establishmentNumber = regex.findMatch(
      headers.BANDM1.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    const headerTitles = Object.values(headers.BANDM1.regex)
    const callback = function (x) {
      return regex.testAllPatterns(headerTitles, x)
    }

    for (const sheet of sheets) {
      establishmentNumbers = regex.findAllMatches(
        regex.remosRegex,
        packingListJson[sheet],
        establishmentNumbers
      )

      const headerRow = rowFinder(packingListJson[sheet], callback)
      const dataRow = headerRow + 1

      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.BANDM1,
        sheet
      )

      // Filter out totals/empty rows for BANDM1
      // Skip rows where description AND commodity_code are empty or just spaces
      if (headers.BANDM1.skipTotalsRows) {
        packingListContentsTemp = packingListContentsTemp.filter((item) => {
          const descEmpty = !item.description || item.description.trim() === ''
          const commodityEmpty =
            !item.commodity_code || String(item.commodity_code).trim() === ''
          
          // Skip if both description and commodity code are empty
          if (descEmpty && commodityEmpty) {
            return false
          }

          // Skip repeated header rows - check if description matches header text
          if (headers.BANDM1.skipRepeatedHeaders && item.description) {
            const descLower = item.description.toLowerCase().trim()
            const isHeaderRow =
              descLower.includes('item description') ||
              descLower.includes('product code') ||
              descLower.includes('commodity code') ||
              descLower === 'prism'
            if (isHeaderRow) {
              return false
            }
          }

          // Skip total rows - empty description but has numeric totals
          const hasTotalsKeyword = item.description && 
            headers.BANDM1.totalsRowKeywords.some(keyword => 
              item.description.toLowerCase().includes(keyword)
            )
          if (hasTotalsKeyword) {
            return false
          }

          return true
        })
      }

      packingListContents.push(...packingListContentsTemp)
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.BANDM1,
      establishmentNumbers,
      headers.BANDM1
    )
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in B&M Model 1 parser'
    )
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
