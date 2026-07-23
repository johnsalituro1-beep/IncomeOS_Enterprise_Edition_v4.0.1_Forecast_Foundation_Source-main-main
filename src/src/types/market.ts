/** Shared market-data view models exposed to application services and UI orchestration. */
export type PriceFreshness = 'fresh' | 'aging' | 'stale' | 'missing'

export interface QuoteCacheEntry {
  symbol: string
  price: number
  previousClose: number | null
  currency: string
  marketTime: string
  retrievedAt: string
  providerId: string
  classification: string
}

/** Provider-neutral quote payload. */
export interface MarketQuote {
  symbol: string
  price: number
  previousClose: number | null
  currency: string
  marketTime: string
}

/** Provider-neutral distribution payload; distinct from the persisted application record. */
export interface MarketDistributionRecord {
  symbol: string
  exDate: string
  payDate: string | null
  recordDate: string | null
  amount: number
  distributionType: 'income' | 'capital-gain' | 'return-of-capital' | 'mixed' | 'unknown'
  revision: number
}
