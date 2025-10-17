module.exports = {
  method: 'GET',
  path: '/health',
  handler: async (request, h) => {
    return h.response({ Message: 'Success' }).code(200)
  }
}
