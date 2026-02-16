import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import cron from 'node-cron'
import { createLogger } from './logging/logger.js'
import { createSyncScheduler } from './sync-scheduler-factory.js'

// Mock node-cron
vi.mock('node-cron')

// Create a single mockLogger instance that will be reused by all tests
// This needs to be defined inline to avoid hoisting issues
vi.mock('./logging/logger.js', () => {
  const mockLoggerInstance = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
  return {
    createLogger: vi.fn(() => mockLoggerInstance)
  }
})

// Get the shared mock logger instance
const mockLogger = createLogger()

describe('createSyncScheduler', () => {
  let mockSyncFunction
  let scheduledTask

  beforeEach(() => {
    vi.clearAllMocks()

    mockSyncFunction = vi.fn().mockResolvedValue(undefined)

    scheduledTask = {
      stop: vi.fn()
    }

    vi.mocked(cron.schedule).mockReturnValue(scheduledTask)
    vi.mocked(cron.validate).mockReturnValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should create a scheduler object with start, stop, and isRunning methods', () => {
      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      expect(scheduler).toHaveProperty('start')
      expect(scheduler).toHaveProperty('stop')
      expect(scheduler).toHaveProperty('isRunning')
      expect(typeof scheduler.start).toBe('function')
      expect(typeof scheduler.stop).toBe('function')
      expect(typeof scheduler.isRunning).toBe('function')
    })

    it('should not start scheduler automatically on creation', () => {
      createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      expect(cron.schedule).not.toHaveBeenCalled()
    })
  })

  describe('start', () => {
    it('should return null and log info when scheduler is disabled', () => {
      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: false,
        cronSchedule: '0 * * * *'
      })

      const result = scheduler.start()

      expect(result).toBeNull()
      expect(mockLogger.info).toHaveBeenCalledWith(
        'TestSync synchronization is disabled, skipping scheduler setup'
      )
      expect(cron.schedule).not.toHaveBeenCalled()
    })

    it('should validate cron schedule before starting', () => {
      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      scheduler.start()

      expect(cron.validate).toHaveBeenCalledWith('0 * * * *')
    })

    it('should throw error with invalid cron schedule', () => {
      vi.mocked(cron.validate).mockReturnValueOnce(false)

      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: 'invalid-cron'
      })

      expect(() => scheduler.start()).toThrow(
        'Invalid cron schedule: invalid-cron'
      )
      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          error: {
            message: 'Invalid cron schedule: invalid-cron',
            stack_trace: expect.any(String),
            type: 'Error'
          }
        },
        'Invalid cron schedule for TestSync sync (cronSchedule: invalid-cron)'
      )
    })

    it('should start scheduler with valid configuration', () => {
      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      const result = scheduler.start()

      expect(result).toBe(scheduledTask)
      expect(cron.schedule).toHaveBeenCalledWith(
        '0 * * * *',
        expect.any(Function),
        {
          scheduled: true,
          timezone: 'UTC'
        }
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Starting TestSync synchronization scheduler (cronSchedule: 0 * * * *)'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'TestSync synchronization scheduler started successfully'
      )
    })

    it('should return existing task and log warning when scheduler is already running', () => {
      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      const firstStart = scheduler.start()
      vi.mocked(cron.schedule).mockClear()
      vi.mocked(mockLogger.warn).mockClear()

      const secondStart = scheduler.start()

      expect(secondStart).toBe(firstStart)
      expect(cron.schedule).not.toHaveBeenCalled()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'TestSync sync scheduler is already running'
      )
    })
  })

  describe('scheduled task execution', () => {
    it('should execute sync function when scheduled task is triggered', async () => {
      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      scheduler.start()

      // Get the callback function passed to cron.schedule
      const scheduledCallback = vi.mocked(cron.schedule).mock.calls[0][1]

      // Execute the callback
      await scheduledCallback()

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Scheduled TestSync synchronization triggered'
      )
      expect(mockSyncFunction).toHaveBeenCalledTimes(1)
    })

    it('should handle sync function errors gracefully', async () => {
      const testError = new Error('Sync failed')
      testError.stack = 'Error stack trace'
      mockSyncFunction.mockRejectedValueOnce(testError)

      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      scheduler.start()

      // Get the callback function passed to cron.schedule
      const scheduledCallback = vi.mocked(cron.schedule).mock.calls[0][1]

      // Execute the callback - should not throw
      await expect(scheduledCallback()).resolves.toBeUndefined()

      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          error: {
            message: 'Sync failed',
            stack_trace: 'Error stack trace',
            type: 'Error'
          }
        },
        'Scheduled TestSync synchronization failed'
      )
    })

    it('should continue scheduler even after sync function error', async () => {
      const testError = new Error('Sync failed')
      mockSyncFunction.mockRejectedValueOnce(testError)

      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      scheduler.start()

      // Get the callback function
      const scheduledCallback = vi.mocked(cron.schedule).mock.calls[0][1]

      // First execution fails
      await scheduledCallback()

      // Second execution should still work
      mockSyncFunction.mockResolvedValueOnce(undefined)
      await scheduledCallback()

      expect(mockSyncFunction).toHaveBeenCalledTimes(2)
    })
  })

  describe('stop', () => {
    it('should stop running scheduler', () => {
      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      scheduler.start()
      vi.mocked(mockLogger.info).mockClear()
      vi.mocked(mockLogger.warn).mockClear()

      scheduler.stop()

      expect(scheduledTask.stop).toHaveBeenCalledTimes(1)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Stopping TestSync synchronization scheduler'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'TestSync synchronization scheduler stopped'
      )
    })

    it('should log warning when stopping non-running scheduler', () => {
      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      scheduler.stop()

      expect(scheduledTask.stop).not.toHaveBeenCalled()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'No active TestSync sync scheduler to stop'
      )
    })

    it('should allow restarting scheduler after stopping', () => {
      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      scheduler.start()
      scheduler.stop()
      vi.mocked(cron.schedule).mockClear()

      const result = scheduler.start()

      expect(result).toBeDefined()
      expect(cron.schedule).toHaveBeenCalledTimes(1)
    })
  })

  describe('isRunning', () => {
    it('should return false when scheduler has not been started', () => {
      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      expect(scheduler.isRunning()).toBe(false)
    })

    it('should return true when scheduler is running', () => {
      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      scheduler.start()

      expect(scheduler.isRunning()).toBe(true)
    })

    it('should return false after scheduler is stopped', () => {
      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      scheduler.start()
      scheduler.stop()

      expect(scheduler.isRunning()).toBe(false)
    })

    it('should return false when scheduler is disabled and never started', () => {
      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: false,
        cronSchedule: '0 * * * *'
      })

      scheduler.start() // Attempts to start but should be disabled

      expect(scheduler.isRunning()).toBe(false)
    })
  })

  describe('scheduler configuration', () => {
    it('should use UTC timezone for scheduled tasks', () => {
      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      scheduler.start()

      const scheduleOptions = vi.mocked(cron.schedule).mock.calls[0][2]
      expect(scheduleOptions.timezone).toBe('UTC')
    })

    it('should set scheduled flag to true', () => {
      const scheduler = createSyncScheduler({
        name: 'TestSync',
        syncFunction: mockSyncFunction,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      scheduler.start()

      const scheduleOptions = vi.mocked(cron.schedule).mock.calls[0][2]
      expect(scheduleOptions.scheduled).toBe(true)
    })

    it('should accept different cron schedule formats', () => {
      const cronSchedules = [
        '0 * * * *', // Every hour
        '*/5 * * * *', // Every 5 minutes
        '0 0 * * *', // Daily at midnight
        '0 0 * * 0' // Weekly on Sunday
      ]

      cronSchedules.forEach((schedule) => {
        vi.mocked(cron.schedule).mockClear()

        const scheduler = createSyncScheduler({
          name: 'TestSync',
          syncFunction: mockSyncFunction,
          enabled: true,
          cronSchedule: schedule
        })

        scheduler.start()

        expect(cron.schedule).toHaveBeenCalledWith(
          schedule,
          expect.any(Function),
          expect.any(Object)
        )
      })
    })
  })

  describe('multiple schedulers', () => {
    it('should support creating multiple independent schedulers', () => {
      const syncFunc1 = vi.fn().mockResolvedValue(undefined)
      const syncFunc2 = vi.fn().mockResolvedValue(undefined)

      const scheduler1 = createSyncScheduler({
        name: 'Sync1',
        syncFunction: syncFunc1,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      const scheduler2 = createSyncScheduler({
        name: 'Sync2',
        syncFunction: syncFunc2,
        enabled: true,
        cronSchedule: '*/5 * * * *'
      })

      scheduler1.start()
      scheduler2.start()

      expect(scheduler1.isRunning()).toBe(true)
      expect(scheduler2.isRunning()).toBe(true)
      expect(cron.schedule).toHaveBeenCalledTimes(2)
    })

    it('should stop schedulers independently', () => {
      const syncFunc1 = vi.fn().mockResolvedValue(undefined)
      const syncFunc2 = vi.fn().mockResolvedValue(undefined)

      const scheduler1 = createSyncScheduler({
        name: 'Sync1',
        syncFunction: syncFunc1,
        enabled: true,
        cronSchedule: '0 * * * *'
      })

      const scheduler2 = createSyncScheduler({
        name: 'Sync2',
        syncFunction: syncFunc2,
        enabled: true,
        cronSchedule: '*/5 * * * *'
      })

      scheduler1.start()
      scheduler2.start()
      scheduler1.stop()

      expect(scheduler1.isRunning()).toBe(false)
      expect(scheduler2.isRunning()).toBe(true)
    })
  })
})
