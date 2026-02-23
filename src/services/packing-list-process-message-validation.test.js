import { describe, it, expect, vi, beforeEach } from 'vitest'

const TEST_BLOB_STORAGE_ACCOUNT = 'testaccount'
const TEST_BLOB_CONTAINER_NAME = 'container'
const PACKING_LIST_BLOB_VALIDATION_ERROR =
  'packing_list_blob must be a valid URL from ehcoBlob.blobStorageAccount and ehcoBlob.containerName'

const defaultConfigGet = (key) => {
  if (key === 'ehcoBlob') {
    return {
      blobStorageAccount: TEST_BLOB_STORAGE_ACCOUNT,
      containerName: TEST_BLOB_CONTAINER_NAME
    }
  }

  return {}
}

const configGetWithMissingBlobStorageAccount = (key) => {
  if (key === 'ehcoBlob') {
    return {
      blobStorageAccount: '',
      containerName: TEST_BLOB_CONTAINER_NAME
    }
  }

  return {}
}

const configGetWithMissingBlobContainer = (key) => {
  if (key === 'ehcoBlob') {
    return {
      blobStorageAccount: TEST_BLOB_STORAGE_ACCOUNT,
      containerName: ''
    }
  }

  return {}
}

const configGetWithUndefinedEhcoBlob = (key) => {
  if (key === 'ehcoBlob') {
    return undefined
  }

  return {}
}

const mockConfigGet = vi.fn(defaultConfigGet)

vi.mock('../config.js', () => ({
  config: {
    get: mockConfigGet
  }
}))

const { validateProcessPackingListPayload } = await import(
  './packing-list-process-message-validation.js'
)

describe('packing-list-process-message-validation', () => {
  const validPayload = {
    application_id: '12345',
    packing_list_blob:
      'https://testaccount.blob.core.windows.net/container/file.xlsx',
    SupplyChainConsignment: {
      DispatchLocation: {
        IDCOMS: {
          EstablishmentId: '30614e2b-b895-ee11-be37-000d3aba36b2'
        }
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockConfigGet.mockImplementation(defaultConfigGet)
  })

  it('returns valid for a correct payload', () => {
    const result = validateProcessPackingListPayload(validPayload)

    expect(result).toEqual({
      isValid: true,
      description: ''
    })
    expect(mockConfigGet).toHaveBeenCalledWith('ehcoBlob')
  })

  it('returns error when payload is not an object', () => {
    const result = validateProcessPackingListPayload(null)

    expect(result).toEqual({
      isValid: false,
      description: 'Payload must be an object'
    })
  })

  it('returns error when application_id is not a positive integer string', () => {
    const result = validateProcessPackingListPayload({
      ...validPayload,
      application_id: 12345
    })

    expect(result.isValid).toBe(false)
    expect(result.description).toContain(
      'application_id must be a positive integer string'
    )
  })

  it('returns error when application_id is a decimal number', () => {
    const result = validateProcessPackingListPayload({
      ...validPayload,
      application_id: 123.45
    })

    expect(result.isValid).toBe(false)
    expect(result.description).toContain(
      'application_id must be a positive integer string'
    )
  })

  it('returns error when application_id is not positive', () => {
    const result = validateProcessPackingListPayload({
      ...validPayload,
      application_id: '0'
    })

    expect(result.isValid).toBe(false)
    expect(result.description).toContain(
      'application_id must be a positive integer string'
    )
  })

  it('returns error when application_id contains decimal characters', () => {
    const result = validateProcessPackingListPayload({
      ...validPayload,
      application_id: '123.45'
    })

    expect(result.isValid).toBe(false)
    expect(result.description).toContain(
      'application_id must be a positive integer string'
    )
  })

  it('returns error when packing_list_blob is not a valid URL', () => {
    const result = validateProcessPackingListPayload({
      ...validPayload,
      packing_list_blob: 'not-a-url'
    })

    expect(result.isValid).toBe(false)
    expect(result.description).toContain(PACKING_LIST_BLOB_VALIDATION_ERROR)
  })

  it('returns error when packing_list_blob is an empty string', () => {
    const result = validateProcessPackingListPayload({
      ...validPayload,
      packing_list_blob: ''
    })

    expect(result.isValid).toBe(false)
    expect(result.description).toContain(PACKING_LIST_BLOB_VALIDATION_ERROR)
  })

  it('returns error when blob storage account config is missing', () => {
    mockConfigGet.mockImplementation(configGetWithMissingBlobStorageAccount)

    const result = validateProcessPackingListPayload(validPayload)

    expect(result.isValid).toBe(false)
    expect(result.description).toContain(PACKING_LIST_BLOB_VALIDATION_ERROR)
  })

  it('returns error when blob container config is missing', () => {
    mockConfigGet.mockImplementation(configGetWithMissingBlobContainer)

    const result = validateProcessPackingListPayload(validPayload)

    expect(result.isValid).toBe(false)
    expect(result.description).toContain(PACKING_LIST_BLOB_VALIDATION_ERROR)
  })

  it('returns error when ehcoBlob config is undefined', () => {
    mockConfigGet.mockImplementation(configGetWithUndefinedEhcoBlob)

    const result = validateProcessPackingListPayload(validPayload)

    expect(result.isValid).toBe(false)
    expect(result.description).toContain(PACKING_LIST_BLOB_VALIDATION_ERROR)
  })

  it('returns error when packing_list_blob host does not match configured account', () => {
    const result = validateProcessPackingListPayload({
      ...validPayload,
      packing_list_blob:
        'https://wrongaccount.blob.core.windows.net/container/file.xlsx'
    })

    expect(result.isValid).toBe(false)
    expect(result.description).toContain(PACKING_LIST_BLOB_VALIDATION_ERROR)
  })

  it('returns error when packing_list_blob container does not match configured container', () => {
    const result = validateProcessPackingListPayload({
      ...validPayload,
      packing_list_blob:
        'https://testaccount.blob.core.windows.net/other-container/file.xlsx'
    })

    expect(result.isValid).toBe(false)
    expect(result.description).toContain(PACKING_LIST_BLOB_VALIDATION_ERROR)
  })

  it('returns error when EstablishmentId is not a UUID', () => {
    const result = validateProcessPackingListPayload({
      ...validPayload,
      SupplyChainConsignment: {
        DispatchLocation: {
          IDCOMS: {
            EstablishmentId: 'not-a-uuid'
          }
        }
      }
    })

    expect(result.isValid).toBe(false)
    expect(result.description).toContain(
      'SupplyChainConsignment.DispatchLocation.IDCOMS.EstablishmentId must be a UUID string'
    )
  })

  it('returns error when EstablishmentId is not a string', () => {
    const result = validateProcessPackingListPayload({
      ...validPayload,
      SupplyChainConsignment: {
        DispatchLocation: {
          IDCOMS: {
            EstablishmentId: 123
          }
        }
      }
    })

    expect(result.isValid).toBe(false)
    expect(result.description).toContain(
      'SupplyChainConsignment.DispatchLocation.IDCOMS.EstablishmentId must be a UUID string'
    )
  })

  it('returns error when SupplyChainConsignment is missing', () => {
    const payloadWithoutSupplyChainConsignment = { ...validPayload }
    delete payloadWithoutSupplyChainConsignment.SupplyChainConsignment

    const result = validateProcessPackingListPayload(
      payloadWithoutSupplyChainConsignment
    )

    expect(result.isValid).toBe(false)
    expect(result.description).toContain(
      'SupplyChainConsignment must be provided as an object'
    )
  })
})
