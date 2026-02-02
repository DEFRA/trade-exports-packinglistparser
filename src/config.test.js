import { describe, it, expect, afterEach, vi } from 'vitest'

describe('Config module', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    // restore environment and reset loaded modules between tests
    process.env = { ...originalEnv }
    vi.resetModules()
  })

  it('exports a config object with expected default values', async () => {
    // Ensure a clean import
    vi.resetModules()
    const { config } = await import('./config.js')

    // basic keys
    expect(typeof config.get).toBe('function')
    expect(config.get('serviceName')).toBe('trade-exports-packinglistparser')

    // packing list default
    expect(config.get('packingList.schemaVersion')).toBe('v0.0')

    // aws defaults
    expect(config.get('aws.s3Bucket')).toBe('')
    expect(config.get('aws.region')).toBe('eu-west-2')
  })

  it('picks up overrides from environment variables', async () => {
    vi.resetModules()

    process.env.PACKING_LIST_SCHEMA_VERSION = 'v2-test'
    process.env.INELIGIBLE_ITEMS_S3_BUCKET = 'my-test-bucket'

    const { config } = await import('./config.js')

    expect(config.get('packingList.schemaVersion')).toBe('v2-test')
    expect(config.get('aws.s3Bucket')).toBe('my-test-bucket')
  })

  it('uses production defaults when NODE_ENV=production', async () => {
    vi.resetModules()
    process.env.NODE_ENV = 'production'

    const { config } = await import('./config.js')

    // In production the default log.format should be 'ecs'
    expect(config.get('log.format')).toBe('ecs')

    // In production redact should be the production redact list
    expect(config.get('log.redact')).toEqual([
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers'
    ])
  })

  it('uses test defaults when NODE_ENV=test', async () => {
    vi.resetModules()
    process.env.NODE_ENV = 'test'

    const { config } = await import('./config.js')

    // In test, log.isEnabled default should be false
    expect(config.get('log.isEnabled')).toBe(false)

    // In test (not production) log.format should be 'pino-pretty'
    expect(config.get('log.format')).toBe('pino-pretty')
  })
})
