import { health } from '../routes/health.js'
import { helloWorld } from '../routes/helloWorld.js'

const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route([health])
      server.route([helloWorld])
    }
  }
}

export { router }
