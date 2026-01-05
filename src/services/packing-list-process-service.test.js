import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock parsePackingList
const mockParsePackingList = vi.fn()
vi.mock('./parser-service.js', () => ({
  parsePackingList: mockParsePackingList
}))

// Mock getDispatchLocation
const mockGetDispatchLocation = vi.fn()
vi.mock('./dynamics-service.js', () => ({
  getDispatchLocation: mockGetDispatchLocation
}))

// Mock downloadBlobFromApplicationFormsContainerAsJson
const mockDownloadBlobFromApplicationFormsContainerAsJson = vi.fn()
vi.mock('./ehco-blob-storage-service.js', () => ({
  downloadBlobFromApplicationFormsContainerAsJson:
    mockDownloadBlobFromApplicationFormsContainerAsJson
}))

// Mock uploadJsonFileToS3
const mockUploadJsonFileToS3 = vi.fn()
vi.mock('./s3-service.js', () => ({
  uploadJsonFileToS3: mockUploadJsonFileToS3
}))

// Mock sendMessageToQueue
const mockSendMessageToQueue = vi.fn()
vi.mock('./trade-service-bus-service.js', () => ({
  sendMessageToQueue: mockSendMessageToQueue
}))

// Mock validator utilities
const mockIsNirms = vi.fn()
const mockIsNotNirms = vi.fn()
vi.mock('./validators/packing-list-validator-utilities.js', () => ({
  isNirms: mockIsNirms,
  isNotNirms: mockIsNotNirms
}))

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid')
}))

// Mock logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn()
}
vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => mockLogger)
}))

// Import after all mocks
const { processPackingList } = await import('./packing-list-process-service.js')

