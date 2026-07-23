import test from 'node:test'
import assert from 'node:assert/strict'
import { applyQuotesToHoldings, classifyFreshness, normalizeQuote } from '../src/features/market-data/marketDataEngine.ts'

test('classifies quote freshness', () => {
  const now = new Date('2026-07-21T12:00:00Z')
  assert.equal(classifyFreshness('2026-07-21T00:00:00Z', now), 'fresh')
  assert.equal(classifyFreshness('2026-07-19T12:00:00Z', now), 'aging')
  assert.equal(classifyFreshness('2026-07-17T12:00:00Z', now), 'stale')
})

test('normalizes and applies valid quotes', () => {
  const quote = normalizeQuote({ providerId:'p', kind:'quote', symbol:'edgq', retrievedAt:'2026-07-21T12:00:00Z', effectiveAt:'2026-07-21T12:00:00Z', classification:'provider', confidence:1, payload:{symbol:'EDGQ',price:30,previousClose:29,currency:'USD',marketTime:'2026-07-21T12:00:00Z'} })
  const holdings:any[] = [{id:'1',ticker:'EDGQ',currentPrice:20}]
  assert.equal(applyQuotesToHoldings(holdings,[quote])[0].currentPrice,30)
})

test('rejects non-positive quotes', () => {
  assert.throws(() => normalizeQuote({ providerId:'p', kind:'quote', symbol:'BAD', retrievedAt:'2026-07-21T12:00:00Z', effectiveAt:'2026-07-21T12:00:00Z', classification:'provider', confidence:1, payload:{symbol:'BAD',price:0,previousClose:null,currency:'USD',marketTime:'2026-07-21T12:00:00Z'} }))
})
