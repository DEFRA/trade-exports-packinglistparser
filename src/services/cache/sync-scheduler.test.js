import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import cron from 'node-cron'
import {
  startSyncScheduler,
  stopSyncScheduler,
  isSchedulerRunning
} from './sync-scheduler.js'
import { syncMdmToS3 } from './mdm-s3-sync.js'
import { config } from '../../config.js'

// Mock dependencies
vi.mock('node-cron')
vi.mock('./mdm-s3-sync.js')
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
      if (key === 'ineligibleItemsSync') {
        return {
          enabled: true,
          cronSchedule: '0 * * * *'
        }
      }
      return {}
    })
  }
}))

describe('sync-scheduler', () => {
  let mockScheduledTask

  beforeEach(() => {
    vi.clearAllMocks()

    mockScheduledTask = {
      stop: vi.fn()
    }

    cron.validate = vi.fn().mockReturnValue(true)
    cron.schedule = vi.fn().mockReturnValue(mockScheduledTask)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Clean up scheduler after each test
    stopSyncScheduler()
  })

  describe('startSyncScheduler', () => {
    it('should start the scheduler with valid configuration', () => {
      const result = startSyncScheduler()

      expect(cron.validate).toHaveBeenCalledWith('0 * * * *')
      expect(cron.schedule).toHaveBeenCalledWith(
        '0 * * * *',
        expect.any(Function),
        {
          scheduled: true,
          timezone: 'UTC'
        }
      )
      expect(result).toBe(mockScheduledTask)
      expect(isSchedulerRunning()).toBe(true)
    })

    it('should return null when sync is disabled', () => {
      config.get.mockReturnValueOnce({
        enabled: false,
        cronSchedule: '0 * * * *'
      })

      const result = startSyncScheduler()

      expect(result).toBeNull()
      expect(cron.schedule).not.toHaveBeenCalled()
      expect(isSchedulerRunning()).toBe(false)
    })

    it('should throw error for invalid cron schedule', () => {
      cron.validate.mockReturnValue(false)

      expect(() => startSyncScheduler()).toThrow(
        'Invalid cron schedule: 0 * * * *'
      )
      expect(cron.schedule).not.toHaveBeenCalled()
    })

    it('should return existing task if already running', () => {
      const firstResult = startSyncScheduler()
      const secondResult = startSyncScheduler()

      expect(firstResult).toBe(secondResult)
      expect(cron.schedule).toHaveBeenCalledTimes(1)
    })

    it('should execute sync function on scheduled time', async () => {
      const { syncMdmToS3 } = await import('./mdm-s3-sync.js')
      syncMdmToS3.mockResolvedValue({ success: true })

      startSyncScheduler()

      // Get the scheduled callback function
      const scheduledCallback = cron.schedule.mock.calls[0][1]

      // Execute the callback
      await scheduledCallback()

      expect(syncMdmToS3).toHaveBeenCalledTimes(1)
    })

    it('should handle sync errors gracefully', async () => {
      const mockError = new Error('Sync failed')
      syncMdmToS3.mockRejectedValue(mockError)

      startSyncScheduler()

      // Get the scheduled callback function
      const scheduledCallback = cron.schedule.mock.calls[0][1]

      // Execute the callback - should not throw
      await expect(scheduledCallback()).resolves.toBeUndefined()
    })
  })

  describe('stopSyncScheduler', () => {
    it('should stop the running scheduler', () => {
      startSyncScheduler()
      stopSyncScheduler()

      expect(mockScheduledTask.stop).toHaveBeenCalledTimes(1)
      expect(isSchedulerRunning()).toBe(false)
    })

    it('should handle stopping when no scheduler is running', () => {
      stopSyncScheduler()

      expect(mockScheduledTask.stop).not.toHaveBeenCalled()
      expect(isSchedulerRunning()).toBe(false)
    })

    it('should allow restarting after stopping', () => {
      startSyncScheduler()
      stopSyncScheduler()

      const newTask = {
        stop: vi.fn()
      }
      cron.schedule.mockReturnValue(newTask)

      const result = startSyncScheduler()

      expect(result).toBe(newTask)
      expect(cron.schedule).toHaveBeenCalledTimes(2)
    })
  })

  describe('isSchedulerRunning', () => {
    it('should return true when scheduler is running', () => {
      startSyncScheduler()
      expect(isSchedulerRunning()).toBe(true)
    })

    it('should return false when scheduler is not running', () => {
      expect(isSchedulerRunning()).toBe(false)
    })

    it('should return false after stopping', () => {
      startSyncScheduler()
      stopSyncScheduler()
      expect(isSchedulerRunning()).toBe(false)
    })
  })
})
