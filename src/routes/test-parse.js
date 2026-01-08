import { parsePackingList } from '../services/parser-service.js'
import { STATUS_CODES } from './statuscodes.js'
import { convertExcelToJson } from '../utilities/excel-utility.js'
import path from 'node:path'

const testRoute = {
  method: 'GET',
  path: '/test-parse',
  handler: processPackingListHandler
}

async function processPackingListHandler(request, h) {
  try {
    const plDirectory = path.join(process.cwd(), '/src/packing-lists/')
    const filePath = path.join(plDirectory, request.query.filename)

    const payload = convertExcelToJson({
      sourceFile: filePath
    })
    const result = await parsePackingList(payload, filePath)
    return h.response({ success: true, result }).code(STATUS_CODES.OK)
  } catch (err) {
    return h
      .response({ success: false, error: err.message })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
}

export { testRoute }
