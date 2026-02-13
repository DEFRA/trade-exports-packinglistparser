import { syncMdmToS3 } from './ineligible-items-mdm-s3-sync.js'
import { syncIsoCodesMdmToS3 } from './iso-codes-mdm-s3-sync.js'
import { config } from '../../config.js'
import { createSyncScheduler } from '../../common/helpers/sync-scheduler-factory.js'

const ineligibleItemsScheduler = createSyncScheduler({
  name: 'MDM to S3',
  syncFunction: syncMdmToS3,
  get enabled() {
    return config.get('mdmIntegration').enabled
  },
  get cronSchedule() {
    return config.get('ineligibleItemsSync').cronSchedule
  }
})

const isoCodesScheduler = createSyncScheduler({
  name: 'ISO codes MDM to S3',
  syncFunction: syncIsoCodesMdmToS3,
  get enabled() {
    return config.get('mdmIntegration').enabled
  },
  get cronSchedule() {
    return config.get('isoCodesSync').cronSchedule
  }
})

/**
 * Start all MDM to S3 synchronization schedulers
 * Starts both ineligible items and ISO codes synchronization
 * @returns {Object} Object containing both scheduler instances
 */
export function startSyncScheduler() {
  return {
    ineligibleItems: ineligibleItemsScheduler.start(),
    isoCodes: isoCodesScheduler.start()
  }
}

/**
 * Stop all MDM to S3 synchronization schedulers
 */
export function stopSyncScheduler() {
  ineligibleItemsScheduler.stop()
  isoCodesScheduler.stop()
}

/**
 * Get the current scheduler status
 * @returns {Object} Object with status of both schedulers
 */
export function isSchedulerRunning() {
  return {
    ineligibleItems: ineligibleItemsScheduler.isRunning(),
    isoCodes: isoCodesScheduler.isRunning()
  }
}
