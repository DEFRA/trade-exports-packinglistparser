import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { convertCsvToJson } from './csv-utility.js'

describe('csv-utility', () => {
  it('should parse CSV from Buffer', async () => {
    const buf = Buffer.from('h1,h2\n1,2\n3,4')
    const res = await convertCsvToJson(buf)
    expect(res).toEqual([
      ['h1', 'h2'],
      ['1', '2'],
      ['3', '4']
    ])
  })

  it('should parse CSV from Readable stream', async () => {
    const buf = Buffer.from('a,b,c\n5,6,7')
    const stream = Readable.from([buf])
    const res = await convertCsvToJson(stream)
    expect(res).toEqual([
      ['a', 'b', 'c'],
      ['5', '6', '7']
    ])
  })

  it('should parse CSV from filename', async () => {
    const tmpDir = path.join(process.cwd(), 'test-output')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
    const tmpFile = path.join(tmpDir, 'tmp-csv-utility.csv')
    fs.writeFileSync(tmpFile, 'x,y\n8,9')

    const res = await convertCsvToJson(tmpFile)
    expect(res).toEqual([
      ['x', 'y'],
      ['8', '9']
    ])

    // cleanup
    try {
      fs.unlinkSync(tmpFile)
    } catch (e) {
      // ignore cleanup errors
    }
  })
})
