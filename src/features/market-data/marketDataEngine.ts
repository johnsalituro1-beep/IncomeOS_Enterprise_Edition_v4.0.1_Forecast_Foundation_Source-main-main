import type { Holding } from '../../types/portfolio'
import type { DataEnvelope, LiveDistributionRecord, LiveQuoteRecord } from '../../domain/live-data/types'
import type { PriceFreshness, QuoteCacheEntry } from '../../types/market'

export type { PriceFreshness, QuoteCacheEntry } from '../../types/market'

export function classifyFreshness(retrievedAt: string | null | undefined, now = new Date()): PriceFreshness {
  if (!retrievedAt) return 'missing'
  const ageHours = (now.getTime() - new Date(retrievedAt).getTime()) / 3_600_000
  if (!Number.isFinite(ageHours)) return 'missing'
  if (ageHours <= 24) return 'fresh'
  if (ageHours <= 72) return 'aging'
  return 'stale'
}

export function normalizeQuote(envelope: DataEnvelope<LiveQuoteRecord>): QuoteCacheEntry {
  if (!Number.isFinite(envelope.payload.price) || envelope.payload.price <= 0) throw new Error(`Invalid quote for ${envelope.symbol}`)
  return { symbol: envelope.symbol.toUpperCase(), price: envelope.payload.price, previousClose: envelope.payload.previousClose, currency: envelope.payload.currency, marketTime: envelope.payload.marketTime, retrievedAt: envelope.retrievedAt, providerId: envelope.providerId, classification: envelope.classification }
}

export function applyQuotesToHoldings(holdings: Holding[], quotes: QuoteCacheEntry[]): Holding[] {
  const bySymbol = new Map(quotes.map(q => [q.symbol.toUpperCase(), q]))
  return holdings.map(holding => {
    const quote = bySymbol.get(holding.ticker.toUpperCase())
    return quote ? { ...holding, currentPrice: quote.price } : holding
  })
}

export function mergeDistributionEnvelopes(existing: Array<{ ticker: string; exDate: string; paymentDate: string; amountPerShare: number }>, incoming: DataEnvelope<LiveDistributionRecord>[]) {
  const keys = new Set(existing.map(item => `${item.ticker.toUpperCase()}|${item.exDate}|${item.paymentDate}|${item.amountPerShare}`))
  return incoming.filter(item => {
    const p = item.payload
    const key = `${item.symbol.toUpperCase()}|${p.exDate}|${p.payDate ?? p.exDate}|${p.amount}`
    if (keys.has(key)) return false
    keys.add(key); return true
  })
}
