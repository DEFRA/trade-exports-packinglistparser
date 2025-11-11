import { health } from '../routes/health.js'
import { helloWorld } from '../routes/helloWorld.js'
import { getFromS3, getListFromS3, addFileToS3 } from '../routes/s3.js'
import {
  getDispatchLocationRoute,
  dynamicsHealthCheck
} from '../routes/dynamics.js'

const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route([health])
      server.route([helloWorld])
      server.route([getListFromS3, getFromS3, addFileToS3])
      server.route([getDispatchLocationRoute, dynamicsHealthCheck])
    }
  }
}

export { router }
