import { STATUS_CODES } from './statuscodes.js'
import { listS3Objects } from '../services/s3-service.js'

const connectivityCheck = {
  method: 'GET',
  path: '/connectivity-check',
  handler: connectivityCheckHandler
}

async function connectivityCheckHandler(_request, h) {
  try {
    await listS3Objects()
  } catch (err) {
    console.error('Connectivity Check Error:', err)
    return h
      .response({ Message: 'Connectivity Check Failed', Error: err.message })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
  return h
    .response({ Message: 'Connectivity Check Passed' })
    .code(STATUS_CODES.OK)
}

export { connectivityCheck }
