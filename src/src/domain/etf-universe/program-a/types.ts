export type EvidenceStatus = 'verified' | 'provider' | 'modeled' | 'missing'
export type ListingStatus = 'active' | 'closed' | 'liquidating' | 'unknown'
export type DistributionFrequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'Semiannual' | 'Annual' | 'Irregular' | 'None' | 'Unknown'

export type EtfMasterRecord = {
  id: string
  ticker: string
  name: string
  issuer: string
  exchange: string
  listingStatus: ListingStatus
  assetClass: string
  category: string
  strategy: string
  benchmark?: string
  inceptionDate?: string
  expenseRatioPct?: number
  aumUsd?: number
  averageDailyVolume?: number
  distributionFrequency: DistributionFrequency
  optionsStrategy?: string
  website?: string
  tags: string[]
  evidence: EvidenceStatus
  sourceId?: string
  sourceAsOf?: string
  updatedAt: string
}

export type UniverseDistributionRecord = {
  id: string
  etfId: string
  exDate: string
  recordDate?: string
  payDate?: string
  amount: number
  currency: string
  type: 'income' | 'short-term-capital-gain' | 'long-term-capital-gain' | 'return-of-capital' | 'mixed' | 'unknown'
  evidence: EvidenceStatus
  sourceId?: string
}

export type HoldingRecord = {
  id: string
  etfId: string
  asOfDate: string
  symbol?: string
  name: string
  weightPct: number
  sector?: string
  industry?: string
  country?: string
  assetType?: string
  evidence: EvidenceStatus
  sourceId?: string
}

export type ExposureSnapshot = {
  etfId: string
  asOfDate: string
  sectors: Array<{ name: string; weightPct: number }>
  countries: Array<{ name: string; weightPct: number }>
  assetTypes: Array<{ name: string; weightPct: number }>
  evidence: EvidenceStatus
}

export type EtfRelationshipType =
  | 'same-issuer'
  | 'same-benchmark'
  | 'similar-strategy'
  | 'holdings-overlap'
  | 'income-peer'
  | 'growth-peer'
  | 'lower-cost-alternative'
  | 'portfolio-complement'

export type EtfRelationship = {
  id: string
  fromEtfId: string
  toEtfId: string
  type: EtfRelationshipType
  strength: number
  explanation: string
  evidence: EvidenceStatus
  asOfDate?: string
}

export type DataQualityIssue = {
  id: string
  severity: 'info' | 'warning' | 'critical'
  entityType: 'etf' | 'distribution' | 'holding' | 'relationship'
  entityId: string
  field?: string
  message: string
}

export type UniverseSnapshot = {
  generatedAt: string
  records: EtfMasterRecord[]
  distributions: UniverseDistributionRecord[]
  holdings: HoldingRecord[]
  exposures: ExposureSnapshot[]
  relationships: EtfRelationship[]
}

export type UniverseCoverageMetrics = {
  totalFunds: number
  activeFunds: number
  verifiedFunds: number
  fundsWithDistributions: number
  fundsWithHoldings: number
  fundsWithRelationships: number
  criticalIssues: number
  completenessPct: number
  verificationPct: number
  relationshipCoveragePct: number
}
