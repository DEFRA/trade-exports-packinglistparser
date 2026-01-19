import { processPackingList } from '../services/packing-list-process-service.js'
import { STATUS_CODES } from './statuscodes.js'

const packingListProcessRoute = {
  method: 'POST',
  path: '/process-packing-list',
  handler: processPackingListHandler
}

async function processPackingListHandler(request, h) {
  try {
    const message = request.payload
    const stopDataExit = request.query.stopDataExit === 'true'
    const result = await processPackingList(message, { stopDataExit })
    return h.response(result).code(STATUS_CODES.OK)
  } catch (err) {
    return h
      .response({ result: 'failure', error: err.message })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
}

export { packingListProcessRoute }
