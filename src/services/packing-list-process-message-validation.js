import { config } from '../config.js'

const GUID_FORMAT_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

  if (!isString(establishmentId) || !GUID_FORMAT_REGEX.test(establishmentId)) {
    return `SupplyChainConsignment.DispatchLocation.IDCOMS.EstablishmentId must be a UUID string. Received: ${establishmentId}`
  }

  return null
}

function isPositiveIntegerString(value) {
  if (!isString(value)) {
    return false
  }

  return /^[1-9]\d*$/.test(value)
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

  if (!isPositiveIntegerString(payload.application_id)) {
    validationErrors.push('application_id must be a positive integer string')
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
