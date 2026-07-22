export type DataClassification = 'verified' | 'provider' | 'modeled' | 'user' | 'missing'
export type DataKind = 'fund' | 'quote' | 'nav' | 'distribution' | 'holding' | 'corporate-action'
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'partial' | 'failed'
export type Severity = 'info' | 'warning' | 'critical'

export interface ProviderDescriptor {
  id: string
  name: string
  environment: 'sandbox' | 'production'
  capabilities: DataKind[]
  rateLimitPerMinute: number
  enabled: boolean
}

export interface DataEnvelope<T> {
  providerId: string
  kind: DataKind
  symbol: string
  retrievedAt: string
  effectiveAt: string
  classification: DataClassification
  confidence: number
  payload: T
  sourceRecordId?: string
}

export interface FundRecord {
  symbol: string
  name: string
  issuer: string
  assetClass: string
  expenseRatio: number | null
  inceptionDate: string | null
}

export interface LiveQuoteRecord {
  symbol: string
  price: number
  previousClose: number | null
  currency: string
  marketTime: string
}

export interface NavRecord {
  symbol: string
  nav: number
  navDate: string
  premiumDiscountPct: number | null
}

export interface LiveDistributionRecord {
  symbol: string
  exDate: string
  payDate: string | null
  recordDate: string | null
  amount: number
  distributionType: 'income' | 'capital-gain' | 'return-of-capital' | 'mixed' | 'unknown'
  revision: number
}

export interface HoldingRecord {
  symbol: string
  asOfDate: string
  holdingSymbol: string
  holdingName: string
  weightPct: number
  shares: number | null
  marketValue: number | null
}

export interface ValidationIssue {
  code: string
  severity: Severity
  message: string
  symbol?: string
  kind?: DataKind
  recordKey?: string
}

export interface IngestionRun {
  id: string
  providerId: string
  jobType: DataKind | 'full-sync'
  startedAt: string
  completedAt?: string
  status: JobStatus
  requestedSymbols: number
  acceptedRecords: number
  rejectedRecords: number
  warnings: number
  issues: ValidationIssue[]
}

export interface CoverageMetric {
  kind: DataKind
  covered: number
  total: number
  stale: number
  qualityScore: number
}

export interface LiveDataSnapshot {
  providers: ProviderDescriptor[]
  latestRun: IngestionRun
  coverage: CoverageMetric[]
  queueDepth: number
  staleSymbols: string[]
  unresolvedIssues: ValidationIssue[]
}
