import hapi from '@hapi/hapi'
import { vi } from 'vitest'

const mockInitializeCache = vi.fn().mockResolvedValue(undefined)
const mockStartSyncScheduler = vi.fn()
const mockStartTdsSyncScheduler = vi.fn()

vi.mock('../../services/cache/ineligible-items-cache.js', () => ({
  initializeIneligibleItemsCache: mockInitializeCache
}))

vi.mock('../../services/cache/sync-scheduler.js', () => ({
  startSyncScheduler: mockStartSyncScheduler
}))

vi.mock('../../services/tds-sync/sync-scheduler.js', () => ({
  startTdsSyncScheduler: mockStartTdsSyncScheduler
}))

describe('#startServer', () => {
  let createServerSpy
  let hapiServerSpy
  let startServerImport
  let createServerImport

  beforeAll(async () => {
    vi.stubEnv('PORT', '3098')

    createServerImport = await import('../../server.js')
    startServerImport = await import('./start-server.js')

    createServerSpy = vi.spyOn(createServerImport, 'createServer')
    hapiServerSpy = vi.spyOn(hapi, 'server')
  }, 60000) // Increase timeout to 60 seconds

  afterAll(() => {
    vi.unstubAllEnvs()
  })

  describe('When server starts', () => {
    let server

    afterEach(async () => {
      if (server) {
        await server.stop({ timeout: 0 })
        server = null
      }
    })

    test('Should start up server as expected', async () => {
      server = await startServerImport.startServer()

      expect(createServerSpy).toHaveBeenCalled()
      expect(hapiServerSpy).toHaveBeenCalled()
    })

    test('Should initialize ineligible items cache', async () => {
      mockInitializeCache.mockClear()
      server = await startServerImport.startServer()

      expect(mockInitializeCache).toHaveBeenCalled()
    })

    test('Should start MDM sync scheduler', async () => {
      mockStartSyncScheduler.mockClear()
      server = await startServerImport.startServer()

      expect(mockStartSyncScheduler).toHaveBeenCalled()
    })

    test('Should start TDS sync scheduler', async () => {
      mockStartTdsSyncScheduler.mockClear()
      server = await startServerImport.startServer()

      expect(mockStartTdsSyncScheduler).toHaveBeenCalled()
    })
  })

  describe('When cache initialization fails', () => {
    let server

    afterEach(async () => {
      if (server) {
        await server.stop({ timeout: 0 })
        server = null
      }
    })

    test('Should continue server startup when cache initialization fails', async () => {
      mockInitializeCache.mockRejectedValueOnce(
        new Error('Cache initialization failed')
      )

      server = await startServerImport.startServer()

      expect(server).toBeDefined()
      expect(createServerSpy).toHaveBeenCalled()
    })
  })

  describe('When server start fails', () => {
    test('Should log failed startup message', async () => {
      createServerSpy.mockRejectedValueOnce(new Error('Server failed to start'))

      await expect(startServerImport.startServer()).rejects.toThrow(
        'Server failed to start'
      )
    })
  })

  describe('When sync scheduler fails', () => {
    let server

    afterEach(async () => {
      if (server) {
        await server.stop({ timeout: 0 })
        server = null
      }
    })

    test('Should continue server startup when sync scheduler fails', async () => {
      mockStartSyncScheduler.mockImplementationOnce(() => {
        throw new Error('Scheduler failed to start')
      })

      server = await startServerImport.startServer()

      expect(server).toBeDefined()
      expect(createServerSpy).toHaveBeenCalled()
    })

    test('Should continue server startup when TDS sync scheduler fails', async () => {
      mockStartTdsSyncScheduler.mockImplementationOnce(() => {
        throw new Error('TDS scheduler failed to start')
      })

      server = await startServerImport.startServer()

      expect(server).toBeDefined()
      expect(createServerSpy).toHaveBeenCalled()
    })
  })
})
