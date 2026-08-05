import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  nowNs,
  durationNs,
  durationMs,
  measureSync,
  measureAsync,
  measureAndLog,
  measureSyncAndLog,
  toEventReason,
  logEcsEvent
} from './performance-logger.js'

const ONE_MS_IN_NS = 1_000_000
const HALF_MS_IN_NS = 500_000
const ZERO_NS = 0
const ANSWER_RESULT = 42
const ARRAY_SECOND_VALUE = 2
const ARRAY_THIRD_VALUE = 3
const ASYNC_DELAY_MS = 5
const EXPLICIT_DURATION_NS = 12_345
const SYNC_LOG_RESULT = 99
const STATIC_REASON = 'static reason'

function defineNowNsTests() {
  describe('nowNs', () => {
    it('returns a BigInt', () => {
      expect(typeof nowNs()).toBe('bigint')
    })

    it('returns an increasing value on successive calls', () => {
      const first = nowNs()
      const second = nowNs()
      expect(second).toBeGreaterThan(first)
    })
  })
}

function defineDurationNsTests() {
  describe('durationNs', () => {
    it('returns a non-negative number', () => {
      const start = nowNs()
      const result = durationNs(start)

      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThanOrEqual(0)
    })

    it('returns a larger duration for an earlier start time', () => {
      const past = process.hrtime.bigint() - 1_000_000n
      expect(durationNs(past)).toBeGreaterThanOrEqual(ONE_MS_IN_NS)
    })
  })
}

function defineDurationMsTests() {
  describe('durationMs', () => {
    it('converts nanoseconds to milliseconds', () => {
      expect(durationMs(ONE_MS_IN_NS)).toBe(1)
      expect(durationMs(HALF_MS_IN_NS)).toBe(0.5)
      expect(durationMs(ZERO_NS)).toBe(0)
    })
  })
}

function defineMeasureSyncTests() {
  describe('measureSync', () => {
    it('returns the result of the work function', () => {
      const { result } = measureSync(() => ANSWER_RESULT)
      expect(result).toBe(ANSWER_RESULT)
    })

    it('returns a non-negative durationNs', () => {
      const { durationNs: duration } = measureSync(() => 'value')
      expect(typeof duration).toBe('number')
      expect(duration).toBeGreaterThanOrEqual(0)
    })

    it('passes through complex return values', () => {
      const obj = { a: 1, b: [ARRAY_SECOND_VALUE, ARRAY_THIRD_VALUE] }
      const { result } = measureSync(() => obj)
      expect(result).toBe(obj)
    })
  })
}

function defineMeasureAsyncTests() {
  describe('measureAsync', () => {
    it('returns the resolved result of the async work function', async () => {
      const { result } = await measureAsync(async () => 'hello')
      expect(result).toBe('hello')
    })

    it('returns a non-negative durationNs', async () => {
      const { durationNs: duration } = await measureAsync(async () => null)
      expect(typeof duration).toBe('number')
      expect(duration).toBeGreaterThanOrEqual(0)
    })

    it('awaits the work before capturing duration', async () => {
      const { result } = await measureAsync(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve('done'), ASYNC_DELAY_MS)
          })
      )
      expect(result).toBe('done')
    })
  })
}

function defineToEventReasonTests() {
  describe('toEventReason', () => {
    it('returns JSON string for a given object', () => {
      expect(toEventReason({ a: 1 })).toBe('{"a":1}')
    })

    it.each([
      ['null', null],
      ['undefined', undefined],
      ['empty string', ''],
      ['0', 0]
    ])('returns undefined for %s', (_description, value) => {
      expect(toEventReason(value)).toBeUndefined()
    })
  })
}

function defineLogEcsEventLevelTests(getLogger) {
  it('logs at info level by default', () => {
    logEcsEvent(getLogger(), { message: 'test event', action: 'test' })
    expect(getLogger().info).toHaveBeenCalledOnce()
  })

  it('logs at the specified level', () => {
    logEcsEvent(getLogger(), {
      message: 'an error',
      level: 'error',
      action: 'test'
    })
    expect(getLogger().error).toHaveBeenCalledOnce()
    expect(getLogger().info).not.toHaveBeenCalled()
  })

  it('falls back to info if level method does not exist', () => {
    logEcsEvent(getLogger(), {
      message: 'msg',
      level: 'nonexistent',
      action: 'test'
    })
    expect(getLogger().info).toHaveBeenCalledOnce()
  })
}

