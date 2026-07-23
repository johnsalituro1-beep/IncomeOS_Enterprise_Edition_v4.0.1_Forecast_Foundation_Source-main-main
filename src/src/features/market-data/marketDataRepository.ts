import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { QuoteCacheEntry } from './marketDataEngine'

const QUOTE_KEY = 'incomeos-v2-quotes'
export type MarketRefreshState = { quotes: QuoteCacheEntry[]; refreshedAt: string; providerId: string }

export function readCachedMarketData(): MarketRefreshState | null {
  try { const raw = localStorage.getItem(QUOTE_KEY); return raw ? JSON.parse(raw) as MarketRefreshState : null } catch { return null }
}
export function cacheMarketData(state: MarketRefreshState) { localStorage.setItem(QUOTE_KEY, JSON.stringify(state)) }

export async function persistQuoteCache(user: User | null, quotes: QuoteCacheEntry[]) {
  const state = { quotes, refreshedAt: new Date().toISOString(), providerId: quotes[0]?.providerId ?? 'unknown' }
  cacheMarketData(state)
  if (!user || !supabase || !quotes.length) return state
  const payload = quotes.map(q => ({ user_id: user.id, symbol: q.symbol, price: q.price, previous_close: q.previousClose, currency: q.currency, market_time: q.marketTime, retrieved_at: q.retrievedAt, provider_id: q.providerId, classification: q.classification }))
  const result = await supabase.from('market_quote_cache').upsert(payload, { onConflict: 'user_id,symbol' })
  if (result.error) throw result.error
  return state
}
