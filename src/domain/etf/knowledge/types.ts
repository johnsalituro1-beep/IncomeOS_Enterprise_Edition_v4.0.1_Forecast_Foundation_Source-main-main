export type DistributionFrequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'Semiannual' | 'Annual' | 'Irregular' | 'None'
export type RiskBand = 'Low' | 'Moderate' | 'Elevated' | 'High' | 'Very High'
export type FundStatus = 'Active' | 'Liquidating' | 'Closed' | 'Unknown'

export type EtfMasterRecord = {
  id: string
  ticker: string
  fundName: string
  issuer: string
  exchange?: string
  cusip?: string
  isin?: string
  inceptionDate?: string
  status: FundStatus
  websiteUrl?: string
  prospectusUrl?: string
  factSheetUrl?: string
  benchmark?: string
  primaryAssetClass: string
  secondaryAssetClass?: string
  strategy: string
  investmentObjective?: string
  grossExpenseRatio?: number
  netExpenseRatio?: number
  assetsUnderManagement?: number
  sharesOutstanding?: number
  averageDailyVolume?: number
  secYield30Day?: number
  distributionFrequency: DistributionFrequency
  currency: string
  taxClassification?: string
  lastUpdatedAt: string
  sourceId: string
}

export type EtfKnowledgeDistributionRecord = {
  id: string
  etfId: string
  exDate: string
  recordDate?: string
  payDate: string
  amount: number
  distributionType: 'Income' | 'Capital Gain' | 'Return of Capital' | 'Mixed' | 'Special' | 'Unknown'
  qualifiedIncomePct?: number
  returnOfCapitalPct?: number
  capitalGainPct?: number
  isSpecial?: boolean
  sourceId: string
}

export type HoldingRecord = {
  id: string
  etfId: string
  asOfDate: string
  holdingTicker?: string
  holdingName: string
  weightPct: number
  sector?: string
  industry?: string
  country?: string
  marketCapBand?: string
  assetType?: string
}

export type SectorExposure = { etfId: string; asOfDate: string; sector: string; weightPct: number }
export type CountryExposure = { etfId: string; asOfDate: string; country: string; weightPct: number }

export type EtfClassification = {
  etfId: string
  incomeStyles: string[]
  growthThemes: string[]
  marketSegments: string[]
  optionStrategies: string[]
  leverageType: 'None' | 'Inverse' | 'Leveraged' | 'Defined Outcome' | 'Other'
  tags: string[]
}

export type RiskAssessment = {
  etfId: string
  overallBand: RiskBand
  volatilityScore: number
  navStabilityScore: number
  distributionStabilityScore: number
  leverageRiskScore: number
  optionsComplexityScore: number
  interestRateRiskScore: number
  currencyRiskScore: number
  liquidityRiskScore: number
  concentrationRiskScore: number
  issuerRiskScore: number
  rationale: string[]
  calculatedAt: string
}

export type IncomeMetrics = {
  etfId: string
  trailing12MonthDistribution: number
  rolling12MonthYieldPct?: number
  distributionCagr3YearPct?: number
  distributionVolatilityPct?: number
  payoutConsistencyScore: number
  paymentStreak: number
  averageDistribution: number
  projectedAnnualDistribution?: number
  projectedMonthlyDistribution?: number
  projectedWeeklyDistribution?: number
  calculatedAt: string
}

export type IntelligenceMetadata = {
  etfId: string
  labels: Array<'Core Candidate' | 'Satellite Candidate' | 'Income Focused' | 'Growth Focused' | 'Income + Growth' | 'Defensive' | 'Elevated Risk' | 'Tax Sensitive' | 'Retirement Candidate' | 'Research Required'>
  strengths: string[]
  considerations: string[]
}

export type EtfRelationship = {
  id: string
  fromEtfId: string
  toEtfId: string
  type: 'Competitor' | 'Alternative' | 'Similar Strategy' | 'Common Holdings' | 'Same Issuer' | 'Same Benchmark'
  score?: number
  explanation?: string
}

export type EtfKnowledgeRecord = {
  master: EtfMasterRecord
  classification?: EtfClassification
  risk?: RiskAssessment
  income?: IncomeMetrics
  intelligence?: IntelligenceMetadata
  sectors?: SectorExposure[]
  countries?: CountryExposure[]
}

export type KnowledgeBaseSnapshot = {
  schemaVersion: string
  generatedAt: string
  sourceIds: string[]
  funds: EtfKnowledgeRecord[]
  distributions: EtfKnowledgeDistributionRecord[]
  holdings: HoldingRecord[]
  relationships: EtfRelationship[]
}
