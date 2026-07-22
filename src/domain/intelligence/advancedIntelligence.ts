import type { Holding } from '../../types/portfolio'
import { calculatePortfolioMetrics } from '../portfolio/calculations'

export type IntelligenceScore = {
  id: 'income-stability' | 'growth-balance' | 'diversification' | 'cash-flow' | 'yield-quality'
  label: string
  score: number
  status: 'strong' | 'watch' | 'risk'
  explanation: string
}

export type IncomeMilestone = {
  weeklyTarget: number
  currentWeeklyIncome: number
  progressPct: number
  annualGap: number
  capitalRequiredAtCurrentYield: number
}

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

export function calculateIntelligenceScores(holdings: Holding[], weeklyGoal: number): IntelligenceScore[] {
  const metrics = calculatePortfolioMetrics(holdings, weeklyGoal)
  const categories = new Set(holdings.map((holding) => holding.category))
  const frequencies = new Set(holdings.map((holding) => holding.paymentFrequency))
  const weeklyWeight = metrics.portfolioValue
    ? holdings.filter((holding) => holding.paymentFrequency === 'Weekly').reduce((sum, holding) => sum + holding.shares * holding.currentPrice, 0) / metrics.portfolioValue * 100
    : 0

  const scores: IntelligenceScore[] = [
    {
      id: 'income-stability',
      label: 'Income Stability',
      score: clamp(100 - Math.max(0, metrics.largestIncomeWeight - 20) * 1.7 - Math.max(0, metrics.yieldPct - 14) * 2),
      status: 'strong',
      explanation: 'Measures reliance on a single income source and the risk implied by an unusually high forward yield.',
    },
    {
      id: 'growth-balance',
      label: 'Growth Balance',
      score: clamp(100 - Math.max(0, metrics.coveredCallWeight - 35) * 1.25),
      status: 'strong',
      explanation: 'Estimates whether option-income exposure may be crowding out long-term upside participation.',
    },
    {
      id: 'diversification',
      label: 'Diversification',
      score: clamp(categories.size * 14 + holdings.length * 5 - Math.max(0, metrics.largestHoldingWeight - 25) * 1.8),
      status: 'strong',
      explanation: 'Combines number of holdings, strategy variety and position concentration.',
    },
    {
      id: 'cash-flow',
      label: 'Cash-Flow Consistency',
      score: clamp(45 + frequencies.size * 12 + weeklyWeight * 0.35),
      status: 'strong',
      explanation: 'Rewards a portfolio with frequent distributions and multiple payment cadences.',
    },
    {
      id: 'yield-quality',
      label: 'Yield Quality',
      score: clamp(100 - Math.max(0, metrics.yieldPct - 10) * 3.5),
      status: 'strong',
      explanation: 'Flags the additional monitoring required as forward yield rises above conventional income levels.',
    },
  ]

  return scores.map((score) => ({
    ...score,
    status: score.score >= 75 ? 'strong' : score.score >= 55 ? 'watch' : 'risk',
  }))
}

export function calculateIncomeMilestone(holdings: Holding[], weeklyGoal: number): IncomeMilestone {
  const metrics = calculatePortfolioMetrics(holdings, weeklyGoal)
  const annualTarget = weeklyGoal * 52
  const annualGap = Math.max(0, annualTarget - metrics.annualIncome)
  const yieldRate = metrics.yieldPct > 0 ? metrics.yieldPct / 100 : 0
  return {
    weeklyTarget: weeklyGoal,
    currentWeeklyIncome: metrics.weeklyIncome,
    progressPct: Math.min(100, metrics.goalProgress),
    annualGap,
    capitalRequiredAtCurrentYield: yieldRate > 0 ? annualGap / yieldRate : 0,
  }
}
