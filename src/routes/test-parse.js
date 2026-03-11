import { parsePackingList } from '../services/parser-service.js'
import { STATUS_CODES } from './statuscodes.js'
import { convertExcelToJson } from '../utilities/excel-utility.js'
import { convertCsvToJson } from '../utilities/csv-utility.js'
import { isCsv, isPdf } from '../utilities/file-extension.js'
import Joi from 'joi'
import path from 'node:path'
import fs from 'node:fs'
import { PDFExtract } from 'pdf.js-extract'
const pdfExtract = new PDFExtract()

const testRoute = {
  method: 'GET',
  path: '/test-parse',
  options: {
    validate: {
      query: Joi.object({
        filename: Joi.string().min(1).required(),
        returnPdfJson: Joi.string().valid('true', 'false').optional()
      })
    }
  },
  handler: processPackingListHandler
}

const INVALID_FILENAME_ERROR = 'Invalid filename'

// Caller is responsible for sanitising requestedFilename via path.basename()
// before invoking this function, so no path traversal guard is needed here.
function resolvePackingListFilePath(plDirectory, requestedFilename) {
  if (typeof requestedFilename !== 'string' || requestedFilename.length === 0) {
    return null
  }

  const resolvedFilePath = path.resolve(plDirectory, requestedFilename)

  try {
    return fs.statSync(resolvedFilePath).isFile() ? resolvedFilePath : null
  } catch {
    return null
  }
}

function isTrueQueryFlag(queryValue) {
  return queryValue === true || String(queryValue).toLowerCase() === 'true'
}

async function parsePackingListResult(requestedFilename, filePath) {
  let payload

  if (isCsv(requestedFilename)) {
    const csvBuffer = fs.readFileSync(filePath)
    payload = await convertCsvToJson(csvBuffer)
  } else if (isPdf(requestedFilename)) {
    payload = fs.readFileSync(filePath)
  } else {
    payload = convertExcelToJson({
      sourceFile: filePath
    })
  }

  return parsePackingList(payload, filePath)
}

async function extractPdfJsonResult(filePath) {
  let pdfResult = {}

  try {
    pdfResult = fs.readFileSync(filePath)
  } catch {
    throw new Error('Failed to extract PDF JSON')
  }

  return pdfExtract.extractBuffer(pdfResult)
}

async function processPackingListHandler(request, h) {
  try {
    const plDirectory = path.join(process.cwd(), '/src/packing-lists/')
    const rawFilename = request.query.filename
    const sanitizedFilename =
      typeof rawFilename === 'string' ? path.basename(rawFilename) : null
    const filePath = resolvePackingListFilePath(plDirectory, sanitizedFilename)

    if (!filePath) {
      return h
        .response({ success: false, error: INVALID_FILENAME_ERROR })
        .code(STATUS_CODES.BAD_REQUEST)
    }

    const returnPdfJson = isTrueQueryFlag(request.query.returnPdfJson)

    if (returnPdfJson && !isPdf(sanitizedFilename)) {
      return h
        .response({ success: false, error: INVALID_FILENAME_ERROR })
        .code(STATUS_CODES.BAD_REQUEST)
    }

    const result = returnPdfJson
      ? await extractPdfJsonResult(filePath)
      : await parsePackingListResult(sanitizedFilename, filePath)

    return h.response({ success: true, result }).code(STATUS_CODES.OK)
  } catch (err) {
    return h
      .response({ success: false, error: err.message })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
}

export { testRoute }
