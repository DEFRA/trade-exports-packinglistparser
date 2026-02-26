const NS_PER_MS = 1_000_000n

function nowNs() {
  return process.hrtime.bigint()
}

function durationNs(startNs) {
  return Number(nowNs() - startNs)
}

function durationMs(ns) {
  return ns / Number(NS_PER_MS)
}

function measureSync(work) {
  const startNs = nowNs()
  const result = work()
  return { result, durationNs: durationNs(startNs) }
}

async function measureAsync(work) {
  const startNs = nowNs()
  const result = await work()
  return { result, durationNs: durationNs(startNs) }
}

async function measureAndLog(logger, work, eventOptions) {
  const { result, durationNs: duration } = await measureAsync(work)
  const reason =
    typeof eventOptions.reason === 'function'
      ? eventOptions.reason(duration)
      : eventOptions.reason
  logEcsEvent(logger, { ...eventOptions, duration, reason })
  return { result, durationNs: duration }
}

function measureSyncAndLog(logger, work, eventOptions) {
  const { result, durationNs: duration } = measureSync(work)
  const reason =
    typeof eventOptions.reason === 'function'
      ? eventOptions.reason(duration)
      : eventOptions.reason
  logEcsEvent(logger, { ...eventOptions, duration, reason })
  return { result, durationNs: duration }
}

function toEventReason(data) {
  return data ? JSON.stringify(data) : undefined
}

function logEcsEvent(
  logger,
  {
    message,
    level = 'info',
    category = 'application',
    type,
    action,
    outcome,
    duration,
    reason
  }
) {
  const logMethod = typeof logger[level] === 'function' ? level : 'info'

  logger[logMethod](
    {
      event: {
        category,
        type,
        action,
        ...(outcome ? { outcome } : {}),
        ...(duration !== undefined ? { duration } : {}),
        ...(reason ? { reason } : {})
      }
    },
    message
  )
}

export {
  nowNs,
  durationNs,
  durationMs,
  measureSync,
  measureAsync,
  measureAndLog,
  measureSyncAndLog,
  toEventReason,
  logEcsEvent
}
