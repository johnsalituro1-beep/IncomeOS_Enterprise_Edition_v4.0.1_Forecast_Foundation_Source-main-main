import type { Holding } from '../../types/portfolio'
import { calculatePortfolioMetrics } from '../../domain/portfolio/calculations'

export type InsightSeverity = 'positive' | 'neutral' | 'warning' | 'critical'

export type IncomeInsight = {
  id: string
  title: string
  message: string
  severity: InsightSeverity
  metric?: string
  actionLabel?: string
  actionPath?: string
}

const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function generateIncomeInsights(holdings: Holding[], weeklyGoal: number): IncomeInsight[] {
  if (holdings.length === 0) {
    return [{
      id: 'empty-portfolio',
      title: 'Build your income system',
      message: 'Add your first holding to calculate income, concentration, and goal progress.',
      severity: 'neutral',
      actionLabel: 'Add holding',
      actionPath: '/portfolio',
    }]
  }

  const metrics = calculatePortfolioMetrics(holdings, weeklyGoal)
  const byIncome = [...holdings].sort((a, b) => b.shares * b.annualDistributionPerShare - a.shares * a.annualDistributionPerShare)
  const topIncome = byIncome[0]
  const insights: IncomeInsight[] = []

  if (metrics.goalProgress >= 100) {
    insights.push({ id: 'goal-met', title: 'Weekly goal achieved', message: `Projected weekly income is ${money(metrics.weeklyIncome)}, above your ${money(weeklyGoal)} goal.`, severity: 'positive', metric: `${metrics.goalProgress.toFixed(0)}%` })
  } else {
    insights.push({ id: 'goal-gap', title: 'Weekly income gap', message: `${money(Math.max(0, weeklyGoal - metrics.weeklyIncome))} of additional projected weekly income is needed to reach your goal.`, severity: metrics.goalProgress >= 80 ? 'neutral' : 'warning', metric: `${metrics.goalProgress.toFixed(0)}%`, actionLabel: 'Run scenario', actionPath: '/strategy' })
  }

  insights.push({ id: 'top-producer', title: 'Largest income producer', message: `${topIncome.ticker} contributes the most forward income and represents ${metrics.largestIncomeWeight.toFixed(1)}% of total projected annual income.`, severity: metrics.largestIncomeWeight > 40 ? 'warning' : 'neutral', metric: `${metrics.largestIncomeWeight.toFixed(1)}%` })

  if (metrics.largestHoldingWeight > 35) {
    insights.push({ id: 'holding-concentration', title: 'Position concentration', message: `Your largest holding represents ${metrics.largestHoldingWeight.toFixed(1)}% of portfolio value. Consider reviewing your target allocation.`, severity: 'warning', actionLabel: 'Review holdings', actionPath: '/portfolio' })
  }

  if (metrics.coveredCallWeight > 60) {
    insights.push({ id: 'strategy-concentration', title: 'Covered-call concentration', message: `${metrics.coveredCallWeight.toFixed(1)}% of portfolio value is in covered-call strategies, which may limit upside participation.`, severity: 'warning', metric: `${metrics.coveredCallWeight.toFixed(1)}%` })
  } else {
    insights.push({ id: 'strategy-balance', title: 'Strategy mix', message: `Covered-call strategies represent ${metrics.coveredCallWeight.toFixed(1)}% of portfolio value.`, severity: 'neutral', metric: `${metrics.coveredCallWeight.toFixed(1)}%` })
  }

  if (metrics.yieldPct >= 20) {
    insights.push({ id: 'yield-risk', title: 'Elevated forward yield', message: `The portfolio's ${metrics.yieldPct.toFixed(1)}% forward yield warrants closer monitoring of distribution sustainability and NAV behavior.`, severity: 'critical', metric: `${metrics.yieldPct.toFixed(1)}%` })
  }

  return insights.slice(0, 5)
}
