import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateLedgerState, calculatePortfolioPositions, availableShares } from '../src/features/portfolio/positionEngine.ts'
import type { Holding } from '../src/features/portfolio/PortfolioContext.tsx'
import type { PortfolioTransaction } from '../src/features/portfolio/transactionEngine.ts'

const holding: Holding = {
  id: 'h1', ticker: 'TEST', fundName: 'Test ETF', shares: 99, averageCost: 99,
  currentPrice: 14, annualDistributionPerShare: 1, paymentFrequency: 'Monthly', category: 'Other',
}
const transactions: PortfolioTransaction[] = [
  { id: '1', ticker: 'TEST', type: 'buy', tradeDate: '2026-01-01', shares: 10, price: 10, fees: 1, notes: '' },
  { id: '2', ticker: 'TEST', type: 'buy', tradeDate: '2026-01-02', shares: 10, price: 20, fees: 1, notes: '' },
  { id: '3', ticker: 'TEST', type: 'sell', tradeDate: '2026-01-03', shares: 5, price: 18, fees: 1, notes: '' },
  { id: '4', ticker: 'TEST', type: 'dividend', tradeDate: '2026-01-04', shares: 15, price: 0.25, fees: 0, notes: '' },
]

test('weighted-average ledger derives shares, basis, and realized gain', () => {
  const state = calculateLedgerState(transactions).get('TEST')!
  assert.equal(state.shares, 15)
  assert.equal(state.costBasis, 226.5)
  assert.equal(state.realizedGain, 13.5)
  assert.equal(state.incomeReceived, 3.75)
})

test('portfolio calculation uses ledger instead of manual shares when trades exist', () => {
  const result = calculatePortfolioPositions([holding], transactions)
  const position = result.positions[0]
  assert.equal(position.source, 'ledger')
  assert.equal(position.shares, 15)
  assert.equal(position.averageCost, 15.1)
  assert.equal(position.marketValue, 210)
  assert.equal(position.unrealizedGain, -16.5)
  assert.equal(position.totalReturn, 0.75)
  assert.equal(result.ledgerCoveragePct, 100)
})

test('manual opening balance remains when no trades exist', () => {
  const result = calculatePortfolioPositions([holding], [])
  assert.equal(result.positions[0].source, 'manual')
  assert.equal(result.positions[0].shares, 99)
  assert.equal(availableShares('TEST', [holding], []), 99)
})

test('oversold ledger is bounded at zero and emits a warning', () => {
  const oversell: PortfolioTransaction[] = [
    { id: '1', ticker: 'TEST', type: 'buy', tradeDate: '2026-01-01', shares: 2, price: 10, fees: 0, notes: '' },
    { id: '2', ticker: 'TEST', type: 'sell', tradeDate: '2026-01-02', shares: 3, price: 12, fees: 0, notes: '' },
  ]
  const state = calculateLedgerState(oversell).get('TEST')!
  assert.equal(state.shares, 0)
  assert.equal(state.warnings.length, 1)
})
