export type AccountType = 'Taxable' | 'Traditional IRA' | 'Roth IRA' | 'Other'
export type DistributionPreference = 'Weekly preferred' | 'Monthly preferred' | 'No preference'
export type RiskTolerance = 'Conservative' | 'Moderate' | 'Growth' | 'Aggressive'

export type StrategyBuilderProfile = {
  name: string
  investableCapital: number
  targetWeeklyIncome: number
  monthlyContribution: number
  reinvestmentPct: number
  horizonYears: number
  accountType: AccountType
  maximumDrawdownPct: number
  incomePriority: number
  growthPriority: number
  distributionPreference: DistributionPreference
  riskTolerance: RiskTolerance
}

export type StrategyConstraints = {
  minimumHoldings: number
  maximumSingleEtfPct: number
  maximumSingleIssuerPct: number
  maximumCoveredCallPct: number
  minimumGrowthPct: number
  minimumFixedIncomePct: number
  maximumSectorPct: number
}

export type StrategyCandidate = {
  ticker: string
  name: string
  issuer: string
  category: 'Core Equity' | 'Dividend Growth' | 'Covered Call' | 'Fixed Income' | 'Preferreds' | 'REIT' | 'Alternative Income'
  sector: string
  distributionFrequency: 'Weekly' | 'Monthly' | 'Quarterly'
  modeledYieldPct: number
  modeledGrowthPct: number
  stabilityScore: number
  riskScore: number
  expenseRatioPct: number
  coveredCall: boolean
  fixedIncome: boolean
  growthAsset: boolean
}

export type StrategyAllocation = StrategyCandidate & { allocationPct: number; dollars: number; annualIncome: number }

export type StrategyScore = {
  incomePotential: number
  growthPotential: number
  diversification: number
  incomeStability: number
  riskFit: number
  goalAlignment: number
  overall: number
}

export type ConstraintCheck = { label: string; passed: boolean; actual: number; limit: number; unit: '%' | 'count' }

export type StrategyProjectionPoint = {
  year: number
  portfolioValue: number
  annualIncome: number
  weeklyIncome: number
  cumulativeCashIncome: number
  cumulativeReinvestedIncome: number
}

export type GeneratedStrategy = {
  id: string
  name: string
  description: string
  allocations: StrategyAllocation[]
  scores: StrategyScore
  checks: ConstraintCheck[]
  projectedAnnualIncome: number
  projectedWeeklyIncome: number
  modeledYieldPct: number
  modeledGrowthPct: number
  goalProgressPct: number
  incomeGapAnnual: number
  projection: StrategyProjectionPoint[]
  observations: string[]
}

export type StrategyTemplate = {
  id: string
  name: string
  description: string
  profilePatch: Partial<StrategyBuilderProfile>
  constraintPatch: Partial<StrategyConstraints>
  categoryTargets: Partial<Record<StrategyCandidate['category'], number>>
}
