import type { Holding } from '../../types/portfolio'
import { calculatePortfolioMetrics } from '../../domain/portfolio/calculations'
import { calculateIncomeMilestone, calculateIntelligenceScores } from '../../domain/intelligence/advancedIntelligence'
import { generateIncomeInsights } from '../intelligence/incomeIntelligence'

export type PortfolioReport = {
  generatedAt: string
  metrics: ReturnType<typeof calculatePortfolioMetrics>
  milestone: ReturnType<typeof calculateIncomeMilestone>
  scores: ReturnType<typeof calculateIntelligenceScores>
  insights: ReturnType<typeof generateIncomeInsights>
  holdings: Holding[]
}

export function createPortfolioReport(holdings: Holding[], weeklyGoal: number): PortfolioReport {
  return {
    generatedAt: new Date().toISOString(),
    metrics: calculatePortfolioMetrics(holdings, weeklyGoal),
    milestone: calculateIncomeMilestone(holdings, weeklyGoal),
    scores: calculateIntelligenceScores(holdings, weeklyGoal),
    insights: generateIncomeInsights(holdings, weeklyGoal),
    holdings,
  }
}

export function downloadPortfolioReport(report: PortfolioReport) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `income-os-report-${report.generatedAt.slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}
