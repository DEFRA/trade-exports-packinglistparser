const routes = [].concat(
  require("../routes/health.js"),
  require("../routes/helloWorld.js")
)

const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route(routes)
    }
  }
}

export { router }
