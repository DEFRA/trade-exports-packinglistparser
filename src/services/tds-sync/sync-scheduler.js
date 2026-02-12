import { syncToTds } from './tds-sync.js'
import { config } from '../../config.js'
import { createSyncScheduler } from '../../common/helpers/sync-scheduler-factory.js'

const scheduler = createSyncScheduler({
  name: 'TDS',
  syncFunction: syncToTds,
  get enabled() {
    return config.get('tdsSync').enabled
  },
  get cronSchedule() {
    return config.get('tdsSync').cronSchedule
  }
})

/**
 * Start the TDS synchronization scheduler
 * Schedules hourly synchronization jobs based on configuration
 * @returns {Object} Scheduler instance
 */
export function startTdsSyncScheduler() {
  return scheduler.start()
}

/**
 * Stop the TDS synchronization scheduler
 */
export function stopTdsSyncScheduler() {
  scheduler.stop()
}

/**
 * Get the current scheduler status
 * @returns {boolean} True if scheduler is running, false otherwise
 */
export function isTdsSchedulerRunning() {
  return scheduler.isRunning()
}
