import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  startSyncScheduler,
  stopSyncScheduler,
  isSchedulerRunning
} from './sync-scheduler.js'
import { config } from '../../config.js'

// Variables to capture scheduler options - uses var to avoid TDZ issues with hoisting
// eslint-disable-next-line no-var
var capturedIneligibleItems
// eslint-disable-next-line no-var
var capturedIsoCodes

// Mock dependencies
vi.mock('./mdm-s3-sync.js')
vi.mock('./iso-codes-mdm-s3-sync.js')
vi.mock('../../common/helpers/sync-scheduler-factory.js', () => ({
  createSyncScheduler: vi.fn((options) => {
    // Capture the options for testing - identify by name
    if (options.name === 'MDM to S3') {
      capturedIneligibleItems = options
    } else if (options.name === 'ISO codes MDM to S3') {
      capturedIsoCodes = options
    }
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
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    stopSyncScheduler()
  })

  describe('startSyncScheduler', () => {
    it('should start both schedulers with valid configuration', () => {
      const result = startSyncScheduler()

      expect(result).toBeDefined()
      expect(result).toHaveProperty('ineligibleItems')
      expect(result).toHaveProperty('isoCodes')
    })

    it('should return null for both schedulers when MDM integration is disabled', () => {
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

      expect(result.ineligibleItems).toBeNull()
      expect(result.isoCodes).toBeNull()
    })
  })

  describe('stopSyncScheduler', () => {
    it('should stop both schedulers', () => {
      startSyncScheduler()
      stopSyncScheduler()

      // Should not throw
      expect(true).toBe(true)
    })
  })

  describe('isSchedulerRunning', () => {
    it('should return status for both schedulers', () => {
      const status = isSchedulerRunning()
      expect(status).toHaveProperty('ineligibleItems')
      expect(status).toHaveProperty('isoCodes')
      expect(typeof status.ineligibleItems).toBe('boolean')
      expect(typeof status.isoCodes).toBe('boolean')
    })
  })

  describe('scheduler configuration', () => {
    it('should configure ineligible items scheduler with correct name and schedule', () => {
      expect(capturedIneligibleItems).toBeDefined()
      expect(capturedIneligibleItems.name).toBe('MDM to S3')
      expect(typeof capturedIneligibleItems.cronSchedule).not.toBe('undefined')
      const cronValue = capturedIneligibleItems.cronSchedule
      expect(cronValue).toBe('0 * * * *')
    })

    it('should configure ISO codes scheduler with correct name and schedule', () => {
      expect(capturedIsoCodes).toBeDefined()
      expect(capturedIsoCodes.name).toBe('ISO codes MDM to S3')
      expect(typeof capturedIsoCodes.cronSchedule).not.toBe('undefined')
      const cronValue = capturedIsoCodes.cronSchedule
      expect(cronValue).toBe('0 * * * *')
    })

    it('should use enabled from mdmIntegration config getter for both schedulers', () => {
      expect(capturedIneligibleItems.enabled).toBe(true)
      expect(capturedIsoCodes.enabled).toBe(true)

      // Mock disabled
      vi.mocked(config.get).mockImplementation((key) => {
        if (key === 'mdmIntegration') {
          return { enabled: false }
        }
        return {
          enabled: true,
          cronSchedule: '0 * * * *'
        }
      })

      const ineligibleEnabled = capturedIneligibleItems.enabled
      const isoEnabled = capturedIsoCodes.enabled
      expect(ineligibleEnabled).toBe(false)
      expect(isoEnabled).toBe(false)
    })

    it('should retrieve cronSchedule dynamically from config getter for ineligible items', () => {
      vi.mocked(config.get).mockImplementation((key) => {
        if (key === 'ineligibleItemsSync') {
          return { cronSchedule: '*/15 * * * *' }
        }
        return { enabled: true, cronSchedule: '0 * * * *' }
      })

      const cronSchedule = capturedIneligibleItems.cronSchedule
      expect(cronSchedule).toBe('*/15 * * * *')
    })

    it('should retrieve cronSchedule dynamically from config getter for ISO codes', () => {
      vi.mocked(config.get).mockImplementation((key) => {
        if (key === 'isoCodesSync') {
          return { cronSchedule: '*/30 * * * *' }
        }
        return { enabled: true, cronSchedule: '0 * * * *' }
      })

      const cronSchedule = capturedIsoCodes.cronSchedule
      expect(cronSchedule).toBe('*/30 * * * *')
    })
  })
})
