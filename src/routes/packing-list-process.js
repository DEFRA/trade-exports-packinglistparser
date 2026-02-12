import { processPackingList } from '../services/packing-list-process-service.js'
import { STATUS_CODES } from './statuscodes.js'

const packingListProcessRoute = {
  method: 'POST',
  path: '/process-packing-list',
  handler: processPackingListHandler
}

async function processPackingListHandler(request, h) {
  const message = request.payload
  const stopDataExit = request.query.stopDataExit === 'true'
  const result = await processPackingList(message, { stopDataExit })

  const statusCode =
    result.result === 'success'
      ? STATUS_CODES.OK
      : STATUS_CODES.INTERNAL_SERVER_ERROR
  return h.response(result).code(statusCode)
}

export { packingListProcessRoute }
