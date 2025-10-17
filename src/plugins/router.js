const routes = [].concat(
  require('../routes/health'),
  require('../routes/helloWorld')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route(routes)
    }
  }
}
