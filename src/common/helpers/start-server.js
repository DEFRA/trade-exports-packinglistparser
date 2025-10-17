const config = require('../../config.js').config
const createServer = require('../../server.js').createServer

async function startServer() {
  const server = await createServer()
  await server.start()

  server.logger.info('Server started successfully')
  server.logger.info(
    `Access your backend on http://localhost:${config.get('port')}`
  )

  return server
}
module.exports = {
  startServer
}
