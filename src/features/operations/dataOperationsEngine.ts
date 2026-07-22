export type OperationKind = 'market-data' | 'distributions'
export type OperationStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'degraded'
export type ProviderHealth = 'healthy' | 'degraded' | 'down' | 'unknown'

export type OperationRun = {
  id: string
  kind: OperationKind
  status: OperationStatus
  attempt: number
  startedAt: string
  completedAt: string | null
  nextRetryAt: string | null
  providerId: string
  requested: number
  accepted: number
  rejected: number
  message: string
}

export type RetryPolicy = { maxAttempts: number; baseDelayMs: number; maxDelayMs: number }
export const defaultRetryPolicy: RetryPolicy = { maxAttempts: 4, baseDelayMs: 30_000, maxDelayMs: 15 * 60_000 }

export function retryDelayMs(attempt: number, policy = defaultRetryPolicy) {
  const exponent = Math.max(0, attempt - 1)
  return Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** exponent)
}

export function shouldRetry(run: Pick<OperationRun, 'status' | 'attempt'>, policy = defaultRetryPolicy) {
  return (run.status === 'failed' || run.status === 'degraded') && run.attempt < policy.maxAttempts
}

export function scheduleRetry(run: OperationRun, now = new Date(), policy = defaultRetryPolicy): OperationRun {
  if (!shouldRetry(run, policy)) return { ...run, nextRetryAt: null }
  return { ...run, nextRetryAt: new Date(now.getTime() + retryDelayMs(run.attempt, policy)).toISOString() }
}

export function classifyProviderHealth(runs: OperationRun[], now = new Date()): ProviderHealth {
  const recent = [...runs].sort((a,b)=>b.startedAt.localeCompare(a.startedAt)).slice(0, 5)
  if (!recent.length) return 'unknown'
  const latest = recent[0]
  const ageHours = (now.getTime() - new Date(latest.startedAt).getTime()) / 3_600_000
  if (ageHours > 48) return 'down'
  const failures = recent.filter(r=>r.status === 'failed').length
  if (latest.status === 'failed' && failures >= 2) return 'down'
  if (latest.status === 'degraded' || failures > 0) return 'degraded'
  return latest.status === 'succeeded' ? 'healthy' : 'unknown'
}

export type FreshnessPolicy = { marketDataHours: number; distributionsHours: number }
export const defaultFreshnessPolicy: FreshnessPolicy = { marketDataHours: 24, distributionsHours: 72 }

export function isOperationStale(kind: OperationKind, completedAt: string | null, now = new Date(), policy = defaultFreshnessPolicy) {
  if (!completedAt) return true
  const hours = (now.getTime() - new Date(completedAt).getTime()) / 3_600_000
  return hours > (kind === 'market-data' ? policy.marketDataHours : policy.distributionsHours)
}

export function createRun(kind: OperationKind, providerId: string, requested: number, attempt = 1): OperationRun {
  return { id: crypto.randomUUID(), kind, status: 'running', attempt, startedAt: new Date().toISOString(), completedAt: null, nextRetryAt: null, providerId, requested, accepted: 0, rejected: 0, message: 'Operation started.' }
}

export function finishRun(run: OperationRun, result: { accepted: number; rejected?: number; fallbackUsed?: boolean; message?: string }): OperationRun {
  const rejected = result.rejected ?? 0
  const status: OperationStatus = result.fallbackUsed || rejected > 0 ? 'degraded' : 'succeeded'
  return scheduleRetry({ ...run, status, completedAt: new Date().toISOString(), accepted: result.accepted, rejected, message: result.message ?? (status === 'succeeded' ? 'Operation completed.' : 'Operation completed with warnings.') })
}

export function failRun(run: OperationRun, error: unknown): OperationRun {
  return scheduleRetry({ ...run, status: 'failed', completedAt: new Date().toISOString(), message: error instanceof Error ? error.message : 'Operation failed.' })
}
