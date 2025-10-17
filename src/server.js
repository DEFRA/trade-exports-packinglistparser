const Hapi = require('@hapi/hapi')
const { secureContext } = require('@defra/hapi-secure-context')
const { config } = require('./config.js')
const { requestLogger } = require('./common/helpers/logging/request-logger.js')
const { failAction } = require('./common/helpers/fail-action.js')
const { pulse } = require('./common/helpers/pulse.js')
const { requestTracing } = require('./common/helpers/request-tracing.js')
const { setupProxy } = require('./common/helpers/proxy/setup-proxy.js')
const router = require('./plugins/router.js')

async function createServer() {
  setupProxy()
  const server = Hapi.server({
    host: config.get('host'),
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        },
        failAction
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  // Hapi Plugins:
  // requestLogger  - automatically logs incoming requests
  // requestTracing - trace header logging and propagation
  // secureContext  - loads CA certificates from environment config
  // pulse          - provides shutdown handlers
  // router         - routes used in the app
  await server.register([
    requestLogger,
    requestTracing,
    secureContext,
    pulse,
    router
  ])

  return server
}
module.exports = {
  createServer
}
