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
vi.mock('./iso-codes-mdm-s3-sync.js')
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
      if (key === 'mdmIntegration') {
        return {
          enabled: true
        }
      }
      if (key === 'ineligibleItemsSync') {
        return {
          cronSchedule: '0 * * * *'
        }
      }
      if (key === 'isoCodesSync') {
        return {
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
    it('should start both schedulers with valid configuration', () => {
      const result = startSyncScheduler()

      expect(cron.validate).toHaveBeenCalledWith('0 * * * *')
      expect(cron.schedule).toHaveBeenCalledTimes(2) // Once for each scheduler
      expect(result).toEqual({
        ineligibleItems: mockScheduledTask,
        isoCodes: mockScheduledTask
      })
      expect(isSchedulerRunning()).toEqual({
        ineligibleItems: true,
        isoCodes: true
      })
    })

    it('should return null when MDM integration is disabled', () => {
      config.get.mockImplementation((key) => {
        if (key === 'mdmIntegration') {
          return { enabled: false }
        }
        if (key === 'ineligibleItemsSync') {
          return { cronSchedule: '0 * * * *' }
        }
        if (key === 'isoCodesSync') {
          return { cronSchedule: '0 * * * *' }
        }
        return {}
      })

      const result = startSyncScheduler()

      expect(result).toEqual({
        ineligibleItems: null,
        isoCodes: null
      })
      expect(cron.schedule).not.toHaveBeenCalled()
      expect(isSchedulerRunning()).toEqual({
        ineligibleItems: false,
        isoCodes: false
      })
    })

    it('should throw error for invalid cron schedule', () => {
      cron.validate.mockReturnValue(false)

      expect(() => startSyncScheduler()).toThrow(
        'Invalid cron schedule: 0 * * * *'
      )
    })

    it('should return existing task if already running', () => {
      const firstResult = startSyncScheduler()
      const secondResult = startSyncScheduler()

      expect(firstResult).toEqual(secondResult)
      expect(cron.schedule).toHaveBeenCalledTimes(2) // Initial call for both schedulers
    })

    it('should execute sync functions on scheduled time', async () => {
      const { syncMdmToS3 } = await import('./mdm-s3-sync.js')
      const { syncIsoCodesMdmToS3 } = await import('./iso-codes-mdm-s3-sync.js')
      syncMdmToS3.mockResolvedValue({ success: true })
      syncIsoCodesMdmToS3.mockResolvedValue({ success: true })

      startSyncScheduler()

      // Get the scheduled callback functions
      const ineligibleItemsCallback = cron.schedule.mock.calls[0][1]
      const isoCodesCallback = cron.schedule.mock.calls[1][1]

      // Execute the callbacks
      await ineligibleItemsCallback()
      await isoCodesCallback()

      expect(syncMdmToS3).toHaveBeenCalledTimes(1)
      expect(syncIsoCodesMdmToS3).toHaveBeenCalledTimes(1)
    })

    it('should handle sync errors gracefully', async () => {
      const mockError = new Error('Sync failed')
      syncMdmToS3.mockRejectedValue(mockError)

      startSyncScheduler()

      // Get the scheduled callback function for ineligible items
      const scheduledCallback = cron.schedule.mock.calls[0][1]

      // Execute the callback - should not throw
      await expect(scheduledCallback()).resolves.toBeUndefined()
    })

    it('should handle ISO codes sync errors gracefully', async () => {
      const { syncIsoCodesMdmToS3 } = await import('./iso-codes-mdm-s3-sync.js')
      const mockError = new Error('ISO codes sync failed')
      syncIsoCodesMdmToS3.mockRejectedValue(mockError)

      startSyncScheduler()

      // Get the scheduled callback function for ISO codes
      const isoCodesCallback = cron.schedule.mock.calls[1][1]

      // Execute the callback - should not throw
      await expect(isoCodesCallback()).resolves.toBeUndefined()
    })

    it('should throw error for invalid ISO codes cron schedule', () => {
      // Make the first validation pass but the second fail
      cron.validate
        .mockReturnValueOnce(true) // ineligible items passes
        .mockReturnValueOnce(false) // ISO codes fails

      // This should throw when trying to start ISO codes scheduler
      expect(() => startSyncScheduler()).toThrow(
        'Invalid cron schedule: 0 * * * *'
      )
    })
  })

  describe('stopSyncScheduler', () => {
    it('should stop the running schedulers', () => {
      startSyncScheduler()
      stopSyncScheduler()

      expect(mockScheduledTask.stop).toHaveBeenCalledTimes(2) // Both schedulers stopped
      expect(isSchedulerRunning()).toEqual({
        ineligibleItems: false,
        isoCodes: false
      })
    })

    it('should handle stopping when no scheduler is running', () => {
      stopSyncScheduler()

      expect(mockScheduledTask.stop).not.toHaveBeenCalled()
      expect(isSchedulerRunning()).toEqual({
        ineligibleItems: false,
        isoCodes: false
      })
    })

    it('should allow restarting after stopping', () => {
      startSyncScheduler()
      stopSyncScheduler()

      const newTask = {
        stop: vi.fn()
      }
      cron.schedule.mockReturnValue(newTask)

      const result = startSyncScheduler()

      expect(result).toEqual({
        ineligibleItems: newTask,
        isoCodes: newTask
      })
      expect(cron.schedule).toHaveBeenCalledTimes(4) // 2 initial + 2 restart
    })
  })

  describe('isSchedulerRunning', () => {
    it('should return true when schedulers are running', () => {
      startSyncScheduler()
      expect(isSchedulerRunning()).toEqual({
        ineligibleItems: true,
        isoCodes: true
      })
    })

    it('should return false when schedulers are not running', () => {
      expect(isSchedulerRunning()).toEqual({
        ineligibleItems: false,
        isoCodes: false
      })
    })

    it('should return false after stopping', () => {
      startSyncScheduler()
      stopSyncScheduler()
      expect(isSchedulerRunning()).toEqual({
        ineligibleItems: false,
        isoCodes: false
      })
    })
  })
})
