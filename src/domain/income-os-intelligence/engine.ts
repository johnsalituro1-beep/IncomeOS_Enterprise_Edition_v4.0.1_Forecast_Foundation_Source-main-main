import type { ComponentScore, IncomeOSAssessment, IncomeOSInputs, PrioritizedRecommendation, ScoreFactor } from './types'

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))
const avg = (values: number[]) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
const factor = (code: string, label: string, impact: number, detail: string, evidence: ScoreFactor['evidence'] = 'modeled'): ScoreFactor => ({ code, label, impact, detail, evidence })

function component(key: string, label: string, score: number, weight: number, confidence: number, factors: ScoreFactor[]): ComponentScore {
  const net = factors.reduce((sum, item) => sum + item.impact, 0)
  const direction = net > 3 ? 'improving' : net < -3 ? 'declining' : 'stable'
  return { key, label, score: clamp(score), weight, confidence: clamp(confidence), direction, factors }
}

export function calculateIncomeOSAssessment(input: IncomeOSInputs): IncomeOSAssessment {
  const incomeCoverage = input.weeklyIncomeGoal > 0 ? input.weeklyIncome / input.weeklyIncomeGoal : 0
  const reliability = avg(input.holdings.map(h => h.distributionReliability))
  const liquidity = avg(input.holdings.map(h => h.liquidity))
  const expenses = avg(input.holdings.map(h => h.expenseRatio))
  const dataQuality = avg(input.holdings.map(h => h.dataQuality))
  const weightedVolatility = input.holdings.reduce((sum, h) => sum + h.volatility * h.weight, 0)

  const components: ComponentScore[] = [
    component('income-sustainability', 'Income Sustainability', 55 + Math.min(25, input.projectedCoverageYears * 1.5) + (reliability - 70) * .35, 16, dataQuality,
      [factor('COVERAGE_YEARS', 'Projected coverage', input.projectedCoverageYears >= 15 ? 8 : -7, `${input.projectedCoverageYears.toFixed(1)} modeled years of cash-flow coverage`), factor('PAYOUT_RELIABILITY', 'Distribution reliability', reliability >= 75 ? 7 : -8, `${reliability.toFixed(0)} average reliability score`)]),
    component('income-growth', 'Income Growth', 60 + input.annualIncomeGrowth * 4, 9, dataQuality,
      [factor('INCOME_GROWTH_RATE', 'Income growth rate', input.annualIncomeGrowth > 2 ? 8 : -4, `${input.annualIncomeGrowth.toFixed(1)}% modeled annual income growth`)]),
    component('distribution-reliability', 'Distribution Reliability', reliability, 12, dataQuality,
      [factor('RELIABILITY_AVG', 'Payment consistency', reliability >= 80 ? 8 : -6, 'Weighted fund-level distribution history')]),
    component('portfolio-resilience', 'Portfolio Resilience', 100 - input.drawdownEstimate * 1.15 - weightedVolatility * .35 + Math.min(10, input.cashBufferMonths), 13, dataQuality,
      [factor('DRAWDOWN', 'Estimated drawdown', input.drawdownEstimate < 25 ? 6 : -10, `${input.drawdownEstimate.toFixed(1)}% modeled severe-market drawdown`), factor('CASH_BUFFER', 'Cash buffer', input.cashBufferMonths >= 6 ? 7 : -5, `${input.cashBufferMonths.toFixed(1)} months of cash coverage`)]),
    component('diversification', 'Diversification', 100 - input.topThreeWeight * .6 - input.sectorConcentration * .35, 12, dataQuality,
      [factor('TOP_THREE', 'Top-three concentration', input.topThreeWeight < 55 ? 6 : -9, `${input.topThreeWeight.toFixed(1)}% in the three largest positions`), factor('SECTOR_LOAD', 'Sector concentration', input.sectorConcentration < 35 ? 6 : -7, `${input.sectorConcentration.toFixed(1)}% largest sector exposure`)]),
    component('concentration-risk', 'Concentration Control', 100 - input.largestHoldingWeight * 1.25 - Math.max(0, input.topThreeWeight - 45), 10, dataQuality,
      [factor('LARGEST_POSITION', 'Largest holding', input.largestHoldingWeight <= 20 ? 7 : -10, `${input.largestHoldingWeight.toFixed(1)}% largest holding weight`)]),
    component('liquidity', 'Liquidity', liquidity, 7, dataQuality,
      [factor('LIQUIDITY_AVG', 'Tradability', liquidity >= 75 ? 5 : -5, `${liquidity.toFixed(0)} weighted liquidity score`)]),
    component('expense-efficiency', 'Expense Efficiency', 100 - expenses * 40, 6, dataQuality,
      [factor('EXPENSE_LOAD', 'Weighted expense ratio', expenses <= .75 ? 5 : -6, `${expenses.toFixed(2)}% weighted expense ratio`)]),
    component('goal-alignment', 'Goal Alignment', Math.min(100, incomeCoverage * 100), 10, 95,
      [factor('WEEKLY_GOAL', 'Weekly income target', incomeCoverage >= 1 ? 10 : -Math.round((1 - incomeCoverage) * 20), `$${input.weeklyIncome.toFixed(0)} of $${input.weeklyIncomeGoal.toFixed(0)} weekly target`,'user')]),
    component('data-quality', 'Data Quality', dataQuality, 5, dataQuality,
      [factor('DATA_COVERAGE', 'Evidence coverage', dataQuality >= 85 ? 8 : -8, `${dataQuality.toFixed(0)}% confidence-weighted data completeness`,'provider')]),
  ]

  const weightTotal = components.reduce((sum, item) => sum + item.weight, 0)
  const score = clamp(components.reduce((sum, item) => sum + item.score * item.weight, 0) / weightTotal)
  const confidence = clamp(components.reduce((sum, item) => sum + item.confidence * item.weight, 0) / weightTotal)
  const health = score >= 85 ? 'excellent' : score >= 72 ? 'strong' : score >= 58 ? 'watch' : 'at-risk'
  return { score, confidence, health, generatedAt: new Date().toISOString(), components }
}

export function prioritizeRecommendations(assessment: IncomeOSAssessment): PrioritizedRecommendation[] {
  const weak = [...assessment.components].sort((a, b) => a.score - b.score).slice(0, 5)
  return weak.map((item, index) => {
    const category: PrioritizedRecommendation['category'] = item.key.includes('income') ? 'income' : item.key.includes('divers') || item.key.includes('concentration') ? 'diversification' : item.key.includes('expense') ? 'cost' : item.key.includes('data') ? 'data' : item.key.includes('goal') ? 'goal' : 'risk'
    const priority: PrioritizedRecommendation['priority'] = item.score < 50 ? 'critical' : item.score < 65 ? 'high' : item.score < 78 ? 'medium' : 'low'
    return { id: `rec-${item.key}`, priority, category, title: `Improve ${item.label}`, rationale: item.factors.find(f => f.impact < 0)?.detail ?? `Review the main drivers of the ${item.label.toLowerCase()} score.`, estimatedImpact: Math.max(2, Math.round((85 - item.score) * .35)), componentKeys: [item.key], reasonCodes: item.factors.filter(f => f.impact < 0).map(f => f.code).slice(0, 3) }
  }).sort((a, b) => ({critical:4,high:3,medium:2,low:1}[b.priority] - {critical:4,high:3,medium:2,low:1}[a.priority]) || b.estimatedImpact - a.estimatedImpact).slice(0, 4)
}
