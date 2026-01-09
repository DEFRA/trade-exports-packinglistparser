import { parsePackingList } from './parser-service.js'
import { getDispatchLocation } from './dynamics-service.js'
import { downloadBlobFromApplicationFormsContainerAsJson } from './ehco-blob-storage-service.js'
import { uploadJsonFileToS3 } from './s3-service.js'
import { sendMessageToQueue } from './trade-service-bus-service.js'
import {
  isNirms,
  isNotNirms
} from './validators/packing-list-validator-utilities.js'
import { v4 } from 'uuid'
import { createLogger } from '../common/helpers/logging/logger.js'
import { config } from '../config.js'

const { disableSend } = config.get('tradeServiceBus')

const logger = createLogger()

export async function processPackingList(payload) {
  // 1. Download packing list from blob storage
  const packingList = await downloadBlobFromApplicationFormsContainerAsJson(
    payload.packing_list_blob
  )

  // 2. Process packing list
  const parsedData = await getParsedPackingList(packingList, payload)

  // 3. Process results
  await processPackingListResults(parsedData, payload.application_id)

  return { result: 'success', data: `s3/${payload.application_id}` }
}

async function getParsedPackingList(packingList, payload) {
  const establishmentId =
    payload.SupplyChainConsignment.DispatchLocation.IDCOMS.EstablishmentId
  logger.info(
    `Fetching dispatch location for packing list parsing: ${establishmentId}`
  )
  const dispatchLocation = await getDispatchLocation(establishmentId)
  return parsePackingList(
    packingList,
    payload.packing_list_blob,
    dispatchLocation
  )
}

async function processPackingListResults(packingList, applicationId) {
  await persistPackingList(packingList, applicationId)
  await notifyExternalApplications(packingList, applicationId)
}

async function persistPackingList(parsedData, applicationId) {
  logger.info(
    `Persisting parsed packing list data for application ${applicationId}`
  )
  const processedData = mapPackingListForStorage(parsedData, applicationId)
  await uploadJsonFileToS3(
    { filename: applicationId },
    JSON.stringify(processedData)
  )
}

/**
 * Map parser JSON into the `packingList` storage shape.
 *
 * The function performs a best-effort mapping and logs any unexpected
 * structure problems. It returns `undefined` on error to allow callers
 * to detect mapping failures (the caller currently logs errors).
 *
 * @param {Object} packingListJson - Parser output JSON
 * @param {number|string} applicationId - Primary id to assign to the record
 * @returns {Object|undefined} - Mapped packing list object or undefined
 */
function mapPackingListForStorage(packingListJson, applicationId) {
  try {
    return {
      applicationId,
      registrationApprovalNumber: packingListJson.registration_approval_number,
      allRequiredFieldsPresent:
        packingListJson.business_checks.all_required_fields_present,
      parserModel: packingListJson.parserModel,
      reasonsForFailure: packingListJson.business_checks.failure_reasons,
      dispatchLocationNumber: packingListJson.dispatchLocationNumber,
      approvalStatus:
        packingListJson.business_checks.failure_reasons?.length > 0
          ? 'rejected'
          : 'approved',
      items: packingListJson.items.map((n) => itemsMapper(n, applicationId))
    }
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      `Error mapping packing list for storage for application ${applicationId}`
    )
    return undefined
  }
}

/**
 * Map a single parser item row into the `item` storage shape.
 *
 * Normalises special fields such as NIRMS using validator utilities.
 * The helper returns `null` for NIRMS when the input is neither a
 * recognised true nor false value so that callers can distinguish
 * between explicit false and unknown.
 *
 * @param {Object} o - Single item object from the parser JSON
 * @param {number|string} applicationId - Foreign key for the parent packing list
 * @returns {Object|undefined} - Mapped item object or undefined on error
 */
function itemsMapper(o, applicationId) {
  /**
   * Convert NIRMS string value to boolean using validation utilities.
   * @param {string} nirmsValue - NIRMS value to convert
   * @returns {boolean|null} True for NIRMS, false for not-NIRMS, null for invalid
   */
  const getNirmsBooleanValue = (nirmsValue) => {
    if (isNirms(nirmsValue)) {
      return true
    } else if (isNotNirms(nirmsValue)) {
      return false
    } else {
      return null
    } // For invalid or missing values
  }

  try {
    return {
      description: o.description,
      natureOfProducts: o.nature_of_products,
      typeOfTreatment: o.type_of_treatment,
      commodityCode: o.commodity_code,
      numberOfPackages: o.number_of_packages,
      totalWeight: o.total_net_weight_kg,
      totalWeightUnit: o.total_net_weight_unit,
      applicationId,
      countryOfOrigin: o.country_of_origin,
      nirms: getNirmsBooleanValue(o.nirms),
      row: o.row_location.rowNumber,
      location: o.row_location.sheetName ?? o.row_location.sheetName.pageNumber
    }
  } catch (err) {
    logger.error(
      { applicationId, item: o, err },
      'Error mapping packing list item'
    )
    return undefined
  }
}

/**
 * Notify external applications of parsed packing list result.
 * @param {*} parsedData -Data that was parsed for storage
 * @param {*} applicationId - Primary id to assign to the record
 */
async function notifyExternalApplications(parsedData, applicationId) {
  logger.info(
    `Notifying external applications of parsed packing list result for application ${applicationId}`
  )
  const message = createServiceBusMessage(
    applicationId,
    parsedData.business_checks.failure_reasons
  )
  if (disableSend) {
    logger.info(
      `Trade Service Bus sending is disabled. Skipping notification for application ${applicationId}`
    )
  } else {
    await sendMessageToQueue(message)
  }
}

/**
 * Build a message envelope for the parsed PLP result.
 * @param {Object|null} parsedResult - Truthy when parsing succeeded
 * @param {string} applicationId - Identifier of the application being updated
 * @param {Array|null} failureReasons - Array of error reasons when parsing failed
 * @returns {Object} Message envelope with body and metadata properties
 */
function createServiceBusMessage(applicationId, failureReasons) {
  return {
    body: {
      applicationId,
      approvalStatus: failureReasons?.length > 0 ? 'rejected' : 'approved',
      failureReasons
    },
    // Top-level metadata properties used by the messaging infra
    type: 'uk.gov.trade.plp',
    source: 'trade-exportscore-plp',
    messageId: v4(),
    correlationId: v4(),
    subject: 'plp.idcoms.parsed',
    contentType: 'application/json',
    applicationProperties: {
      EntityKey: applicationId,
      PublisherId: 'PLP',
      SchemaVersion: 1,
      Type: 'Internal',
      Status: 'Complete',
      TimestampUtc: Date.now()
    }
  }
}
