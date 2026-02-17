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
vi.mock('./blob-storage/ehco-blob-storage-service.js', () => ({
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
    approvalStatus: 'approved',
    reasonsForFailure: [],
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
        nirms: 'NIRMS',
        failure: null,
        row_location: {
          rowNumber: 5,
          sheetName: 'Sheet1'
        }
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
        result: 'success',
        data: {
          approvalStatus: 'approved',
          reasonsForFailure: [],
          parserModel: 'TESTMODEL1'
        }
      })
    })

    it('should log the payload before processing starts', async () => {
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
        `Processing packing list - received payload: ${JSON.stringify(mockPayload, null, 2)}`
      )
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

    it('should log all processing steps in order', async () => {
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(mockParsedData)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      await processPackingList(mockPayload)

      const infoCalls = mockLogger.info.mock.calls.map((call) => call[0])

      expect(infoCalls).toContainEqual(
        expect.stringContaining('Processing packing list - received payload')
      )
      expect(infoCalls).toContainEqual(
        `Downloading packing list from blob: ${mockBlobUrl}`
      )
      expect(infoCalls).toContainEqual('Packing list downloaded successfully')
      expect(infoCalls).toContainEqual('Starting packing list parsing')
      expect(infoCalls).toContainEqual('Packing list parsed successfully')
      expect(infoCalls).toContainEqual(
        `Processing results for application ${mockApplicationId}`
      )
      expect(infoCalls).toContainEqual('Results processed successfully')
      expect(infoCalls).toContainEqual(
        expect.stringContaining(
          'Packing list processing completed successfully'
        )
      )
    })

    it('should log success result details', async () => {
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(mockParsedData)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      const result = await processPackingList(mockPayload)

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(
          'Packing list processing completed successfully'
        )
      )

      const lastInfoCall = mockLogger.info.mock.calls.at(-1)[0]
      expect(lastInfoCall).toContain(result.data.approvalStatus)
      expect(lastInfoCall).toContain(result.data.parserModel)
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
            nirms: 'NOT NIRMS',
            failure: null,
            row_location: {
              rowNumber: 5,
              sheetName: 'Sheet1'
            }
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
            nirms: 'INVALID',
            failure: null,
            row_location: {
              rowNumber: 5,
              sheetName: 'Sheet1'
            }
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

    it('should handle failures with failure reasons and rejected_other status', async () => {
      const parsedDataWithFailures = {
        ...mockParsedData,
        approvalStatus: 'rejected_other',
        reasonsForFailure: 'Missing commodity code\nInvalid weight',
        business_checks: {
          all_required_fields_present: false,
          failure_reasons: 'Missing commodity code\nInvalid weight'
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
      expect(messageCall.body.approvalStatus).toBe('rejected_other')
      expect(messageCall.body.failureReasons).toBe(
        'Missing commodity code\nInvalid weight'
      )
    })

    it('should handle failures with rejected_ineligible status when prohibited items detected', async () => {
      const parsedDataWithFailures = {
        ...mockParsedData,
        approvalStatus: 'rejected_ineligible',
        reasonsForFailure:
          'Prohibited item identified on the packing list for line 3',
        business_checks: {
          all_required_fields_present: false,
          failure_reasons:
            'Prohibited item identified on the packing list for line 3'
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
      expect(messageCall.body.approvalStatus).toBe('rejected_ineligible')
      expect(messageCall.body.failureReasons).toBe(
        'Prohibited item identified on the packing list for line 3'
      )
    })

    it('should handle failures with rejected_coo status when country of origin issues detected', async () => {
      const parsedDataWithFailures = {
        ...mockParsedData,
        approvalStatus: 'rejected_coo',
        reasonsForFailure: 'Invalid Country of Origin ISO Code for line 5',
        business_checks: {
          all_required_fields_present: false,
          failure_reasons: 'Invalid Country of Origin ISO Code for line 5'
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
      expect(messageCall.body.approvalStatus).toBe('rejected_coo')
      expect(messageCall.body.failureReasons).toBe(
        'Invalid Country of Origin ISO Code for line 5'
      )
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

      const result = await processPackingList(mockPayload)

      expect(result.result).toBe('failure')
      expect(result.error).toBeDefined()
      expect(mockLogger.error).toHaveBeenCalled()
      // The error is logged both in mapPackingListForStorage and in the catch block
      const errorCalls = mockLogger.error.mock.calls
      const hasExpectedError = errorCalls.some(
        (call) =>
          call[1] &&
          (call[1].includes('Error mapping packing list for storage') ||
            call[1].includes('Error processing packing list'))
      )
      expect(hasExpectedError).toBe(true)
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
        { filename: mockApplicationId },
        expect.stringContaining('"applicationId":"12345"')
      )

      // Verify the structure by parsing the JSON from second argument
      const uploadedData = JSON.parse(mockUploadJsonFileToS3.mock.calls[0][1])
      expect(uploadedData).toMatchObject({
        applicationId: mockApplicationId,
        registrationApprovalNumber: 'RMS-GB-123456-001',
        allRequiredFieldsPresent: true,
        parserModel: 'TESTMODEL1',
        reasonsForFailure: [],
        dispatchLocationNumber: mockDispatchLocation,
        approvalStatus: 'approved',
        items: [
          expect.objectContaining({
            description: 'Test Item',
            nirms: true,
            row: 5,
            location: 'Sheet1'
          })
        ]
      })
    })

    it('should handle items with pageNumber for location (PDF)', async () => {
      const parsedDataWithPage = {
        ...mockParsedData,
        items: [
          {
            ...mockParsedData.items[0],
            failure: null,
            row_location: {
              rowNumber: 3,
              pageNumber: 2
            }
          }
        ]
      }
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(parsedDataWithPage)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      await processPackingList(mockPayload)

      const uploadedData = JSON.parse(mockUploadJsonFileToS3.mock.calls[0][1])
      expect(uploadedData.items[0].location).toBe(2)
      expect(uploadedData.items[0].row).toBe(3)
    })

    it('should handle items with null location when neither sheetName nor pageNumber present', async () => {
      const parsedDataWithNullLocation = {
        ...mockParsedData,
        items: [
          {
            ...mockParsedData.items[0],
            failure: null,
            row_location: {
              rowNumber: 7
            }
          }
        ]
      }
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(parsedDataWithNullLocation)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      await processPackingList(mockPayload)

      const uploadedData = JSON.parse(mockUploadJsonFileToS3.mock.calls[0][1])
      expect(uploadedData.items[0].location).toBe(null)
      expect(uploadedData.items[0].row).toBe(7)
    })

    it('should handle items mapper error and log it', async () => {
      const parsedDataWithBadItem = {
        ...mockParsedData,
        items: [
          {
            description: 'Good Item',
            nature_of_products: 'Chilled',
            type_of_treatment: 'Processed',
            commodity_code: '12345678',
            number_of_packages: 10,
            total_net_weight_kg: 100.5,
            total_net_weight_unit: 'kg',
            country_of_origin: 'GB',
            nirms: 'NIRMS',
            failure: null,
            row_location: {
              rowNumber: 5,
              sheetName: 'Sheet1'
            }
          },
          {
            description: 'Bad Item',
            // Missing row_location will cause error
            nature_of_products: 'Chilled'
          }
        ]
      }
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(parsedDataWithBadItem)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      await processPackingList(mockPayload)

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: expect.any(String),
            stack_trace: expect.any(String),
            type: expect.any(String)
          })
        }),
        'Error mapping packing list item'
      )

      const uploadedData = JSON.parse(mockUploadJsonFileToS3.mock.calls[0][1])
      // Should have 2 items: 1 good item and 1 undefined (becomes null in JSON)
      expect(uploadedData.items.length).toBe(2)
      expect(uploadedData.items[0].description).toBe('Good Item')
      expect(uploadedData.items[1]).toBeNull()
    })

    it('should skip sending message when disableSend is true', async () => {
      // Need to reimport with different config
      const originalDisableSend = { disableSend: true }
      vi.doMock('../config.js', () => ({
        config: {
          get: vi.fn((key) => {
            if (key === 'tradeServiceBus') {
              return originalDisableSend
            }
            return {}
          })
        }
      }))

      // Re-import to get the new config
      vi.resetModules()
      const { processPackingList: processPackingListWithDisable } =
        await import('./packing-list-process-service.js')

      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(mockParsedData)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockClear()
      mockIsNirms.mockReturnValue(true)

      await processPackingListWithDisable(mockPayload)

      expect(mockSendMessageToQueue).not.toHaveBeenCalled()
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Trade Service Bus sending is disabled. Skipping notification for application ${mockApplicationId}`
      )
    })

    it('should skip persistence and notifications when stopDataExit is true', async () => {
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(mockParsedData)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      await processPackingList(mockPayload, { stopDataExit: true })

      expect(mockUploadJsonFileToS3).not.toHaveBeenCalled()
      expect(mockSendMessageToQueue).not.toHaveBeenCalled()
      expect(mockLogger.info).toHaveBeenCalledWith(
        `S3 storage is disabled. Skipping persisting data for application ${mockApplicationId}`
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Trade Service Bus sending is disabled. Skipping notification for application ${mockApplicationId}`
      )
    })

    it('should perform persistence and notifications when stopDataExit is false', async () => {
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(mockParsedData)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      await processPackingList(mockPayload, { stopDataExit: false })

      expect(mockUploadJsonFileToS3).toHaveBeenCalled()
      expect(mockSendMessageToQueue).toHaveBeenCalled()
    })

    it('should default stopDataExit to false when not provided', async () => {
      mockDownloadBlobFromApplicationFormsContainerAsJson.mockResolvedValue(
        mockPackingList
      )
      mockGetDispatchLocation.mockResolvedValue(mockDispatchLocation)
      mockParsePackingList.mockResolvedValue(mockParsedData)
      mockUploadJsonFileToS3.mockResolvedValue(undefined)
      mockSendMessageToQueue.mockResolvedValue(undefined)
      mockIsNirms.mockReturnValue(true)

      await processPackingList(mockPayload)

      expect(mockUploadJsonFileToS3).toHaveBeenCalled()
      expect(mockSendMessageToQueue).toHaveBeenCalled()
    })
  })
})