describe('packing-list-process-service', () => {
  const mockApplicationId = '12345'
  const mockEstablishmentId = 'EST-001'
  const mockBlobUrl = 'https://test.blob.core.windows.net/container/file.xlsx'

  const mockPayload = {
    application_id: mockApplicationId,
    packing_list_blob: mockBlobUrl,
    SupplyChainConsignment: {
      DispatchLocation: {
        IDCOMS: {
          EstablishmentId: mockEstablishmentId
        }
      }
    }
  }

  const mockPackingList = {
    Sheet1: [{ A: 'test data' }]
  }

  const mockDispatchLocation = 'GB-001'

  const mockParsedData = {
    registration_approval_number: 'RMS-GB-123456-001',
    parserModel: 'TESTMODEL1',
    dispatchLocationNumber: mockDispatchLocation,
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: []
    },
    items: [
      {
        description: 'Test Item',
        nature_of_products: 'Chilled',
        type_of_treatment: 'Processed',
        commodity_code: '12345678',
        number_of_packages: 10,
        total_net_weight_kg: 100.5,
        total_net_weight_unit: 'kg',
        country_of_origin: 'GB',
        nirms: 'NIRMS'
      }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockLogger.info.mockClear()
    mockLogger.error.mockClear()
    mockLogger.warn.mockClear()
    mockLogger.debug.mockClear()
    mockIsNirms.mockReturnValue(false)
    mockIsNotNirms.mockReturnValue(false)
  })

  describe('processPackingList', () => {
    it('should successfully process a packing list', async () => {
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(mockParsedData)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      const result = await processPackingList(mockPayload)

      expect(
        mockDownloadBlobFromApplicationFormsContainerAsJson
      ).toHaveBeenCalledWith(mockBlobUrl)
      expect(mockGetDispatchLocation).toHaveBeenCalledWith(mockEstablishmentId)
      expect(mockParsePackingList).toHaveBeenCalledWith(
        mockPackingList,
        mockBlobUrl,
        mockDispatchLocation
      )
      expect(mockUploadJsonFileToS3).toHaveBeenCalled()
      expect(mockSendMessageToQueue).toHaveBeenCalled()
      expect(result).toEqual({
        status: 'complete',
        data: `s3/${mockApplicationId}`
      })
    })

    it('should log fetching dispatch location', async () => {
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(mockParsedData)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      await processPackingList(mockPayload)

      expect(mockLogger.info).toHaveBeenCalledWith(
        `Fetching dispatch location for packing list parsing: ${mockEstablishmentId}`
      )
    })

    it('should log persisting packing list', async () => {
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(mockParsedData)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      await processPackingList(mockPayload)

      expect(mockLogger.info).toHaveBeenCalledWith(
        `Persisting parsed packing list data for application ${mockApplicationId}`
      )
    })

    it('should log notifying external applications', async () => {
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(mockParsedData)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      await processPackingList(mockPayload)

      expect(mockLogger.info).toHaveBeenCalledWith(
        `Notifying external applications of parsed packing list result for application ${mockApplicationId}`
      )
    })

    it('should correctly map NIRMS boolean values', async () => {
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(mockParsedData)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      await processPackingList(mockPayload)

      const uploadCall = JSON.parse(mockUploadJsonFileToS3.mock.calls[0][1])
      expect(uploadCall.items[0].nirms).toBe(true)
    })

    it('should correctly map NOT NIRMS boolean values', async () => {
      const parsedDataNotNirms = {
        ...mockParsedData,
        items: [
          {
            ...mockParsedData.items[0],
            nirms: 'NOT NIRMS'
          }
        ]
      }
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(parsedDataNotNirms)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNotNirms.mockReturnValue(true)

      await processPackingList(mockPayload)

      const uploadCall = JSON.parse(mockUploadJsonFileToS3.mock.calls[0][1])
      expect(uploadCall.items[0].nirms).toBe(false)
    })

    it('should map invalid NIRMS values to null', async () => {
      const parsedDataInvalidNirms = {
        ...mockParsedData,
        items: [
          {
            ...mockParsedData.items[0],
            nirms: 'INVALID'
          }
        ]
      }
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(parsedDataInvalidNirms)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(false)
      mockIsNotNirms.mockReturnValue(false)

      await processPackingList(mockPayload)

      const uploadCall = JSON.parse(mockUploadJsonFileToS3.mock.calls[0][1])
      expect(uploadCall.items[0].nirms).toBe(null)
    })

    it('should handle failures with failure reasons', async () => {
      const parsedDataWithFailures = {
        ...mockParsedData,
        business_checks: {
          all_required_fields_present: false,
          failure_reasons: ['Missing commodity code', 'Invalid weight']
        }
      }
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(parsedDataWithFailures)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      await processPackingList(mockPayload)

      const messageCall = mockSendMessageToQueue.mock.calls[0][0]
      expect(messageCall.body.approvalStatus).toBe('approved')
      expect(messageCall.body.failureReasons).toEqual([
        'Missing commodity code',
        'Invalid weight'
      ])
    })

    it('should create service bus message with correct structure', async () => {
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(mockParsedData)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      await processPackingList(mockPayload)

      const messageCall = mockSendMessageToQueue.mock.calls[0][0]
      expect(messageCall).toHaveProperty('body')
      expect(messageCall).toHaveProperty('type', 'uk.gov.trade.plp')
      expect(messageCall).toHaveProperty('source', 'trade-exportscore-plp')
      expect(messageCall).toHaveProperty('messageId', 'test-uuid')
      expect(messageCall).toHaveProperty('correlationId', 'test-uuid')
      expect(messageCall).toHaveProperty('subject', 'plp.idcoms.parsed')
      expect(messageCall).toHaveProperty('contentType', 'application/json')
      expect(messageCall).toHaveProperty('applicationProperties')
      expect(messageCall.applicationProperties).toHaveProperty(
        'EntityKey',
        mockApplicationId
      )
      expect(messageCall.applicationProperties).toHaveProperty(
        'PublisherId',
        'PLP'
      )
      expect(messageCall.applicationProperties).toHaveProperty(
        'SchemaVersion',
        1
      )
      expect(messageCall.applicationProperties).toHaveProperty(
        'Type',
        'Internal'
      )
      expect(messageCall.applicationProperties).toHaveProperty(
        'Status',
        'Complete'
      )
    })

    it('should log error when mapping fails', async () => {
      const invalidParsedData = {
        business_checks: {
          failure_reasons: []
        },
        // items is not an array, will cause map to fail
        items: null
      }
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(invalidParsedData)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)

      await processPackingList(mockPayload)

      expect(mockLogger.error).toHaveBeenCalled()
      const errorCall = mockLogger.error.mock.calls[0]
      expect(errorCall[1]).toContain('Error mapping packing list for storage')
    })

    it('should upload mapped data to S3', async () => {
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(mockParsedData)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      await processPackingList(mockPayload)

      expect(mockUploadJsonFileToS3).toHaveBeenCalledWith(
        mockApplicationId,
        expect.stringContaining('"applicationId":"12345"')
      )

      // Verify the structure by parsing the JSON from second argument
      const uploadedData = JSON.parse(mockUploadJsonFileToS3.mock.calls[0][1])
      expect(uploadedData).toMatchObject({
        packinglist: {
          applicationId: mockApplicationId,
          registrationApprovalNumber: 'RMS-GB-123456-001',
          allRequiredFieldsPresent: true,
          parserModel: 'TESTMODEL1',
          reasonsForFailure: [],
          dispatchLocationNumber: mockDispatchLocation
        },
        items: [
          expect.objectContaining({
            description: 'Test Item',
            applicationId: mockApplicationId,
            nirms: true
          })
        ]
      })
    })
  })
})
