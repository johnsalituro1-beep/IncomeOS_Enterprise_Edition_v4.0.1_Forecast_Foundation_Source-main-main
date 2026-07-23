import type { User } from '@supabase/supabase-js'
import type { Holding } from '../../types/portfolio'
import { applyQuotesToHoldings, normalizeQuote, type QuoteCacheEntry } from '../../features/market-data/marketDataEngine'
import { persistQuoteCache } from '../../features/market-data/marketDataRepository'
import type { LiveEtfDataProvider } from '../../providers/live-data/provider'
import { sandboxProvider } from '../../providers/live-data/sandboxProvider'
import { httpProvider } from '../../providers/live-data/httpProvider'

export type PortfolioMarketRefresh = { holdings: Holding[]; quotes: QuoteCacheEntry[]; providerId: string; fallbackUsed: boolean; refreshedAt: string }

export async function refreshPortfolioMarketData(holdings: Holding[], user: User | null, preferred?: LiveEtfDataProvider): Promise<PortfolioMarketRefresh> {
  const symbols = [...new Set(holdings.map(h => h.ticker.trim().toUpperCase()).filter(Boolean))]
  if (!symbols.length) return { holdings, quotes: [], providerId: 'none', fallbackUsed: false, refreshedAt: new Date().toISOString() }
  const primary = preferred ?? (httpProvider.descriptor.enabled ? httpProvider : sandboxProvider)
  let provider = primary, fallbackUsed = false
  let envelopes
  try { envelopes = await provider.fetchQuotes(symbols) }
  catch (error) {
    if (provider.descriptor.id === sandboxProvider.descriptor.id) throw error
    provider = sandboxProvider; fallbackUsed = true; envelopes = await provider.fetchQuotes(symbols)
  }
  const quotes = envelopes.map(normalizeQuote)
  await persistQuoteCache(user, quotes)
  return { holdings: applyQuotesToHoldings(holdings, quotes), quotes, providerId: provider.descriptor.id, fallbackUsed, refreshedAt: new Date().toISOString() }
}
