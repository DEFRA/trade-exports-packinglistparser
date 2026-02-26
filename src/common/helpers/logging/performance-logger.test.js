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

describe('performance-logger', () => {
  describe('nowNs', () => {
    it('returns a BigInt', () => {
      expect(typeof nowNs()).toBe('bigint')
    })

    it('returns an increasing value on successive calls', () => {
      const t1 = nowNs()
      const t2 = nowNs()
      expect(t2).toBeGreaterThan(t1)
    })
  })

  describe('durationNs', () => {
    it('returns a non-negative number', () => {
      const start = nowNs()
      const result = durationNs(start)
      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThanOrEqual(0)
    })

    it('returns a larger duration for an earlier start time', () => {
      const past = process.hrtime.bigint() - 1_000_000n // 1ms ago
      expect(durationNs(past)).toBeGreaterThanOrEqual(1_000_000)
    })
  })

  describe('durationMs', () => {
    it('converts nanoseconds to milliseconds', () => {
      expect(durationMs(1_000_000)).toBe(1)
      expect(durationMs(500_000)).toBe(0.5)
      expect(durationMs(0)).toBe(0)
    })
  })

  describe('measureSync', () => {
    it('returns the result of the work function', () => {
      const { result } = measureSync(() => 42)
      expect(result).toBe(42)
    })

    it('returns a non-negative durationNs', () => {
      const { durationNs: duration } = measureSync(() => 'value')
      expect(typeof duration).toBe('number')
      expect(duration).toBeGreaterThanOrEqual(0)
    })

    it('passes through complex return values', () => {
      const obj = { a: 1, b: [2, 3] }
      const { result } = measureSync(() => obj)
      expect(result).toBe(obj)
    })
  })

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
        () => new Promise((resolve) => setTimeout(() => resolve('done'), 5))
      )
      expect(result).toBe('done')
    })
  })

  describe('toEventReason', () => {
    it('returns JSON string for a given object', () => {
      expect(toEventReason({ a: 1 })).toBe('{"a":1}')
    })

    it('returns undefined for null', () => {
      expect(toEventReason(null)).toBeUndefined()
    })

    it('returns undefined for undefined', () => {
      expect(toEventReason(undefined)).toBeUndefined()
    })

    it('returns undefined for empty string', () => {
      expect(toEventReason('')).toBeUndefined()
    })

    it('returns undefined for 0', () => {
      expect(toEventReason(0)).toBeUndefined()
    })
  })

  describe('logEcsEvent', () => {
    let mockLogger

    beforeEach(() => {
      mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    })

    it('logs at info level by default', () => {
      logEcsEvent(mockLogger, { message: 'test event', action: 'test' })
      expect(mockLogger.info).toHaveBeenCalledOnce()
    })

    it('logs at the specified level', () => {
      logEcsEvent(mockLogger, {
        message: 'an error',
        level: 'error',
        action: 'test'
      })
      expect(mockLogger.error).toHaveBeenCalledOnce()
      expect(mockLogger.info).not.toHaveBeenCalled()
    })

    it('falls back to info if level method does not exist', () => {
      logEcsEvent(mockLogger, {
        message: 'msg',
        level: 'nonexistent',
        action: 'test'
      })
      expect(mockLogger.info).toHaveBeenCalledOnce()
    })

    it('includes action in the event object', () => {
      logEcsEvent(mockLogger, { message: 'msg', action: 'my_action' })
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          event: expect.objectContaining({ action: 'my_action' })
        }),
        'msg'
      )
    })

    it('includes outcome when provided', () => {
      logEcsEvent(mockLogger, {
        message: 'msg',
        action: 'act',
        outcome: 'success'
      })
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          event: expect.objectContaining({ outcome: 'success' })
        }),
        'msg'
      )
    })

    it('omits outcome when not provided', () => {
      logEcsEvent(mockLogger, { message: 'msg', action: 'act' })
      const [eventArg] = mockLogger.info.mock.calls[0]
      expect(eventArg.event).not.toHaveProperty('outcome')
    })

    it('includes duration when provided', () => {
      logEcsEvent(mockLogger, {
        message: 'msg',
        action: 'act',
        duration: 12345
      })
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          event: expect.objectContaining({ duration: 12345 })
        }),
        'msg'
      )
    })

    it('omits duration when undefined', () => {
      logEcsEvent(mockLogger, { message: 'msg', action: 'act' })
      const [eventArg] = mockLogger.info.mock.calls[0]
      expect(eventArg.event).not.toHaveProperty('duration')
    })

    it('includes reason when provided', () => {
      logEcsEvent(mockLogger, {
        message: 'msg',
        action: 'act',
        reason: 'something went wrong'
      })
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          event: expect.objectContaining({ reason: 'something went wrong' })
        }),
        'msg'
      )
    })

    it('omits reason when not provided', () => {
      logEcsEvent(mockLogger, { message: 'msg', action: 'act' })
      const [eventArg] = mockLogger.info.mock.calls[0]
      expect(eventArg.event).not.toHaveProperty('reason')
    })

    it('uses the default category of application', () => {
      logEcsEvent(mockLogger, { message: 'msg', action: 'act' })
      const [eventArg] = mockLogger.info.mock.calls[0]
      expect(eventArg.event.category).toBe('application')
    })
  })

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
        reason: (dur) => `took ${dur}ns`
      })
      const [eventArg] = mockLogger.info.mock.calls[0]
      expect(eventArg.event.reason).toMatch(/^took \d+ns$/)
    })

    it('uses reason directly when provided as a string', async () => {
      await measureAndLog(mockLogger, async () => null, {
        message: 'done',
        action: 'act',
        reason: 'static reason'
      })
      const [eventArg] = mockLogger.info.mock.calls[0]
      expect(eventArg.event.reason).toBe('static reason')
    })
  })

  describe('measureSyncAndLog', () => {
    let mockLogger

    beforeEach(() => {
      mockLogger = { info: vi.fn(), error: vi.fn() }
    })

    it('returns the result of the sync work function', () => {
      const { result } = measureSyncAndLog(mockLogger, () => 99, {
        message: 'done',
        action: 'test'
      })
      expect(result).toBe(99)
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
        reason: (dur) => `took ${dur}ns`
      })
      const [eventArg] = mockLogger.info.mock.calls[0]
      expect(eventArg.event.reason).toMatch(/^took \d+ns$/)
    })

    it('uses reason directly when provided as a string', () => {
      measureSyncAndLog(mockLogger, () => null, {
        message: 'done',
        action: 'act',
        reason: 'static reason'
      })
      const [eventArg] = mockLogger.info.mock.calls[0]
      expect(eventArg.event.reason).toBe('static reason')
    })
  })
})
