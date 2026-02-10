import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  startTdsSyncScheduler,
  stopTdsSyncScheduler,
  isTdsSchedulerRunning
} from './sync-scheduler.js'
import { config } from '../../config.js'

// Mock dependencies
vi.mock('./tds-sync.js')
vi.mock('../../common/helpers/sync-scheduler-factory.js', () => {
  let mockScheduler
  return {
    createSyncScheduler: vi.fn((options) => {
      mockScheduler = {
        start: vi.fn(() => (options.enabled ? { stop: vi.fn() } : null)),
        stop: vi.fn(),
        isRunning: vi.fn(() => false)
      }
      return mockScheduler
    })
  }
})
vi.mock('../../common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }))
}))
vi.mock('../../config.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'tdsSync') {
        return {
          enabled: true,
          cronSchedule: '0 * * * *'
        }
      }
      return {}
    })
  }
}))

describe('TDS sync-scheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    stopTdsSyncScheduler()
  })

  describe('startTdsSyncScheduler', () => {
    it('should start the scheduler with valid configuration', () => {
      const result = startTdsSyncScheduler()

      expect(result).toBeDefined()
    })

    it('should return null when TDS sync is disabled', () => {
      config.get.mockReturnValueOnce({
        enabled: false,
        cronSchedule: '0 * * * *'
      })

      const result = startTdsSyncScheduler()

      expect(result).toBeNull()
    })
  })

  describe('stopTdsSyncScheduler', () => {
    it('should stop the scheduler', () => {
      startTdsSyncScheduler()
      stopTdsSyncScheduler()

      // Should not throw
      expect(true).toBe(true)
    })
  })

  describe('isTdsSchedulerRunning', () => {
    it('should return scheduler status', () => {
      const status = isTdsSchedulerRunning()
      expect(typeof status).toBe('boolean')
    })
  })
})
