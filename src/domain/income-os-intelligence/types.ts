export type EvidenceClass = 'verified' | 'provider' | 'modeled' | 'user' | 'missing'
export type ScoreDirection = 'improving' | 'stable' | 'declining'
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low'

export interface PortfolioHoldingSignal {
  ticker: string
  weight: number
  distributionYield: number
  distributionReliability: number
  volatility: number
  liquidity: number
  expenseRatio: number
  dataQuality: number
}

export interface IncomeOSInputs {
  weeklyIncome: number
  weeklyIncomeGoal: number
  annualIncomeGrowth: number
  projectedCoverageYears: number
  largestHoldingWeight: number
  topThreeWeight: number
  sectorConcentration: number
  drawdownEstimate: number
  cashBufferMonths: number
  holdings: PortfolioHoldingSignal[]
}

export interface ScoreFactor {
  code: string
  label: string
  impact: number
  detail: string
  evidence: EvidenceClass
}

export interface ComponentScore {
  key: string
  label: string
  score: number
  weight: number
  confidence: number
  direction: ScoreDirection
  factors: ScoreFactor[]
}

export interface IncomeOSAssessment {
  score: number
  confidence: number
  health: 'excellent' | 'strong' | 'watch' | 'at-risk'
  generatedAt: string
  components: ComponentScore[]
}

export interface PrioritizedRecommendation {
  id: string
  priority: RecommendationPriority
  category: 'income' | 'risk' | 'diversification' | 'cost' | 'data' | 'goal'
  title: string
  rationale: string
  estimatedImpact: number
  componentKeys: string[]
  reasonCodes: string[]
}

export interface ScoreTimelinePoint {
  date: string
  overall: number
  incomeSustainability: number
  resilience: number
  diversification: number
  goalAlignment: number
  event?: string
}
