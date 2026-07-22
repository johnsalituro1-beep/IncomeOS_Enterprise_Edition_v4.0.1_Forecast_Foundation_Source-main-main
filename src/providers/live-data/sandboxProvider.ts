import type { DataEnvelope, LiveDistributionRecord, FundRecord, HoldingRecord, NavRecord, LiveQuoteRecord } from '../../domain/live-data/types'
import type { LiveEtfDataProvider } from './provider'

const catalog: Record<string, { name: string; issuer: string; assetClass: string; expenseRatio: number; basePrice: number }> = {
  EDGQ: { name: 'Enhanced Dividend Growth ETF', issuer: 'Development Provider', assetClass: 'Equity', expenseRatio: 0.0053, basePrice: 28.16 },
  EDGX: { name: 'Enhanced Dividend Growth Select ETF', issuer: 'Development Provider', assetClass: 'Equity', expenseRatio: 0.0065, basePrice: 31.42 },
  XDTE: { name: 'Daily Target Income ETF', issuer: 'Development Provider', assetClass: 'Options Income', expenseRatio: 0.0095, basePrice: 50.20 },
  BCCC: { name: 'Crypto Covered Call ETF', issuer: 'Development Provider', assetClass: 'Digital Assets', expenseRatio: 0.0099, basePrice: 24.78 },
}

const now = () => new Date().toISOString()
const day = () => new Date().toISOString().slice(0, 10)
const envelope = <T>(kind: DataEnvelope<T>['kind'], symbol: string, payload: T, effectiveAt = now()): DataEnvelope<T> => ({
  providerId: 'incomeos-sandbox', kind, symbol, retrievedAt: now(), effectiveAt, classification: 'modeled', confidence: 0.72, payload,
})

export const sandboxProvider: LiveEtfDataProvider = {
  descriptor: { id: 'incomeos-sandbox', name: 'IncomeOS Sandbox Provider', environment: 'sandbox', capabilities: ['fund', 'quote', 'nav', 'distribution', 'holding'], rateLimitPerMinute: 120, enabled: true },
  async healthCheck() { return { ok: true, latencyMs: 38, message: 'Sandbox provider operational; values are modeled.' } },
  async fetchFunds(symbols) { return symbols.filter(s => catalog[s]).map(symbol => envelope<FundRecord>('fund', symbol, { symbol, name: catalog[symbol].name, issuer: catalog[symbol].issuer, assetClass: catalog[symbol].assetClass, expenseRatio: catalog[symbol].expenseRatio, inceptionDate: '2026-02-17' })) },
  async fetchQuotes(symbols) { return symbols.filter(s => catalog[s]).map((symbol, index) => { const price = catalog[symbol].basePrice * (1 + index * .002); return envelope<LiveQuoteRecord>('quote', symbol, { symbol, price: Number(price.toFixed(2)), previousClose: Number((price * .997).toFixed(2)), currency: 'USD', marketTime: now() }) }) },
  async fetchNav(symbols) { return symbols.filter(s => catalog[s]).map((symbol, index) => { const nav = catalog[symbol].basePrice * (1 - index * .001); return envelope<NavRecord>('nav', symbol, { symbol, nav: Number(nav.toFixed(2)), navDate: day(), premiumDiscountPct: Number(((catalog[symbol].basePrice / nav - 1) * 100).toFixed(2)) }, `${day()}T20:00:00.000Z`) }) },
  async fetchDistributions(symbols) { return symbols.filter(s => catalog[s]).map((symbol, index) => envelope<LiveDistributionRecord>('distribution', symbol, { symbol, exDate: day(), payDate: day(), recordDate: day(), amount: Number((.18 + index * .03).toFixed(3)), distributionType: 'income', revision: 1 }, `${day()}T00:00:00.000Z`)) },
  async fetchHoldings(symbols) { return symbols.filter(s => catalog[s]).flatMap(symbol => ['MSFT','NVDA','AAPL'].map((holdingSymbol, index) => envelope<HoldingRecord>('holding', symbol, { symbol, asOfDate: day(), holdingSymbol, holdingName: holdingSymbol, weightPct: [8.4,7.2,6.5][index], shares: null, marketValue: null }, `${day()}T00:00:00.000Z`))) },
}
