import { STATUS_CODES } from 'node:http'

const helloWorld = {
  method: 'GET',
  path: '/helloWorld',
  handler: (_request, h) =>
    h.response({ Message: 'Hello World' }).code(STATUS_CODES.OK)
}

export { helloWorld }
