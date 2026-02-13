import { health } from '../routes/health.js'
import { connectivityCheck } from '../routes/connectivity-check.js'
import { getFromS3, getListFromS3, addFileToS3 } from '../routes/s3.js'
import {
  getDispatchLocationRoute,
  dynamicsHealthCheck
} from '../routes/dynamics.js'
import { home } from '../routes/home.js'
import { packingListProcessRoute } from '../routes/packing-list-process.js'
import { sendtoqueue } from '../routes/trade-service-bus.js'
import { getFileFromBlob, formsContainerExists } from '../routes/ehco-blob.js'
import { ineligibleItems } from '../routes/mdm.js'
import { testRoute } from '../routes/test-parse.js'
import {
  cacheTestIneligibleItems,
  cacheTestIsoCodes
} from '../routes/cache-test.js'
import { config } from '../config.js'

const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      // Core routes available in all environments
      server.route([home])
      server.route([health])
      server.route([connectivityCheck])
      server.route([packingListProcessRoute])

      // Test/development routes - only available in non-production environments
      const environment = config.get('cdpEnvironment')
      const isTestEnvironment = [
        'local',
        'infra-dev',
        'management',
        'dev',
        'test'
      ].includes(environment)

      if (isTestEnvironment) {
        server.route([getListFromS3, getFromS3, addFileToS3])
        server.route([getDispatchLocationRoute, dynamicsHealthCheck])
        server.route([sendtoqueue])
        server.route([getFileFromBlob, formsContainerExists])
        server.route([ineligibleItems])
        server.route([testRoute])
        server.route([cacheTestIneligibleItems, cacheTestIsoCodes])
      }
    }
  }
}

export { router }
