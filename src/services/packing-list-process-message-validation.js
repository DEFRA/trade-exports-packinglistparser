import { config } from '../config.js'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isString(value) {
  return typeof value === 'string'
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object'
}

function isNonEmptyString(value) {
  return isString(value) && value.trim() !== ''
}

function isValidUrl(value) {
  if (!isNonEmptyString(value)) {
    return false
  }

  try {
    const parsedUrl = new URL(value)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

function isValidEhcoBlobUrl(value, blobStorageAccount, containerName) {
  if (!isNonEmptyString(blobStorageAccount)) {
    return false
  }

  if (!isNonEmptyString(containerName)) {
    return false
  }

  if (!isValidUrl(value)) {
    return false
  }

  const parsedUrl = new URL(value)
  const expectedHost =
    `${blobStorageAccount}.blob.core.windows.net`.toLowerCase()
  const firstPathSegment = parsedUrl.pathname.split('/').find(Boolean)

  return (
    parsedUrl.host.toLowerCase() === expectedHost &&
    firstPathSegment === containerName
  )
}

function validateEstablishmentId(payload) {
  if (!isObject(payload.SupplyChainConsignment)) {
    return 'SupplyChainConsignment must be provided as an object'
  }

  const establishmentId =
    payload.SupplyChainConsignment?.DispatchLocation?.IDCOMS?.EstablishmentId

  if (!isString(establishmentId) || !UUID_REGEX.test(establishmentId)) {
    return `SupplyChainConsignment.DispatchLocation.IDCOMS.EstablishmentId must be a UUID. Received: ${establishmentId}`
  }

  return null
}

export function validateProcessPackingListPayload(payload) {
  const validationErrors = []
  const { blobStorageAccount, containerName } = config.get('ehcoBlob') || {}

  if (!isObject(payload) || Array.isArray(payload)) {
    validationErrors.push('Payload must be an object')
    return {
      isValid: false,
      description: validationErrors.join('; ')
    }
  }

  if (
    !Number.isInteger(payload.application_id) ||
    payload.application_id <= 0
  ) {
    validationErrors.push('application_id must be a positive integer')
  }

  if (
    !isValidEhcoBlobUrl(
      payload.packing_list_blob,
      blobStorageAccount,
      containerName
    )
  ) {
    validationErrors.push(
      'packing_list_blob must be a valid URL from ehcoBlob.blobStorageAccount and ehcoBlob.containerName'
    )
  }

  const establishmentIdValidationError = validateEstablishmentId(payload)
  if (establishmentIdValidationError) {
    validationErrors.push(establishmentIdValidationError)
  }

  return {
    isValid: validationErrors.length === 0,
    description: validationErrors.join('; ')
  }
}
