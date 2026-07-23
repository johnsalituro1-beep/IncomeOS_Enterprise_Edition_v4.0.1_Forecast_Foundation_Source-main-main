import type { Holding } from '../../types/portfolio'

export type MissionPriority = {
  id: string
  title: string
  detail: string
  severity: 'info' | 'watch' | 'critical'
  action: string
  impact: string
}

export type MissionWidget = {
  id: string
  title: string
  enabled: boolean
  rank: number
}

export type IncomePulse = {
  label: string
  amount: number
  target: number
}

export type MissionSnapshot = {
  weeklyIncome: number
  monthlyIncome: number
  annualIncome: number
  portfolioValue: number
  projectedYearOneIncome: number
  incomeCoverage: number
  concentration: number
  largestHolding: string
  largestIncomeSource: string
  priorities: MissionPriority[]
  pulse: IncomePulse[]
}

const categoryRisk: Record<string, number> = {
  'Covered Call': 72,
  'Crypto Income': 88,
  'Equity Income': 42,
}

export function buildMissionSnapshot(holdings: Holding[], weeklyGoal: number): MissionSnapshot {
  const portfolioValue = holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0)
  const annualIncome = holdings.reduce((sum, h) => sum + h.shares * h.annualDistributionPerShare, 0)
  const weeklyIncome = annualIncome / 52
  const monthlyIncome = annualIncome / 12
  const weights = holdings.map((h) => ({
    ticker: h.ticker,
    weight: portfolioValue ? (h.shares * h.currentPrice) / portfolioValue : 0,
    income: h.shares * h.annualDistributionPerShare,
    risk: categoryRisk[h.category] ?? 55,
  }))
  const largest = [...weights].sort((a, b) => b.weight - a.weight)[0]
  const largestIncome = [...weights].sort((a, b) => b.income - a.income)[0]
  const concentration = largest?.weight ?? 0
  const coveredCallWeight = holdings
    .filter((h) => h.category === 'Covered Call')
    .reduce((sum, h) => sum + h.shares * h.currentPrice, 0) / Math.max(1, portfolioValue)
  const cryptoWeight = holdings
    .filter((h) => h.category === 'Crypto Income')
    .reduce((sum, h) => sum + h.shares * h.currentPrice, 0) / Math.max(1, portfolioValue)
  const weightedRisk = weights.reduce((sum, h) => sum + h.weight * h.risk, 0)
  const priorities: MissionPriority[] = []

  if (weeklyIncome < weeklyGoal) priorities.push({
    id: 'goal-gap',
    title: 'Weekly income is below mission target',
    detail: `Current modeled income is $${weeklyIncome.toFixed(0)} per week versus a $${weeklyGoal.toFixed(0)} target.`,
    severity: weeklyIncome < weeklyGoal * 0.7 ? 'critical' : 'watch',
    action: 'Open Strategy Builder',
    impact: `$${Math.max(0, weeklyGoal - weeklyIncome).toFixed(0)}/week gap`,
  })
  if (concentration > 0.28) priorities.push({
    id: 'concentration',
    title: `${largest.ticker} concentration requires review`,
    detail: `${largest.ticker} represents ${(concentration * 100).toFixed(1)}% of modeled portfolio value.`,
    severity: concentration > 0.38 ? 'critical' : 'watch',
    action: 'Run Optimization Lab',
    impact: 'Diversification risk',
  })
  if (coveredCallWeight > 0.45) priorities.push({
    id: 'covered-call',
    title: 'Covered-call exposure may constrain growth',
    detail: `${(coveredCallWeight * 100).toFixed(1)}% of portfolio value is assigned to covered-call strategies.`,
    severity: coveredCallWeight > 0.65 ? 'critical' : 'watch',
    action: 'Compare growth alternatives',
    impact: 'Growth trade-off',
  })
  if (cryptoWeight > 0.2) priorities.push({
    id: 'crypto',
    title: 'Crypto-income allocation is elevated',
    detail: `${(cryptoWeight * 100).toFixed(1)}% of modeled portfolio value is in crypto-income exposure.`,
    severity: cryptoWeight > 0.3 ? 'critical' : 'watch',
    action: 'Stress-test Digital Twin',
    impact: 'Volatility sensitivity',
  })
  if (weightedRisk < 55 && weeklyIncome >= weeklyGoal) priorities.push({
    id: 'steady-state',
    title: 'Portfolio is operating near mission parameters',
    detail: 'Modeled income coverage and risk are currently within the configured operating range.',
    severity: 'info',
    action: 'Review upcoming payments',
    impact: 'No immediate action',
  })

  const target = weeklyGoal
  const pulse = Array.from({ length: 12 }, (_, index) => {
    const seasonal = [0.93, 1.04, 0.98, 1.08, 0.95, 1.02, 1.1, 0.96, 1.05, 1.01, 0.97, 1.12][index]
    return { label: `W${index + 1}`, amount: weeklyIncome * seasonal, target }
  })

  return {
    weeklyIncome,
    monthlyIncome,
    annualIncome,
    portfolioValue,
    projectedYearOneIncome: annualIncome * 1.035,
    incomeCoverage: target ? weeklyIncome / target : 0,
    concentration,
    largestHolding: largest?.ticker ?? '—',
    largestIncomeSource: largestIncome?.ticker ?? '—',
    priorities,
    pulse,
  }
}

export const defaultMissionWidgets: MissionWidget[] = [
  { id: 'income-pulse', title: 'Income Pulse', enabled: true, rank: 1 },
  { id: 'priorities', title: 'Priority Queue', enabled: true, rank: 2 },
  { id: 'calendar', title: 'Cash Calendar', enabled: true, rank: 3 },
  { id: 'score', title: 'Income OS Score', enabled: true, rank: 4 },
  { id: 'digital-twin', title: 'Digital Twin Snapshot', enabled: true, rank: 5 },
  { id: 'watchlist', title: 'Research Watchlist', enabled: true, rank: 6 },
]
