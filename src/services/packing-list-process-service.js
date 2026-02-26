import { parsePackingList } from './parser-service.js'
import { getDispatchLocation } from './dynamics-service.js'
import { downloadBlobFromApplicationFormsContainerAsJson } from './blob-storage/ehco-blob-storage-service.js'
import { uploadJsonFileToS3 } from './s3-service.js'
import { sendMessageToQueue } from './trade-service-bus-service.js'
import { validateProcessPackingListPayload } from './packing-list-process-message-validation.js'
import {
  isNirms,
  isNotNirms
} from './validators/packing-list-validator-utilities.js'
import { determineApprovalStatus } from '../utilities/approval-status.js'
import { v4 } from 'uuid'
import { createLogger } from '../common/helpers/logging/logger.js'
import { formatError } from '../common/helpers/logging/error-logger.js'
import { measureAndLog } from '../common/helpers/logging/performance-logger.js'
import { config } from '../config.js'
import parserModel from './parser-model.js'

const { disableSend } = config.get('tradeServiceBus')

const logger = createLogger()

function createFailureResult(description, errorType = 'server') {
  return {
    result: 'failure',
    error: description,
    errorType
  }
}

export async function processPackingList(
  payload,
  { stopDataExit = false } = {}
) {
  try {
    const { result: successResult } = await measureAndLog(
      logger,
      async () => {
        // Log the payload contents before processing starts
        logger.info(
          `Processing packing list - received payload: ${JSON.stringify(payload, null, 2)}`
        )

        const validation = validateProcessPackingListPayload(payload)
        if (!validation.isValid) {
          logger.error(
            `Input validation failed for packing list payload: ${validation.description}`
          )
          return createFailureResult(
            `Validation failed: ${validation.description}`,
            'client'
          )
        }

        // 1. Download packing list from blob storage
        logger.info(
          `Downloading packing list from blob: ${payload.packing_list_blob}`
        )
        const { result: packingList } = await measureAndLog(
          logger,
          () =>
            downloadBlobFromApplicationFormsContainerAsJson(
              payload.packing_list_blob
            ),
          {
            message: 'Packing list downloaded successfully',
            action: 'blob_download',
            outcome: 'success'
          }
        )

        // 2. Process packing list
        logger.info('Starting packing list parsing')
        const { result: parsedData } = await measureAndLog(
          logger,
          () => getParsedPackingList(packingList, payload),
          {
            message: 'Packing list parsed successfully',
            action: 'parse_packing_list',
            outcome: 'success'
          }
        )

        // 3. Process results
        logger.info(
          `Processing results for application ${payload.application_id}`
        )
        const { result: persistedData } = await measureAndLog(
          logger,
          () =>
            processPackingListResults(parsedData, payload.application_id, {
              stopDataExit
            }),
          {
            message: 'Results processed successfully',
            action: 'process_results',
            outcome: 'success'
          }
        )

        return {
          result: 'success',
          data: {
            approvalStatus: persistedData.approvalStatus,
            reasonsForFailure: persistedData.reasonsForFailure,
            parserModel: persistedData.parserModel
          }
        }
      },
      {
        message: 'Packing list processing completed successfully',
        action: 'process_packing_list',
        outcome: 'success'
      }
    )

    logger.info(
      `Packing list processing completed successfully: ${JSON.stringify(successResult, null, 2)}`
    )
    return successResult
  } catch (err) {
    logger.error(
      `Error processing packing list: ${err.message}`,
      formatError(err)
    )
    return createFailureResult(err.message, 'server')
  }
}

async function getParsedPackingList(packingList, payload) {
  let establishmentId = null
  try {
    establishmentId =
      payload.SupplyChainConsignment.DispatchLocation.IDCOMS.EstablishmentId
    logger.info(
      `Fetching dispatch location for packing list parsing: ${establishmentId}`
    )
  } catch (err) {
    logger.error(
      formatError(err),
      'Failed to extract establishment ID from payload'
    )
    throw new Error(
      `Invalid payload structure: ${err.message}. Expected payload.SupplyChainConsignment.DispatchLocation.IDCOMS.EstablishmentId`
    )
  }

  const { result: dispatchLocation } = await measureAndLog(
    logger,
    () => getDispatchLocation(establishmentId),
    {
      message: 'Dispatch location fetched',
      action: 'get_dispatch_location',
      outcome: 'success'
    }
  )

  const { result } = await measureAndLog(
    logger,
    () =>
      parsePackingList(
        packingList,
        payload.packing_list_blob,
        dispatchLocation
      ),
    {
      message: 'Parser execution completed',
      action: 'parse_execution',
      outcome: 'success'
    }
  )

  return result
}

async function processPackingListResults(
  packingList,
  applicationId,
  { stopDataExit }
) {
  const persistedData = mapPackingListForStorage(packingList, applicationId)

  if (stopDataExit) {
    logger.info(
      `S3 storage is disabled. Skipping persisting data for application ${applicationId}`
    )
  } else {
    await persistPackingList(persistedData, applicationId)
  }

  if (disableSend || stopDataExit) {
    logger.info(
      `Trade Service Bus sending is disabled. Skipping notification for application ${applicationId}`
    )
  } else if (packingList.parserModel === parserModel.NOMATCH) {
    logger.info(
      `Parser returned NOMATCH. Skipping Service Bus notification for application ${applicationId}`
    )
  } else {
    await notifyExternalApplications(packingList, applicationId)
  }

  return persistedData
}

async function persistPackingList(parsedData, applicationId) {
  logger.info(
    `Persisting parsed packing list data for application ${applicationId}`
  )
  await measureAndLog(
    logger,
    () =>
      uploadJsonFileToS3(
        { filename: applicationId },
        JSON.stringify(parsedData)
      ),
    {
      message: `S3 upload completed for application ${applicationId}`,
      action: 's3_upload',
      outcome: 'success'
    }
  )
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
  await measureAndLog(logger, () => sendMessageToQueue(message), {
    message: `Service Bus message sent for application ${applicationId}`,
    action: 'service_bus_send',
    outcome: 'success'
  })
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
      approvalStatus: determineApprovalStatus(
        packingListJson.business_checks.all_required_fields_present,
        packingListJson.business_checks.failure_reasons
      ),
      items: packingListJson.items.map((n) => itemsMapper(n))
    }
  } catch (err) {
    logger.error(
      formatError(err),
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
 * @returns {Object|undefined} - Mapped item object or undefined on error
 */
function itemsMapper(o) {
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
      countryOfOrigin: o.country_of_origin,
      nirms: getNirmsBooleanValue(o.nirms),
      row: o.row_location.rowNumber,
      location: o.row_location.sheetName ?? o.row_location.pageNumber ?? null,
      failureReason: o.failure
    }
  } catch (err) {
    logger.error(formatError(err), 'Error mapping packing list item')
    return undefined
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
      approvalStatus: determineApprovalStatus(
        !failureReasons || failureReasons.length === 0,
        failureReasons
      ),
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
