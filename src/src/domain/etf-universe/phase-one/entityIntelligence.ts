import type { EtfMasterRecord } from '../program-a/types'
import type { BenchmarkProfile, IssuerProfile, ResearchMetadata } from './types'

export function buildIssuerProfiles(records: EtfMasterRecord[]): IssuerProfile[] {
  const issuers = new Map<string, EtfMasterRecord[]>()
  records.forEach(record => issuers.set(record.issuer, [...(issuers.get(record.issuer) ?? []), record]))
  return [...issuers.entries()].map(([issuer, funds]) => ({
    issuer,
    fundIds: funds.map(fund => fund.id),
    activeFundCount: funds.filter(fund => fund.listingStatus === 'active').length,
    strategies: [...new Set(funds.map(fund => fund.strategy))],
    assetClasses: [...new Set(funds.map(fund => fund.assetClass))],
    totalAumUsd: funds.every(fund => fund.aumUsd != null) ? funds.reduce((sum, fund) => sum + (fund.aumUsd ?? 0), 0) : undefined,
    evidence: funds.every(fund => fund.evidence === 'verified') ? 'verified' : 'modeled',
  }))
}

export function buildBenchmarkProfiles(records: EtfMasterRecord[]): BenchmarkProfile[] {
  const benchmarks = new Map<string, EtfMasterRecord[]>()
  records.filter(record => record.benchmark).forEach(record => benchmarks.set(record.benchmark!, [...(benchmarks.get(record.benchmark!) ?? []), record]))
  return [...benchmarks.entries()].map(([benchmark, funds]) => ({ benchmark, fundIds: funds.map(fund => fund.id), strategyFamilies: [...new Set(funds.map(fund => fund.strategy))], assetClasses: [...new Set(funds.map(fund => fund.assetClass))], evidence: funds.every(fund => fund.evidence === 'verified') ? 'verified' : 'modeled' }))
}

export function buildResearchMetadata(record: EtfMasterRecord): ResearchMetadata {
  const role = record.category.includes('Income') || record.optionsStrategy ? 'Portfolio income sleeve' : 'Core or satellite growth exposure'
  const missing = [record.benchmark, record.expenseRatioPct, record.aumUsd, record.averageDailyVolume].filter(value => value == null).length
  return {
    etfId: record.id,
    portfolioRole: role,
    incomeCharacteristics: `${record.distributionFrequency} distribution profile; ${record.optionsStrategy ?? 'no options-overlay metadata'}.`,
    growthCharacteristics: `${record.strategy} strategy within ${record.assetClass}.`,
    riskNotes: [record.assetClass === 'Alternatives' ? 'Alternative exposure can introduce elevated volatility.' : 'Equity market risk remains present.', record.optionsStrategy ? 'Options overlays can cap upside or change tax character.' : 'No options-overlay risk identified in current metadata.'],
    researchStatus: missing === 0 ? 'ready' : missing <= 2 ? 'partial' : 'blocked',
    providerConfidence: Math.max(0, 100 - missing * 20),
    lastValidationDate: record.sourceAsOf ?? record.updatedAt.slice(0, 10),
    evidence: record.evidence,
  }
}
