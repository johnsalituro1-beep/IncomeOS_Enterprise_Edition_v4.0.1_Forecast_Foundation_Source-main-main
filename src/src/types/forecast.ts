/** Canonical forecast contracts shared by the forecast engine, React context, and UI. */
export enum PaymentFrequency {
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  SemiAnnual = 'SemiAnnual',
  Annual = 'Annual',
  Unknown = 'Unknown',
}

export enum ForecastPeriod {
  OneMonth = '1M',
  ThreeMonths = '3M',
  SixMonths = '6M',
  OneYear = '1Y',
  ThreeYears = '3Y',
  FiveYears = '5Y',
}

export interface ForecastHolding {
  ticker: string
  shares: number
  currentPrice: number
  annualDistributionPerShare: number
  costBasis?: number
}

export interface DistributionStatistics {
  ticker: string
  frequency: PaymentFrequency
  averageDistribution: number
  medianDistribution: number
  volatility: number
  growthRate: number
  stabilityScore: number
}

export interface ForecastAssumptions {
  /** Percentage of distributions reinvested, from 0 through 100. */
  reinvestmentRate: number
  /** Expected annual growth in distribution per share, expressed as a decimal. */
  annualDistributionGrowthRate: number
  /** Expected annual share-price growth, expressed as a decimal. */
  annualPriceGrowthRate: number
  /** Expected annual inflation, expressed as a decimal. */
  inflationRate: number
  /** Projection length in whole years. */
  horizonYears: number
  /** Retained for compatibility with earlier forecast contracts. */
  reinvestDistributions?: boolean
  /** Retained alias for earlier callers. */
  annualGrowthRate?: number
}

export interface ForecastConfidence {
  score: number
  level: 'Low' | 'Medium' | 'High'
  reasons: string[]
}

export interface ForecastTimelinePoint {
  month: number
  date: string
  portfolioValue: number
  annualIncome: number
  monthlyIncome: number
  weeklyIncome: number
  cumulativeDistributions: number
  reinvestedDistributions: number
  inflationAdjustedAnnualIncome: number
}

export interface ForecastSummary {
  startingPortfolioValue: number
  endingPortfolioValue: number
  startingAnnualIncome: number
  projectedAnnualIncome: number
  projectedMonthlyIncome: number
  projectedWeeklyIncome: number
  cumulativeDistributions: number
  totalReinvested: number
  projectedYield: number
  inflationAdjustedAnnualIncome: number
}

export interface ForecastScenario {
  id: string
  name: string
  assumptions: ForecastAssumptions
  result?: ForecastResult
}

export interface ForecastResult {
  generatedAt: string
  assumptions: ForecastAssumptions
  summary: ForecastSummary
  confidence: ForecastConfidence
  timeline: ForecastTimelinePoint[]
  scenarios: ForecastScenario[]
  warnings: string[]
}
