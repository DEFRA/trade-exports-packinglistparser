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

  const statusCode = getStatusCodeFromResult(result)
  return h.response(result).code(statusCode)
}

function getStatusCodeFromResult(result) {
  if (result.result === 'success') {
    return STATUS_CODES.OK
  }

  if (result.errorType === 'client') {
    return STATUS_CODES.BAD_REQUEST
  }

  return STATUS_CODES.INTERNAL_SERVER_ERROR
}

export { packingListProcessRoute }
