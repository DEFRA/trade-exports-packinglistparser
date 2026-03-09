import Joi from 'joi'
import { processPackingList } from '../services/packing-list-process-service.js'
import { STATUS_CODES } from './statuscodes.js'

const GUID_FORMAT_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const positiveIntegerId = Joi.alternatives(
  Joi.number().integer().positive(),
  Joi.string().pattern(/^[1-9]\d*$/)
)

const successResponseSchema = Joi.object({
  result: Joi.string().valid('success').required(),
  data: Joi.object().required()
})

const failureResponseSchema = Joi.object({
  result: Joi.string().valid('failure').required(),
  error: Joi.string().required(),
  errorType: Joi.string().valid('client', 'server').optional()
})

const packingListProcessPayloadSchema = Joi.object({
  application_id: positiveIntegerId.required(),
  packing_list_blob: Joi.string().uri().required(),
  SupplyChainConsignment: Joi.object({
    DispatchLocation: Joi.object({
      IDCOMS: Joi.object({
        EstablishmentId: Joi.string().pattern(GUID_FORMAT_REGEX).required()
      }).required()
    }).required()
  }).required()
}).required()

const packingListProcessQuerySchema = Joi.object({
  stopDataExit: Joi.string().valid('true', 'false').optional()
}).unknown(true)

const packingListProcessRoute = {
  method: 'POST',
  path: '/process-packing-list',
  options: {
    validate: {
      options: {
        convert: false
      },
      payload: packingListProcessPayloadSchema,
      query: packingListProcessQuerySchema
    },
    response: {
      schema: Joi.alternatives(successResponseSchema, failureResponseSchema)
    }
  },
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
