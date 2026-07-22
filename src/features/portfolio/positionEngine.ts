import type { Holding } from '../../types/portfolio'
import type { PortfolioTransaction } from '../../types/portfolio'

export type PositionSource = 'ledger' | 'manual'

export type CalculatedPosition = Holding & {
  source: PositionSource
  costBasis: number
  marketValue: number
  unrealizedGain: number
  realizedGain: number
  totalReturn: number
  incomeReceived: number
  transactionCount: number
  warnings: string[]
}

export type PortfolioCalculation = {
  positions: CalculatedPosition[]
  costBasis: number
  marketValue: number
  unrealizedGain: number
  realizedGain: number
  totalReturn: number
  incomeReceived: number
  warnings: string[]
  ledgerCoveragePct: number
}

type LotState = {
  shares: number
  costBasis: number
  realizedGain: number
  incomeReceived: number
  transactionCount: number
  warnings: string[]
}

const round = (value: number) => Math.round((value + Number.EPSILON) * 1e8) / 1e8

export function calculateLedgerState(transactions: PortfolioTransaction[]): Map<string, LotState> {
  const states = new Map<string, LotState>()
  const ordered = [...transactions].sort((a, b) => a.tradeDate.localeCompare(b.tradeDate) || a.id.localeCompare(b.id))

  for (const transaction of ordered) {
    const ticker = transaction.ticker?.trim().toUpperCase()
    if (!ticker || !['buy', 'sell', 'dividend'].includes(transaction.type)) continue
    const state = states.get(ticker) ?? { shares: 0, costBasis: 0, realizedGain: 0, incomeReceived: 0, transactionCount: 0, warnings: [] }
    state.transactionCount += 1

    if (transaction.type === 'buy') {
      state.shares = round(state.shares + transaction.shares)
      state.costBasis = round(state.costBasis + transaction.shares * transaction.price + transaction.fees)
    } else if (transaction.type === 'sell') {
      if (transaction.shares > state.shares + 1e-8) {
        state.warnings.push(`${ticker}: sell of ${transaction.shares.toLocaleString()} shares exceeds the ledger balance of ${state.shares.toLocaleString()}.`)
      }
      const soldShares = Math.min(transaction.shares, state.shares)
      const averageCost = state.shares > 0 ? state.costBasis / state.shares : 0
      const removedBasis = soldShares * averageCost
      state.realizedGain = round(state.realizedGain + soldShares * transaction.price - transaction.fees - removedBasis)
      state.shares = round(Math.max(0, state.shares - soldShares))
      state.costBasis = round(Math.max(0, state.costBasis - removedBasis))
    } else {
      const amount = transaction.shares > 0 ? transaction.shares * transaction.price : transaction.price
      state.incomeReceived = round(state.incomeReceived + amount)
    }
    states.set(ticker, state)
  }
  return states
}

export function calculatePortfolioPositions(holdings: Holding[], transactions: PortfolioTransaction[]): PortfolioCalculation {
  const ledger = calculateLedgerState(transactions)
  const holdingByTicker = new Map(holdings.map(holding => [holding.ticker.toUpperCase(), holding]))
  const tickers = new Set([...holdingByTicker.keys(), ...ledger.keys()])
  const warnings: string[] = []
  let ledgerPositions = 0

  const positions = [...tickers].sort().map(ticker => {
    const holding = holdingByTicker.get(ticker)
    const state = ledger.get(ticker)
    const source: PositionSource = state && state.transactionCount > 0 && transactions.some(t => t.ticker?.toUpperCase() === ticker && (t.type === 'buy' || t.type === 'sell')) ? 'ledger' : 'manual'
    if (source === 'ledger') ledgerPositions += 1
    const shares = source === 'ledger' ? state?.shares ?? 0 : holding?.shares ?? 0
    const costBasis = source === 'ledger' ? state?.costBasis ?? 0 : shares * (holding?.averageCost ?? 0)
    const averageCost = shares > 0 ? costBasis / shares : 0
    const currentPrice = holding?.currentPrice ?? 0
    const marketValue = shares * currentPrice
    const unrealizedGain = marketValue - costBasis
    const realizedGain = state?.realizedGain ?? 0
    const incomeReceived = state?.incomeReceived ?? 0
    const positionWarnings = [...(state?.warnings ?? [])]
    if (!holding) positionWarnings.push(`${ticker}: ledger activity has no matching holding metadata or current price.`)
    warnings.push(...positionWarnings)

    return {
      id: holding?.id ?? `ledger-${ticker}`,
      ticker,
      fundName: holding?.fundName ?? `${ticker} security`,
      shares,
      averageCost,
      currentPrice,
      annualDistributionPerShare: holding?.annualDistributionPerShare ?? 0,
      paymentFrequency: holding?.paymentFrequency ?? 'Monthly',
      category: holding?.category ?? 'Other',
      source,
      costBasis,
      marketValue,
      unrealizedGain,
      realizedGain,
      totalReturn: unrealizedGain + realizedGain + incomeReceived,
      incomeReceived,
      transactionCount: state?.transactionCount ?? 0,
      warnings: positionWarnings,
    }
  }).filter(position => position.shares > 0 || position.realizedGain !== 0 || position.incomeReceived !== 0)

  const totals = positions.reduce((result, position) => ({
    costBasis: result.costBasis + position.costBasis,
    marketValue: result.marketValue + position.marketValue,
    unrealizedGain: result.unrealizedGain + position.unrealizedGain,
    realizedGain: result.realizedGain + position.realizedGain,
    incomeReceived: result.incomeReceived + position.incomeReceived,
  }), { costBasis: 0, marketValue: 0, unrealizedGain: 0, realizedGain: 0, incomeReceived: 0 })

  return {
    positions,
    ...totals,
    totalReturn: totals.unrealizedGain + totals.realizedGain + totals.incomeReceived,
    warnings,
    ledgerCoveragePct: positions.length ? ledgerPositions / positions.length * 100 : 0,
  }
}

export function availableShares(ticker: string, holdings: Holding[], transactions: PortfolioTransaction[]) {
  const normalized = ticker.trim().toUpperCase()
  const state = calculateLedgerState(transactions).get(normalized)
  const hasTrades = transactions.some(t => t.ticker?.toUpperCase() === normalized && (t.type === 'buy' || t.type === 'sell'))
  return hasTrades ? state?.shares ?? 0 : holdings.find(h => h.ticker === normalized)?.shares ?? 0
}
