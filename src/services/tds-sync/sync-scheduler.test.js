import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  startTdsSyncScheduler,
  stopTdsSyncScheduler,
  isTdsSchedulerRunning
} from './sync-scheduler.js'
import { config } from '../../config.js'

// Variable to capture scheduler options at module load time - uses var to avoid TDZ issues with hoisting
// eslint-disable-next-line no-var
var captured

// Mock dependencies first
vi.mock('./tds-sync.js')

vi.mock('../../common/helpers/sync-scheduler-factory.js', () => ({
  createSyncScheduler: vi.fn((options) => {
    // Capture the options for testing
    captured = options
    return {
      start: vi.fn(() => (options.enabled ? { stop: vi.fn() } : null)),
      stop: vi.fn(),
      isRunning: vi.fn(() => false)
    }
  })
}))

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

// Import after mocks

describe('TDS sync-scheduler', () => {
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
      vi.mocked(config.get).mockReturnValueOnce({
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

  describe('scheduler configuration', () => {
    it('should use cronSchedule from config', () => {
      // The scheduler is created at module load time
      expect(captured).toBeDefined()
      expect(typeof captured.cronSchedule).not.toBe('undefined')

      // The cronSchedule is a getter that returns the value from config
      const cronValue = captured.cronSchedule
      expect(cronValue).toBe('0 * * * *')
    })

    it('should retrieve cronSchedule dynamically from config getter', () => {
      // Mock a different cron schedule
      vi.mocked(config.get).mockReturnValue({
        enabled: true,
        cronSchedule: '*/15 * * * *'
      })

      // Access the getter to get the current value
      const cronSchedule = captured.cronSchedule

      expect(cronSchedule).toBe('*/15 * * * *')
      expect(config.get).toHaveBeenCalledWith('tdsSync')
    })

    it('should handle different cronSchedule values', () => {
      const testSchedules = [
        '0 0 * * *', // Daily at midnight
        '*/30 * * * *', // Every 30 minutes
        '0 */2 * * *', // Every 2 hours
        '0 0 * * 0' // Weekly on Sunday
      ]

      testSchedules.forEach((schedule) => {
        vi.mocked(config.get).mockReturnValue({
          enabled: true,
          cronSchedule: schedule
        })

        const result = captured.cronSchedule

        expect(result).toBe(schedule)
      })
    })

    it('should use enabled from config getter', () => {
      // Test that enabled getter works
      expect(typeof captured.enabled).not.toBe('undefined')
      expect(captured.enabled).toBe(true)

      // Mock disabled
      vi.mocked(config.get).mockReturnValue({
        enabled: false,
        cronSchedule: '0 * * * *'
      })

      const enabled = captured.enabled
      expect(enabled).toBe(false)
    })
  })
})
