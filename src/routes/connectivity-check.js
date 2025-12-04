import { STATUS_CODES } from './statuscodes.js'
import { listS3Objects } from '../services/s3-service.js'
import {
  bearerTokenRequest,
  checkDynamicsDispatchLocationConnection
} from '../services/dynamics-service.js'
import { checkApplicationFormsContainerExists } from '../services/ehco-blob-storage-service.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

const connectivityCheck = {
  method: 'GET',
  path: '/connectivity-check',
  handler: connectivityCheckHandler
}

async function connectivityCheckHandler(_request, h) {
  const connectionChecks = {
    s3: await canS3Connect(),
    dynamicsLogin: await canDynamicsLoginConnect(),
    dynamicsData: await canWeReceiveDispatchLocationsFromDynamics(),
    ehcoBlobStorage: await canWeConnectToEhcoBlobStorage()
  }
  const allConnected = Object.values(connectionChecks).every((v) => v === true)

  if (!allConnected) {
    return h
      .response({
        Message: 'Connectivity Check Failed',
        Details: connectionChecks
      })
      .code(STATUS_CODES.SERVICE_UNAVAILABLE)
  }
  return h
    .response({
      Message: 'Connectivity Check Passed',
      Details: connectionChecks
    })
    .code(STATUS_CODES.OK)
}

async function canS3Connect() {
  return canConnect(listS3Objects, 'S3')
}

async function canDynamicsLoginConnect() {
  return canConnect(bearerTokenRequest, 'Dynamics Login')
}

async function canWeReceiveDispatchLocationsFromDynamics() {
  return canConnect(
    checkDynamicsDispatchLocationConnection,
    'Dynamics Dispatch Locations'
  )
}

async function canWeConnectToEhcoBlobStorage() {
  return canConnect(checkApplicationFormsContainerExists, 'EHCO Blob Storage')
}

async function canConnect(func, name) {
  try {
    await func()
    return true
  } catch (err) {
    logger.error({ err }, `${name} connection failure:`)
    return false
  }
}

export { connectivityCheck }
