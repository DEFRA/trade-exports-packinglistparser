import { STATUS_CODES } from './statuscodes.js'

const home = {
  method: 'GET',
  path: '/',
  handler: (_request, h) =>
    h
      .response(
        `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Home</title>
      </head>
      <body>
        <h1>PLP Application</h1>
      </body>
      </html>
    `
      )
      .code(STATUS_CODES.OK)
}

export { home }
