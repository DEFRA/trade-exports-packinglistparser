module.exports = {
  method: 'GET',
  path: '/helloWorld',
  handler: async (request, h) => {
    return h.response({ Message: 'Hello World' }).code(200)
  }
}
