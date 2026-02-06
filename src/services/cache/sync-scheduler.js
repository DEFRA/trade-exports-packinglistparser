import cron from 'node-cron'
import { syncMdmToS3 } from './mdm-s3-sync.js'
import { config } from '../../config.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger()

let scheduledTask = null

/**
 * Start the MDM to S3 synchronization scheduler
 * Schedules hourly synchronization jobs based on configuration
 * @returns {Object} Scheduler instance
 */
export function startSyncScheduler() {
  const { enabled, cronSchedule } = config.get('ineligibleItemsSync')

  if (!enabled) {
    logger.info(
      'MDM to S3 synchronization is disabled, skipping scheduler setup'
    )
    return null
  }

  if (scheduledTask) {
    logger.warn('Sync scheduler is already running')
    return scheduledTask
  }

  // Validate cron schedule
  if (!cron.validate(cronSchedule)) {
    logger.error({ cronSchedule }, 'Invalid cron schedule for MDM to S3 sync')
    throw new Error(`Invalid cron schedule: ${cronSchedule}`)
  }

  logger.info({ cronSchedule }, 'Starting MDM to S3 synchronization scheduler')

  scheduledTask = cron.schedule(
    cronSchedule,
    async () => {
      logger.info('Scheduled MDM to S3 synchronization triggered')
      try {
        await syncMdmToS3()
      } catch (error) {
        logger.error(
          {
            error: {
              message: error.message,
              stack_trace: error.stack
            }
          },
          'Scheduled synchronization failed'
        )
      }
    },
    {
      scheduled: true,
      timezone: 'UTC'
    }
  )

  logger.info('MDM to S3 synchronization scheduler started successfully')

  return scheduledTask
}

/**
 * Stop the MDM to S3 synchronization scheduler
 */
export function stopSyncScheduler() {
  if (scheduledTask) {
    logger.info('Stopping MDM to S3 synchronization scheduler')
    scheduledTask.stop()
    scheduledTask = null
    logger.info('MDM to S3 synchronization scheduler stopped')
  } else {
    logger.warn('No active sync scheduler to stop')
  }
}

/**
 * Get the current scheduler status
 * @returns {boolean} True if scheduler is running, false otherwise
 */
export function isSchedulerRunning() {
  return scheduledTask !== null
}
