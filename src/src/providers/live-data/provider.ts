import type { DataEnvelope, DataKind, FundRecord, HoldingRecord, ProviderDescriptor, LiveQuoteRecord, NavRecord, LiveDistributionRecord } from '../../domain/live-data/types'

export interface LiveEtfDataProvider {
  descriptor: ProviderDescriptor
  healthCheck(): Promise<{ ok: boolean; latencyMs: number; message: string }>
  fetchFunds(symbols: string[]): Promise<DataEnvelope<FundRecord>[]>
  fetchQuotes(symbols: string[]): Promise<DataEnvelope<LiveQuoteRecord>[]>
  fetchNav(symbols: string[]): Promise<DataEnvelope<NavRecord>[]>
  fetchDistributions(symbols: string[]): Promise<DataEnvelope<LiveDistributionRecord>[]>
  fetchHoldings(symbols: string[]): Promise<DataEnvelope<HoldingRecord>[]>
}

export const providerSupports = (provider: LiveEtfDataProvider, kind: DataKind) => provider.descriptor.capabilities.includes(kind)
