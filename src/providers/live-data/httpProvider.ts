import type { DataEnvelope, LiveDistributionRecord, FundRecord, HoldingRecord, NavRecord, LiveQuoteRecord } from '../../domain/live-data/types'
import type { LiveEtfDataProvider } from './provider'

const endpoint = (import.meta.env.VITE_MARKET_DATA_ENDPOINT as string | undefined)?.replace(/\/$/, '')
const apiKey = import.meta.env.VITE_MARKET_DATA_PUBLIC_KEY as string | undefined

async function request<T>(path: string, symbols: string[]): Promise<DataEnvelope<T>[]> {
  if (!endpoint) throw new Error('Production market-data endpoint is not configured.')
  const response = await fetch(`${endpoint}/${path}?symbols=${encodeURIComponent(symbols.join(','))}`, { headers: apiKey ? { 'x-incomeos-key': apiKey } : undefined })
  if (!response.ok) throw new Error(`Market-data request failed (${response.status}).`)
  const body = await response.json() as { records?: DataEnvelope<T>[] }
  return body.records ?? []
}

export const httpProvider: LiveEtfDataProvider = {
  descriptor: { id: 'incomeos-http-adapter', name: 'IncomeOS Production Adapter', environment: 'production', capabilities: ['fund','quote','nav','distribution','holding'], rateLimitPerMinute: 60, enabled: Boolean(endpoint) },
  async healthCheck() {
    const start = performance.now()
    try { if (!endpoint) return { ok: false, latencyMs: 0, message: 'Endpoint not configured.' }; const response = await fetch(`${endpoint}/health`); return { ok: response.ok, latencyMs: Math.round(performance.now() - start), message: response.ok ? 'Production adapter operational.' : `Health check failed (${response.status}).` } }
    catch (error) { return { ok: false, latencyMs: Math.round(performance.now() - start), message: error instanceof Error ? error.message : 'Health check failed.' } }
  },
  fetchFunds: symbols => request<FundRecord>('funds', symbols),
  fetchQuotes: symbols => request<LiveQuoteRecord>('quotes', symbols),
  fetchNav: symbols => request<NavRecord>('nav', symbols),
  fetchDistributions: symbols => request<LiveDistributionRecord>('distributions', symbols),
  fetchHoldings: symbols => request<HoldingRecord>('holdings', symbols),
}
