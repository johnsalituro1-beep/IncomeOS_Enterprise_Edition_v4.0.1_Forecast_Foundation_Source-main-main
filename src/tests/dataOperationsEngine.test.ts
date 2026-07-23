import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyProviderHealth, isOperationStale, retryDelayMs, scheduleRetry, type OperationRun } from '../src/features/operations/dataOperationsEngine.ts'

const run = (overrides: Partial<OperationRun> = {}): OperationRun => ({ id:'1', kind:'market-data', status:'failed', attempt:1, startedAt:'2026-07-21T12:00:00.000Z', completedAt:'2026-07-21T12:01:00.000Z', nextRetryAt:null, providerId:'test', requested:2, accepted:0, rejected:2, message:'failed', ...overrides })

test('retry delays use bounded exponential backoff', () => {
  assert.equal(retryDelayMs(1), 30_000)
  assert.equal(retryDelayMs(2), 60_000)
  assert.equal(retryDelayMs(10), 900_000)
})

test('failed operations schedule retry while attempts remain', () => {
  const next = scheduleRetry(run(), new Date('2026-07-21T12:02:00.000Z'))
  assert.equal(next.nextRetryAt, '2026-07-21T12:02:30.000Z')
  assert.equal(scheduleRetry(run({attempt:4})).nextRetryAt, null)
})

test('provider health degrades and fails based on recent runs', () => {
  const now = new Date('2026-07-21T13:00:00.000Z')
  assert.equal(classifyProviderHealth([run({status:'succeeded'})], now), 'healthy')
  assert.equal(classifyProviderHealth([run({status:'degraded'})], now), 'degraded')
  assert.equal(classifyProviderHealth([run(), run({id:'2',startedAt:'2026-07-21T11:00:00.000Z'})], now), 'down')
})

test('freshness policy differentiates market data and distributions', () => {
  const now = new Date('2026-07-21T12:00:00.000Z')
  assert.equal(isOperationStale('market-data','2026-07-20T10:00:00.000Z',now), true)
  assert.equal(isOperationStale('distributions','2026-07-20T10:00:00.000Z',now), false)
})
