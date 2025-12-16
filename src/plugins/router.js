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

const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route([home])
      server.route([health])
      server.route([connectivityCheck])
      server.route([getListFromS3, getFromS3, addFileToS3])
      server.route([getDispatchLocationRoute, dynamicsHealthCheck])
      server.route([sendtoqueue])
      server.route([getFileFromBlob, formsContainerExists])
      server.route([ineligibleItems])
      server.route([packingListProcessRoute])
    }
  }
}

export { router }
