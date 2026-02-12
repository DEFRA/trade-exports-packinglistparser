/**
 * Convert a readable stream to a buffer
 * @param {NodeJS.ReadableStream} readableStream - Stream to convert
 * @returns {Promise<Buffer>} Buffer containing all stream data
 */
export async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data))
    })
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    readableStream.on('error', reject)
  })
}