function defineLogEcsEventFieldTests(getLogger) {
  it('includes action in the event object', () => {
    logEcsEvent(getLogger(), { message: 'msg', action: 'my_action' })
    expect(getLogger().info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: expect.objectContaining({ action: 'my_action' })
      }),
      'msg'
    )
  })

  it.each([
    ['outcome', { outcome: 'success' }, 'success'],
    ['duration', { duration: EXPLICIT_DURATION_NS }, EXPLICIT_DURATION_NS],
    ['reason', { reason: 'something went wrong' }, 'something went wrong']
  ])(
    'includes %s when provided',
    (_description, extraOptions, expectedValue) => {
      logEcsEvent(getLogger(), {
        message: 'msg',
        action: 'act',
        ...extraOptions
      })
      const [eventArg, messageArg] = getLogger().info.mock.calls[0]
      expect(messageArg).toBe('msg')
      expect(eventArg.event).toMatchObject(extraOptions)
      expect(Object.values(extraOptions)).toContain(expectedValue)
    }
  )

  it.each(['outcome', 'duration', 'reason'])(
    'omits %s when not provided',
    (propertyName) => {
      logEcsEvent(getLogger(), { message: 'msg', action: 'act' })
      const [eventArg] = getLogger().info.mock.calls[0]
      expect(eventArg.event).not.toHaveProperty(propertyName)
    }
  )

  it('uses the default category of application', () => {
    logEcsEvent(getLogger(), { message: 'msg', action: 'act' })
    const [eventArg] = getLogger().info.mock.calls[0]
    expect(eventArg.event.category).toBe('application')
  })
}

function defineLogEcsEventTests() {
  describe('logEcsEvent', () => {
    let mockLogger

    beforeEach(() => {
      mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    })

    const getLogger = () => mockLogger

    defineLogEcsEventLevelTests(getLogger)
    defineLogEcsEventFieldTests(getLogger)
  })
}

function defineMeasureAndLogTests() {
  describe('measureAndLog', () => {
    let mockLogger

    beforeEach(() => {
      mockLogger = { info: vi.fn(), error: vi.fn() }
    })

    it('returns the result of the async work function', async () => {
      const { result } = await measureAndLog(mockLogger, async () => 'value', {
        message: 'done',
        action: 'test'
      })
      expect(result).toBe('value')
    })

    it('returns durationNs as a number', async () => {
      const { durationNs: duration } = await measureAndLog(
        mockLogger,
        async () => null,
        { message: 'done', action: 'test' }
      )
      expect(typeof duration).toBe('number')
      expect(duration).toBeGreaterThanOrEqual(0)
    })

    it('calls logEcsEvent with the event options and measured duration', async () => {
      await measureAndLog(mockLogger, async () => 'x', {
        message: 'completed',
        action: 'my_action',
        outcome: 'success'
      })
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          event: expect.objectContaining({
            action: 'my_action',
            outcome: 'success'
          })
        }),
        'completed'
      )
    })

    it('resolves reason when provided as a function', async () => {
      await measureAndLog(mockLogger, async () => null, {
        message: 'done',
        action: 'act',
        reason: (duration) => `took ${duration}ns`
      })
      const [eventArg] = mockLogger.info.mock.calls[0]
      expect(eventArg.event.reason).toMatch(/^took \d+ns$/)
    })

    it('uses reason directly when provided as a string', async () => {
      await measureAndLog(mockLogger, async () => null, {
        message: 'done',
        action: 'act',
        reason: STATIC_REASON
      })
      const [eventArg] = mockLogger.info.mock.calls[0]
      expect(eventArg.event.reason).toBe(STATIC_REASON)
    })
  })
}

function defineMeasureSyncAndLogTests() {
  describe('measureSyncAndLog', () => {
    let mockLogger

    beforeEach(() => {
      mockLogger = { info: vi.fn(), error: vi.fn() }
    })

    it('returns the result of the sync work function', () => {
      const { result } = measureSyncAndLog(mockLogger, () => SYNC_LOG_RESULT, {
        message: 'done',
        action: 'test'
      })
      expect(result).toBe(SYNC_LOG_RESULT)
    })

    it('returns durationNs as a number', () => {
      const { durationNs: duration } = measureSyncAndLog(
        mockLogger,
        () => null,
        { message: 'done', action: 'test' }
      )
      expect(typeof duration).toBe('number')
      expect(duration).toBeGreaterThanOrEqual(0)
    })

    it('calls logEcsEvent with the event options and measured duration', () => {
      measureSyncAndLog(mockLogger, () => 'x', {
        message: 'completed',
        action: 'sync_action',
        outcome: 'success'
      })
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          event: expect.objectContaining({
            action: 'sync_action',
            outcome: 'success'
          })
        }),
        'completed'
      )
    })

    it('resolves reason when provided as a function', () => {
      measureSyncAndLog(mockLogger, () => null, {
        message: 'done',
        action: 'act',
        reason: (duration) => `took ${duration}ns`
      })
      const [eventArg] = mockLogger.info.mock.calls[0]
      expect(eventArg.event.reason).toMatch(/^took \d+ns$/)
    })

    it('uses reason directly when provided as a string', () => {
      measureSyncAndLog(mockLogger, () => null, {
        message: 'done',
        action: 'act',
        reason: STATIC_REASON
      })
      const [eventArg] = mockLogger.info.mock.calls[0]
      expect(eventArg.event.reason).toBe(STATIC_REASON)
    })
  })
}

describe('performance-logger', () => {
  defineNowNsTests()
  defineDurationNsTests()
  defineDurationMsTests()
  defineMeasureSyncTests()
  defineMeasureAsyncTests()
  defineToEventReasonTests()
  defineLogEcsEventTests()
  defineMeasureAndLogTests()
  defineMeasureSyncAndLogTests()
})
