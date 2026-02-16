import cron from 'node-cron'
import { createLogger } from './logging/logger.js'
import { formatError } from './logging/error-logger.js'

const logger = createLogger()

/**
 * Creates a scheduler for synchronization tasks
 * @param {Object} options - Scheduler configuration options
 * @param {string} options.name - Name of the sync operation (for logging)
 * @param {Function} options.syncFunction - The async function to execute on schedule
 * @param {boolean} options.enabled - Whether the scheduler is enabled
 * @param {string} options.cronSchedule - Cron schedule expression
 * @returns {Object} Object with start, stop, and isRunning methods
 */
export function createSyncScheduler(options) {
  const { name, syncFunction, enabled, cronSchedule } = options

  let scheduledTask = null

  /**
   * Start the synchronization scheduler
   * @returns {Object|null} Scheduler instance or null if disabled/already running
   */
  function start() {
    if (!enabled) {
      logger.info(
        `${name} synchronization is disabled, skipping scheduler setup`
      )
      return null
    }

    if (scheduledTask) {
      logger.warn(`${name} sync scheduler is already running`)
      return scheduledTask
    }

    // Validate cron schedule
    if (!cron.validate(cronSchedule)) {
      const error = new Error(`Invalid cron schedule: ${cronSchedule}`)
      logger.error(
        formatError(error),
        `Invalid cron schedule for ${name} sync (cronSchedule: ${cronSchedule})`
      )
      throw error
    }

    logger.info(
      `Starting ${name} synchronization scheduler (cronSchedule: ${cronSchedule})`
    )

    scheduledTask = cron.schedule(
      cronSchedule,
      async () => {
        logger.info(`Scheduled ${name} synchronization triggered`)
        try {
          await syncFunction()
        } catch (error) {
          logger.error(
            formatError(error),
            `Scheduled ${name} synchronization failed`
          )
        }
      },
      {
        scheduled: true,
        timezone: 'UTC'
      }
    )

    logger.info(`${name} synchronization scheduler started successfully`)

    return scheduledTask
  }

  /**
   * Stop the synchronization scheduler
   */
  function stop() {
    if (scheduledTask) {
      logger.info(`Stopping ${name} synchronization scheduler`)
      scheduledTask.stop()
      scheduledTask = null
      logger.info(`${name} synchronization scheduler stopped`)
    } else {
      logger.warn(`No active ${name} sync scheduler to stop`)
    }
  }

  /**
   * Get the current scheduler status
   * @returns {boolean} True if scheduler is running, false otherwise
   */
  function isRunning() {
    return scheduledTask !== null
  }

  return {
    start,
    stop,
    isRunning
  }
}
