/* eslint-disable no-irregular-whitespace */
/**
 * No-REMOS matcher helpers
 *
 * Helpers to detect whether a document contains an RMS/REMOS number.
 * Used to classify files that do not contain an RMS as NOMATCH.
 */
import regex from '../../../utilities/regex.js'
import { extractPdf } from '../../../utilities/pdf-helper.js'
import logger from '../../../common/helpers/logging/logger.js'
//import headersPdf from '../../model-headers-pdf.js'

/**
 * Check for presence of a REMOS/RMS number in a sheet-based packing list.
 * @param {Object} sanitisedPackingList - Sheet-keyed representation of the packing list
 * @param {string} _filename - Filename for logging (optional)
 * @returns {boolean} true if a REMOS/RMS is present, otherwise false
 */
function noRemosMatch(sanitisedPackingList, _filename) {
  const remosRegex = /^RMS-GB-\d{6}-\d{3}$/i

  const sheets = Object.keys(sanitisedPackingList)
  for (const sheet of sheets) {
    const isRemosPresent = sanitisedPackingList[sheet].some((x) => {
      return Object.values(x).some((y) => {
        return remosRegex.test(y) || rmsExceptions(y)
      })
    })
    if (isRemosPresent) {
      return true
    }
  }
  return false
}

/**
 * Test for known RMS exceptions where a REMOS-like token is present but treated specially.
 * @param {string} y - Text to test
 * @returns {boolean}
 */
function rmsExceptions(y) {
  const giovanni2Regex = /\(NIRMS RMS-GB-\d{6}-\d{3}\)/i
  const cdsRegex = /\/ RMS-GB-000252-\d{3} \//i
  const sainsburysRegex = /^RMS-GB-000094-\d{3}​$/i
  const booker2 = /RMS-GB-000077-\d{3}/i

  return (
    giovanni2Regex.test(y) ||
    cdsRegex.test(y) ||
    sainsburysRegex.test(y) ||
    booker2.test(y)
  )
}

/**
 * CSV-specific exceptions for REMOS detection.
 * @param {string} y - Text to test
 * @returns {boolean}
 */
function rmsCsvExceptions(y) {
  const icelandRegex = /RMS-GB-000040-\d{3}$/i

  return icelandRegex.test(y)
}

/**
 * Check for presence of a REMOS/RMS number in CSV-style data.
 * @param {Array|Object} sanitisedPackingList - CSV row array or equivalent structure
 * @param {string} _filename - Filename for logging (optional)
 * @returns {boolean} true if a REMOS/RMS is present, otherwise false
 */
function noRemosMatchCsv(sanitisedPackingList, _filename) {
  const remosRegex = /^RMS-GB-\d{6}-\d{3}$/i
  const isRemosPresent = sanitisedPackingList.some((x) => {
    return Object.values(x).some((y) => {
      return remosRegex.test(y) || rmsCsvExceptions(y)
    })
  })
  return isRemosPresent
}

/**
 * Check for REMOS presence in a PDF by extracting text and scanning pages.
 * @param {Buffer} packingList - PDF buffer
 * @returns {Promise<boolean|Object>} truthy match or false
 */
async function noRemosMatchPdf(packingList) {
  try {
    const pdfJson = await extractPdf(packingList)

    for (const page of pdfJson.pages) {
      const result = regex.findMatch(regex.remosRegex, page.content) /*||
              regex.findMatch(
                headersPdf.ICELAND1.establishmentNumber.regex,
                page.content
              ) ||
              regex.findMatch(
                headersPdf.GREGGS1.establishmentNumber.regex,
                page.content
              ) ||
              regex.findMatch(
                headersPdf.MANDS1.establishmentNumber.regex,
                page.content
              ) */
      if (result) {
        return result
      }
    }
    return false
  } catch (err) {
    logger.error(
      { error: { message: err.message, stack_trace: err.stack } },
      'noRemosMatchPdf() error'
    )
    return false
  }
}

export { noRemosMatch, noRemosMatchCsv, noRemosMatchPdf }
