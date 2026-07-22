export type MarketRegime = 'expansion' | 'slowdown' | 'contraction' | 'high-volatility' | 'unknown'

export interface ScoreObservation {
  date: string
  score: number
  benchmarkScore?: number
  confidence: number
}

export interface GoalProgress {
  currentWeeklyIncome: number
  targetWeeklyIncome: number
  currentPortfolioValue: number
  targetPortfolioValue?: number
  yearsRemaining: number
}

export interface IntelligenceAlert {
  id: string
  severity: 'info' | 'watch' | 'warning' | 'critical'
  category: 'income' | 'risk' | 'goal' | 'data-quality' | 'benchmark'
  title: string
  detail: string
  evidence: string[]
}

export interface IntelligenceAnalyticsResult {
  regime: MarketRegime
  adaptiveWeights: Record<string, number>
  trend: 'improving' | 'stable' | 'deteriorating'
  benchmarkDelta: number
  goalCompletionPct: number
  projectedWeeklyIncome12m: number
  alerts: IntelligenceAlert[]
}
