import type { GoalProgress, IntelligenceAnalyticsResult, MarketRegime, ScoreObservation } from './types'

const clamp = (value:number, min=0, max=100) => Math.max(min, Math.min(max, value))

export function detectScoreTrend(history: ScoreObservation[]): IntelligenceAnalyticsResult['trend'] {
  if (history.length < 2) return 'stable'
  const recent = history.slice(-4)
  const slope = (recent[recent.length - 1].score - recent[0].score) / Math.max(1, recent.length - 1)
  return slope > 1 ? 'improving' : slope < -1 ? 'deteriorating' : 'stable'
}

export function adaptiveWeights(regime: MarketRegime): Record<string, number> {
  const base = { incomeSustainability: 18, distributionReliability: 13, resilience: 13, diversification: 11, concentration: 10, growth: 9, liquidity: 8, expenseEfficiency: 6, goalAlignment: 8, dataQuality: 4 }
  if (regime === 'contraction' || regime === 'high-volatility') return { ...base, resilience: 18, concentration: 13, growth: 5, liquidity: 10 }
  if (regime === 'expansion') return { ...base, growth: 13, resilience: 10, liquidity: 6 }
  return base
}

export function analyzeIntelligence(input:{ history: ScoreObservation[]; goal: GoalProgress; regime: MarketRegime; incomeGrowthRate: number }): IntelligenceAnalyticsResult {
  const latest = input.history.at(-1)
  const benchmarkDelta = latest?.benchmarkScore == null ? 0 : latest.score - latest.benchmarkScore
  const goalCompletionPct = clamp((input.goal.currentWeeklyIncome / Math.max(1, input.goal.targetWeeklyIncome)) * 100)
  const projectedWeeklyIncome12m = input.goal.currentWeeklyIncome * (1 + input.incomeGrowthRate)
  const alerts = []
  if (goalCompletionPct < 90) alerts.push({ id:'goal-gap', severity:'warning' as const, category:'goal' as const, title:'Income goal remains underfunded', detail:`Current weekly income covers ${goalCompletionPct.toFixed(1)}% of the target.`, evidence:['USER_GOAL','PORTFOLIO_CASH_FLOW'] })
  if (detectScoreTrend(input.history) === 'deteriorating') alerts.push({ id:'score-trend', severity:'warning' as const, category:'risk' as const, title:'Portfolio health trend is deteriorating', detail:'The recent Income OS Score trend is negative.', evidence:['SCORE_HISTORY'] })
  if ((latest?.confidence ?? 0) < 75) alerts.push({ id:'confidence', severity:'watch' as const, category:'data-quality' as const, title:'Decision confidence is limited', detail:'Refresh or verify provider records before relying on optimization results.', evidence:['DATA_CONFIDENCE'] })
  return { regime: input.regime, adaptiveWeights: adaptiveWeights(input.regime), trend: detectScoreTrend(input.history), benchmarkDelta, goalCompletionPct, projectedWeeklyIncome12m, alerts }
}
