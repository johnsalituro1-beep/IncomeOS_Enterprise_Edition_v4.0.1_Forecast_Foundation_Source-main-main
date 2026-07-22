import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultForecastAssumptions, runForecast, validateForecastInput } from '../src/services/forecast/ForecastEngine.ts'
import { portfolioHoldingsToForecastHoldings } from '../src/services/forecast/portfolioForecastAdapter.ts'
import type { Holding } from '../src/types/portfolio.ts'

const holding: Holding = {
  id: 'h1', ticker: 'TEST', fundName: 'Test Income ETF', shares: 100, averageCost: 20,
  currentPrice: 25, annualDistributionPerShare: 5.2, paymentFrequency: 'Weekly', category: 'Income',
}

test('adapts application holdings into forecast inputs', () => {
  assert.deepEqual(portfolioHoldingsToForecastHoldings([holding]), [{
    ticker: 'TEST', shares: 100, currentPrice: 25, annualDistributionPerShare: 5.2, costBasis: 20,
  }])
})

test('produces a monthly timeline for the configured horizon', () => {
  const result = runForecast(portfolioHoldingsToForecastHoldings([holding]), { ...defaultForecastAssumptions, horizonYears: 2 }, new Date('2026-07-21T00:00:00Z'))
  assert.equal(result.timeline.length, 24)
  assert.equal(result.summary.startingPortfolioValue, 2500)
  assert.equal(result.summary.startingAnnualIncome, 520)
  assert.ok(result.summary.projectedAnnualIncome > 520)
  assert.equal(result.confidence.level, 'High')
})

test('zero reinvestment keeps share growth out of the forecast', () => {
  const result = runForecast(portfolioHoldingsToForecastHoldings([holding]), {
    ...defaultForecastAssumptions,
    reinvestmentRate: 0,
    annualDistributionGrowthRate: 0,
    annualPriceGrowthRate: 0,
    inflationRate: 0,
    horizonYears: 1,
  }, new Date('2026-07-21T00:00:00Z'))
  assert.equal(Math.round(result.summary.projectedAnnualIncome), 520)
  assert.equal(result.summary.totalReinvested, 0)
  assert.equal(Math.round(result.summary.cumulativeDistributions), 520)
})

test('empty portfolios return a safe result with a warning', () => {
  const result = runForecast([], { ...defaultForecastAssumptions, horizonYears: 1 })
  assert.equal(result.summary.projectedAnnualIncome, 0)
  assert.equal(result.confidence.level, 'Low')
  assert.equal(result.warnings.length, 1)
})

test('rejects invalid forecast assumptions', () => {
  assert.throws(() => validateForecastInput([], { ...defaultForecastAssumptions, reinvestmentRate: 101 }), /cannot exceed/)
})
