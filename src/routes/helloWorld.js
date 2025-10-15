const helloWorld = {
  method: 'GET',
  path: '/helloWorld',
  handler: (_request, h) => h.response({ Message: 'Hello World' }).code(200)
}

export { helloWorld }
