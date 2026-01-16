import { STATUS_CODES } from './statuscodes.js'
import { listS3Objects } from '../services/s3-service.js'
import {
  bearerTokenRequest,
  checkDynamicsDispatchLocationConnection
} from '../services/dynamics-service.js'
import { checkApplicationFormsContainerExists } from '../services/ehco-blob-storage-service.js'
//import { getIneligibleItems } from '../services/mdm-service.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { checkTradeServiceBusConnection } from '../services/trade-service-bus-service.js'

const logger = createLogger()

const connectivityCheck = {
  method: 'GET',
  path: '/connectivity-check',
  handler: connectivityCheckHandler
}

/**
 * Handler for connectivity check endpoint
 * Tests connections to all external services (S3, Dynamics, EHCO Blob Storage)
 * @param {Object} _request - Hapi request object (unused)
 * @param {Object} h - Hapi response toolkit
 * @returns {Promise<Object>} Response with connectivity status and details
 */
async function connectivityCheckHandler(_request, h) {
  const connectionChecks = {
    s3: await canS3Connect(),
    dynamicsLogin: await canDynamicsLoginConnect(),
    dynamicsData: await canWeReceiveDispatchLocationsFromDynamics(),
    ehcoBlobStorage: await canWeConnectToEhcoBlobStorage(),
    //mdmIneligibleItems: await canWeConnectToMdmService(),
    tradeServiceBus: await canWeConnectToTradeServiceBus()
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

/*
 * Check if we can connect to Trade Service Bus
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
async function canWeConnectToTradeServiceBus() {
  return canConnect(checkTradeServiceBusConnection, 'Trade Service Bus')
}

/**
 * Check if S3 connection is working
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
async function canS3Connect() {
  return canConnect(listS3Objects, 'S3')
}

/**
 * Check if Dynamics login/authentication is working
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
async function canDynamicsLoginConnect() {
  return canConnect(bearerTokenRequest, 'Dynamics Login')
}

/**
 * Check if we can retrieve dispatch location data from Dynamics
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
async function canWeReceiveDispatchLocationsFromDynamics() {
  return canConnect(
    checkDynamicsDispatchLocationConnection,
    'Dynamics Dispatch Locations'
  )
}

/**
 * Check if we can connect to EHCO Blob Storage
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
async function canWeConnectToEhcoBlobStorage() {
  return canConnect(checkApplicationFormsContainerExists, 'EHCO Blob Storage')
}

/**
 * Check if we can connect to MDM service
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
/* async function canWeConnectToMdmService() {
  return canConnect(getIneligibleItems, 'MDM Service')
} */

/**
 * Generic function to test connectivity by executing a function
 * @param {Function} func - Function to execute for connectivity test
 * @param {string} name - Name of the service being tested (for logging)
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
async function canConnect(func, name) {
  try {
    await func()
    return true
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      `${name} connection failure:`
    )
    return false
  }
}

export { connectivityCheck }
