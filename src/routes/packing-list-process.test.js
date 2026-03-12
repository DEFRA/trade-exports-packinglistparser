import Hapi from '@hapi/hapi'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { STATUS_CODES } from './statuscodes.js'
import { packingListProcessRoute } from './packing-list-process.js'
import { processPackingList } from '../services/packing-list-process-service.js'

// Mock the service - must be before imports
vi.mock('../services/packing-list-process-service.js', () => ({
  processPackingList: vi.fn()
}))

let server

const validPayload = {
  application_id: '12345',
  packing_list_blob:
    'https://testaccount.blob.core.windows.net/container/file.xlsx',
  SupplyChainConsignment: {
    DispatchLocation: {
      IDCOMS: {
        EstablishmentId: '550e8400-e29b-41d4-a716-446655440000'
      }
    }
  }
}

async function injectProcessPackingList(payload, query = '') {
  const queryString = query ? `?${query}` : ''
  return server.inject({
    method: 'POST',
    url: `/process-packing-list${queryString}`,
    payload
  })
}

describe('Packing List Process Route', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    server = Hapi.server()
    server.route(packingListProcessRoute)
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  it('should have correct route configuration', () => {
    expect(packingListProcessRoute.method).toBe('POST')
    expect(packingListProcessRoute.path).toBe('/process-packing-list')
    expect(typeof packingListProcessRoute.handler).toBe('function')
  })

  describe('handler via server.inject', () => {
    it('returns success response when processing succeeds', async () => {
      const mockResult = {
        result: 'success',
        data: {
          parserModel: 'MODEL1',
          approvalStatus: 'approved',
          reasonsForFailure: []
        }
      }
      processPackingList.mockResolvedValue(mockResult)

      const response = await injectProcessPackingList(validPayload)

      expect(response.statusCode).toBe(STATUS_CODES.OK)
      expect(JSON.parse(response.payload)).toEqual(mockResult)
      expect(processPackingList).toHaveBeenCalledWith(validPayload, {
        stopDataExit: false
      })
    })

    it('returns 500 when processing fails with server error', async () => {
      const mockResult = {
        result: 'failure',
        error: 'Database connection failed'
      }
      processPackingList.mockResolvedValue(mockResult)

      const response = await injectProcessPackingList(validPayload)

      expect(response.statusCode).toBe(STATUS_CODES.INTERNAL_SERVER_ERROR)
      expect(JSON.parse(response.payload)).toEqual(mockResult)
    })

    it('returns 400 when processing fails with client error', async () => {
      const mockResult = {
        result: 'failure',
        error: 'Validation failed: application_id must be a number',
        errorType: 'client'
      }
      processPackingList.mockResolvedValue(mockResult)

      const response = await injectProcessPackingList(validPayload)

      expect(response.statusCode).toBe(STATUS_CODES.BAD_REQUEST)
      expect(JSON.parse(response.payload)).toEqual(mockResult)
    })

    it('passes stopDataExit=true when query parameter is set', async () => {
      processPackingList.mockResolvedValue({ result: 'success', data: {} })

      const response = await injectProcessPackingList(
        validPayload,
        'stopDataExit=true'
      )

      expect(response.statusCode).toBe(STATUS_CODES.OK)
      expect(processPackingList).toHaveBeenCalledWith(validPayload, {
        stopDataExit: true
      })
    })

    it('passes stopDataExit=false when query parameter is false', async () => {
      processPackingList.mockResolvedValue({ result: 'success', data: {} })

      const response = await injectProcessPackingList(
        validPayload,
        'stopDataExit=false'
      )

      expect(response.statusCode).toBe(STATUS_CODES.OK)
      expect(processPackingList).toHaveBeenCalledWith(validPayload, {
        stopDataExit: false
      })
    })

    it('returns 400 when payload fails route validation', async () => {
      const response = await injectProcessPackingList({})

      expect(response.statusCode).toBe(STATUS_CODES.BAD_REQUEST)
      expect(processPackingList).not.toHaveBeenCalled()
    })

    it('returns 400 when query validation fails', async () => {
      const response = await injectProcessPackingList(
        validPayload,
        'stopDataExit=invalid'
      )

      expect(response.statusCode).toBe(STATUS_CODES.BAD_REQUEST)
      expect(processPackingList).not.toHaveBeenCalled()
    })
  })
})
