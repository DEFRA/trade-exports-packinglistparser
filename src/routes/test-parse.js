import { parsePackingList } from '../services/parser-service.js'
import { STATUS_CODES } from './statuscodes.js'
import { convertExcelToJson } from '../utilities/excel-utility.js'
import { convertCsvToJson } from '../utilities/csv-utility.js'
import { isCsv, isPdf } from '../utilities/file-extension.js'
import path from 'node:path'
import fs from 'node:fs'

const testRoute = {
  method: 'GET',
  path: '/test-parse',
  handler: processPackingListHandler
}

async function processPackingListHandler(request, h) {
  try {
    const plDirectory = path.join(process.cwd(), '/src/packing-lists/')
    const filePath = path.join(plDirectory, request.query.filename)

    let payload
    if (isCsv(request.query.filename)) {
      const csvBuffer = fs.readFileSync(filePath)
      payload = await convertCsvToJson(csvBuffer)
    } else if (isPdf(request.query.filename)) {
      payload = fs.readFileSync(filePath)
    } else {
      payload = convertExcelToJson({
        sourceFile: filePath
      })
    }

    const result = await parsePackingList(payload, filePath)
    return h.response({ success: true, result }).code(STATUS_CODES.OK)
  } catch (err) {
    return h
      .response({ success: false, error: err.message })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
}

export { testRoute }
