import { describe, it, expect } from 'vitest'
import { Readable } from 'stream'
import { streamToBuffer } from './stream-helpers.js'

describe('stream-helpers', () => {
  describe('streamToBuffer', () => {
    it('should convert a readable stream to a buffer', async () => {
      const testData = 'Hello, World!'
      const stream = Readable.from([testData])

      const buffer = await streamToBuffer(stream)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.toString()).toBe(testData)
    })

    it('should handle multiple chunks', async () => {
      const chunks = ['Hello, ', 'World!']
      const stream = Readable.from(chunks)

      const buffer = await streamToBuffer(stream)

      expect(buffer.toString()).toBe('Hello, World!')
    })

    it('should handle binary data', async () => {
      const binaryData = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f])
      const stream = Readable.from([binaryData])

      const buffer = await streamToBuffer(stream)

      expect(buffer).toEqual(binaryData)
    })

    it('should handle empty stream', async () => {
      const stream = Readable.from([])

      const buffer = await streamToBuffer(stream)

      expect(buffer.length).toBe(0)
      expect(buffer.toString()).toBe('')
    })

    it('should handle stream errors', async () => {
      const stream = new Readable({
        read() {
          this.emit('error', new Error('Stream error'))
        }
      })

      await expect(streamToBuffer(stream)).rejects.toThrow('Stream error')
    })

    it('should convert non-buffer chunks to buffers', async () => {
      const stream = Readable.from(['test', 'data'])

      const buffer = await streamToBuffer(stream)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.toString()).toBe('testdata')
    })

    it('should handle large streams', async () => {
      const largeData = 'x'.repeat(10000)
      const stream = Readable.from([largeData])

      const buffer = await streamToBuffer(stream)

      expect(buffer.length).toBe(10000)
      expect(buffer.toString()).toBe(largeData)
    })

    it('should handle mixed buffer and string chunks', async () => {
      const stringChunk = 'Hello '
      const bufferChunk = Buffer.from('World!')
      const stream = Readable.from([stringChunk, bufferChunk])

      const buffer = await streamToBuffer(stream)

      expect(buffer.toString()).toBe('Hello World!')
    })
  })
})
