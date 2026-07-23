export type HistoricalEvidence = 'verified' | 'provider' | 'modeled' | 'missing'
export type IngestionStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'quarantined'
export type ChangeSeverity = 'info' | 'warning' | 'critical'

export interface PriceBar {
  fundId: string
  date: string
  open: number
  high: number
  low: number
  close: number
  adjustedClose: number
  volume: number
  sourceId: string
  evidence: HistoricalEvidence
}

export interface NavObservation {
  fundId: string
  date: string
  nav: number
  marketPrice: number
  premiumDiscountPct: number
  sourceId: string
  evidence: HistoricalEvidence
}

export interface DistributionRevision {
  fundId: string
  exDate: string
  revision: number
  amount: number
  distributionType: 'income' | 'capital-gain' | 'return-of-capital' | 'mixed' | 'unknown'
  announcedAt: string
  supersedesRevision?: number
  sourceId: string
  evidence: HistoricalEvidence
}

export interface HoldingsSnapshot {
  fundId: string
  asOfDate: string
  snapshotId: string
  holdingCount: number
  reportedWeightPct: number
  sourceId: string
  contentHash: string
  evidence: HistoricalEvidence
}

export interface CorporateAction {
  fundId: string
  effectiveDate: string
  type: 'split' | 'reverse-split' | 'merger' | 'liquidation' | 'ticker-change' | 'name-change' | 'fee-change'
  factor?: number
  oldValue?: string
  newValue?: string
  sourceId: string
  evidence: HistoricalEvidence
}

export interface SourceLineage {
  sourceId: string
  provider: string
  dataset: string
  acquiredAt: string
  licenseClass: 'authoritative' | 'licensed' | 'public' | 'development'
  checksum: string
  recordCount: number
}

export interface IngestionRun {
  id: string
  dataset: string
  startedAt: string
  completedAt?: string
  status: IngestionStatus
  received: number
  accepted: number
  rejected: number
  warnings: number
  sourceId: string
}

export interface ChangeEvent {
  id: string
  fundId: string
  detectedAt: string
  entity: 'price' | 'nav' | 'distribution' | 'holdings' | 'fund'
  field: string
  previousValue?: string | number
  currentValue?: string | number
  severity: ChangeSeverity
  rule: string
}

export interface HistoricalWarehouse {
  prices: PriceBar[]
  nav: NavObservation[]
  distributionRevisions: DistributionRevision[]
  holdingsSnapshots: HoldingsSnapshot[]
  corporateActions: CorporateAction[]
  lineage: SourceLineage[]
  ingestionRuns: IngestionRun[]
  changeEvents: ChangeEvent[]
}
