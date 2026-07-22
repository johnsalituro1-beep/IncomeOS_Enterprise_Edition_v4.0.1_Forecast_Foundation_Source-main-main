import type { EvidenceStatus } from '../program-a/types'

export type ExposureDimension = 'sector' | 'industry' | 'country' | 'market-cap' | 'factor' | 'asset-class'

export type NormalizedExposure = {
  etfId: string
  asOfDate: string
  dimension: ExposureDimension
  name: string
  weightPct: number
  evidence: EvidenceStatus
}

export type DistributionStatistics = {
  etfId: string
  paymentCount: number
  trailingTwelveMonthTotal: number
  averagePayment: number
  latestPayment?: number
  consistencyScore: number
  growthScore: number
  cadenceConfidence: number
}

export type EtfScoreComponent = {
  key: 'income' | 'growth' | 'stability' | 'diversification' | 'liquidity' | 'expense-efficiency' | 'risk' | 'portfolio-fit'
  label: string
  score: number
  rationale: string
  evidence: EvidenceStatus
}

export type EtfScorecard = {
  etfId: string
  overall: number
  components: EtfScoreComponent[]
  generatedAt: string
  methodologyVersion: string
}

export type OverlapResult = {
  leftEtfId: string
  rightEtfId: string
  holdingsOverlapPct: number
  sectorOverlapPct: number
  countryOverlapPct: number
  strategySimilarityPct: number
  combinedSimilarityPct: number
  sharedHoldings: string[]
  explanation: string
}

export type IssuerProfile = {
  issuer: string
  fundIds: string[]
  activeFundCount: number
  strategies: string[]
  assetClasses: string[]
  totalAumUsd?: number
  evidence: EvidenceStatus
}

export type BenchmarkProfile = {
  benchmark: string
  fundIds: string[]
  strategyFamilies: string[]
  assetClasses: string[]
  evidence: EvidenceStatus
}

export type ResearchMetadata = {
  etfId: string
  portfolioRole: string
  incomeCharacteristics: string
  growthCharacteristics: string
  riskNotes: string[]
  researchStatus: 'ready' | 'partial' | 'blocked'
  providerConfidence: number
  lastValidationDate: string
  evidence: EvidenceStatus
}
