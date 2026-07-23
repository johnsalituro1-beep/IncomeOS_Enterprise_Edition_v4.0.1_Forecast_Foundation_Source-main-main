/** Canonical application distribution models used by portfolio income workflows. */
export type DistributionStatus = 'declared' | 'paid' | 'estimated'
export type DistributionFrequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'Irregular'

export interface DistributionRecord {
  id: string
  ticker: string
  amountPerShare: number
  declarationDate: string | null
  exDate: string | null
  recordDate: string | null
  paymentDate: string
  frequency: DistributionFrequency
  status: DistributionStatus
  source: string
  notes: string
  providerId?: string | null
  providerRecordId?: string | null
  revision?: number
  classification?: string | null
  confidence?: number | null
  retrievedAt?: string | null
  providerUpdatedAt?: string | null
  isManualOverride?: boolean
}

export type DistributionDraft = Omit<DistributionRecord, 'id'>

export interface IncomeEvent {
  id: string
  ticker: string
  paymentDate: string
  exDate: string | null
  amountPerShare: number
  shares: number
  projectedIncome: number
  status: DistributionStatus
  confidence: 'Confirmed' | 'Projected'
  sourceRecordId: string | null
}
