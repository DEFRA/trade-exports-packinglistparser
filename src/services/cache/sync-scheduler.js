import cron from 'node-cron'
import { syncMdmToS3 } from './mdm-s3-sync.js'
import { syncIsoCodesMdmToS3 } from './iso-codes-mdm-s3-sync.js'
import { config } from '../../config.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger()

let ineligibleItemsScheduledTask = null
let isoCodesScheduledTask = null

/**
 * Start the ineligible items MDM to S3 synchronization scheduler
 * Schedules hourly synchronization jobs based on configuration
 * @returns {Object} Scheduler instance
 */
function startIneligibleItemsSyncScheduler() {
  const { enabled: mdmEnabled } = config.get('mdmIntegration')
  const { cronSchedule } = config.get('ineligibleItemsSync')

  if (!mdmEnabled) {
    logger.info(
      'MDM integration is disabled, skipping ineligible items sync scheduler setup'
    )
    return null
  }

  if (ineligibleItemsScheduledTask) {
    logger.warn('Ineligible items sync scheduler is already running')
    return ineligibleItemsScheduledTask
  }

  // Validate cron schedule
  if (!cron.validate(cronSchedule)) {
    logger.error(
      { cronSchedule },
      'Invalid cron schedule for ineligible items MDM to S3 sync'
    )
    throw new Error(`Invalid cron schedule: ${cronSchedule}`)
  }

  logger.info(
    { cronSchedule },
    'Starting ineligible items MDM to S3 synchronization scheduler'
  )

  ineligibleItemsScheduledTask = cron.schedule(
    cronSchedule,
    async () => {
      logger.info(
        'Scheduled ineligible items MDM to S3 synchronization triggered'
      )
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
          'Scheduled ineligible items synchronization failed'
        )
      }
    },
    {
      scheduled: true,
      timezone: 'UTC'
    }
  )

  logger.info(
    'Ineligible items MDM to S3 synchronization scheduler started successfully'
  )

  return ineligibleItemsScheduledTask
}

/**
 * Start the ISO codes MDM to S3 synchronization scheduler
 * Schedules hourly synchronization jobs based on configuration
 * @returns {Object} Scheduler instance
 */
function startIsoCodesSyncScheduler() {
  const { enabled: mdmEnabled } = config.get('mdmIntegration')
  const { cronSchedule } = config.get('isoCodesSync')

  if (!mdmEnabled) {
    logger.info(
      'MDM integration is disabled, skipping ISO codes sync scheduler setup'
    )
    return null
  }

  if (isoCodesScheduledTask) {
    logger.warn('ISO codes sync scheduler is already running')
    return isoCodesScheduledTask
  }

  // Validate cron schedule
  if (!cron.validate(cronSchedule)) {
    logger.error(
      { cronSchedule },
      'Invalid cron schedule for ISO codes MDM to S3 sync'
    )
    throw new Error(`Invalid cron schedule: ${cronSchedule}`)
  }

  logger.info(
    { cronSchedule },
    'Starting ISO codes MDM to S3 synchronization scheduler'
  )

  isoCodesScheduledTask = cron.schedule(
    cronSchedule,
    async () => {
      logger.info('Scheduled ISO codes MDM to S3 synchronization triggered')
      try {
        await syncIsoCodesMdmToS3()
      } catch (error) {
        logger.error(
          {
            error: {
              message: error.message,
              stack_trace: error.stack
            }
          },
          'Scheduled ISO codes synchronization failed'
        )
      }
    },
    {
      scheduled: true,
      timezone: 'UTC'
    }
  )

  logger.info(
    'ISO codes MDM to S3 synchronization scheduler started successfully'
  )

  return isoCodesScheduledTask
}

/**
 * Start all MDM to S3 synchronization schedulers
 * Starts both ineligible items and ISO codes synchronization
 * @returns {Object} Object containing both scheduler instances
 */
export function startSyncScheduler() {
  return {
    ineligibleItems: startIneligibleItemsSyncScheduler(),
    isoCodes: startIsoCodesSyncScheduler()
  }
}

/**
 * Stop all MDM to S3 synchronization schedulers
 */
export function stopSyncScheduler() {
  let stopped = false

  if (ineligibleItemsScheduledTask) {
    logger.info('Stopping ineligible items MDM to S3 synchronization scheduler')
    ineligibleItemsScheduledTask.stop()
    ineligibleItemsScheduledTask = null
    logger.info('Ineligible items MDM to S3 synchronization scheduler stopped')
    stopped = true
  }

  if (isoCodesScheduledTask) {
    logger.info('Stopping ISO codes MDM to S3 synchronization scheduler')
    isoCodesScheduledTask.stop()
    isoCodesScheduledTask = null
    logger.info('ISO codes MDM to S3 synchronization scheduler stopped')
    stopped = true
  }

  if (!stopped) {
    logger.warn('No active sync schedulers to stop')
  }
}

/**
 * Get the current scheduler status
 * @returns {Object} Object with status of both schedulers
 */
export function isSchedulerRunning() {
  return {
    ineligibleItems: ineligibleItemsScheduledTask !== null,
    isoCodes: isoCodesScheduledTask !== null
  }
}
