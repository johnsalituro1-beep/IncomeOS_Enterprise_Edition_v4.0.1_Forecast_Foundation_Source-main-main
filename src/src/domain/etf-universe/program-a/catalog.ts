import type { EtfMasterRecord, UniverseCoverageMetrics, UniverseSnapshot } from './types'

export const PROGRAM_A_SEED: UniverseSnapshot = {
  generatedAt: new Date().toISOString(),
  records: [
    {
      id: 'etf-edgq', ticker: 'EDGQ', name: 'Income & Growth ETF', issuer: 'Development Issuer', exchange: 'NASDAQ',
      listingStatus: 'active', assetClass: 'Equity', category: 'Equity Income', strategy: 'Income + Growth',
      distributionFrequency: 'Weekly', expenseRatioPct: 0.53, tags: ['weekly', 'income', 'growth'], evidence: 'modeled',
      sourceId: 'development-seed', updatedAt: new Date().toISOString(),
    },
    {
      id: 'etf-xdte', ticker: 'XDTE', name: 'S&P 500 0DTE Covered Call ETF', issuer: 'Development Issuer', exchange: 'CBOE',
      listingStatus: 'active', assetClass: 'Equity', category: 'Covered Call', strategy: '0DTE Covered Call',
      benchmark: 'S&P 500', distributionFrequency: 'Weekly', optionsStrategy: '0DTE covered call',
      tags: ['weekly', 'options', 'large cap'], evidence: 'modeled', sourceId: 'development-seed', updatedAt: new Date().toISOString(),
    },
    {
      id: 'etf-kyld', ticker: 'KYLD', name: 'Yield Premium Strategy ETF', issuer: 'Development Issuer', exchange: 'NYSE Arca',
      listingStatus: 'active', assetClass: 'Equity', category: 'Covered Call', strategy: 'Yield Premium',
      distributionFrequency: 'Weekly', optionsStrategy: 'Covered call', tags: ['weekly', 'income', 'options'],
      evidence: 'modeled', sourceId: 'development-seed', updatedAt: new Date().toISOString(),
    },
    {
      id: 'etf-bccc', ticker: 'BCCC', name: 'Crypto Income Strategy ETF', issuer: 'Development Issuer', exchange: 'NASDAQ',
      listingStatus: 'active', assetClass: 'Alternatives', category: 'Crypto Income', strategy: 'Options Income',
      distributionFrequency: 'Weekly', optionsStrategy: 'Synthetic options income', tags: ['crypto', 'weekly', 'income'],
      evidence: 'modeled', sourceId: 'development-seed', updatedAt: new Date().toISOString(),
    },
  ],
  distributions: [
    { id: 'dist-edgq-1', etfId: 'etf-edgq', exDate: '2026-07-17', payDate: '2026-07-18', amount: 0.08, currency: 'USD', type: 'income', evidence: 'modeled' },
    { id: 'dist-xdte-1', etfId: 'etf-xdte', exDate: '2026-07-17', payDate: '2026-07-18', amount: 0.21, currency: 'USD', type: 'mixed', evidence: 'modeled' },
    { id: 'dist-kyld-1', etfId: 'etf-kyld', exDate: '2026-07-17', payDate: '2026-07-18', amount: 0.16, currency: 'USD', type: 'mixed', evidence: 'modeled' },
  ],
  holdings: [
    { id: 'hold-edgq-1', etfId: 'etf-edgq', asOfDate: '2026-07-18', symbol: 'DEMO1', name: 'Development Holding One', weightPct: 11.8, sector: 'Technology', country: 'United States', evidence: 'modeled' },
    { id: 'hold-edgq-2', etfId: 'etf-edgq', asOfDate: '2026-07-18', symbol: 'DEMO2', name: 'Development Holding Two', weightPct: 9.4, sector: 'Communication Services', country: 'United States', evidence: 'modeled' },
    { id: 'hold-xdte-1', etfId: 'etf-xdte', asOfDate: '2026-07-18', name: 'S&P 500 reference basket', weightPct: 100, assetType: 'Index exposure', evidence: 'modeled' },
  ],
  exposures: [
    { etfId: 'etf-edgq', asOfDate: '2026-07-18', sectors: [{ name: 'Technology', weightPct: 42 }, { name: 'Communication Services', weightPct: 18 }], countries: [{ name: 'United States', weightPct: 94 }], assetTypes: [{ name: 'Equity', weightPct: 100 }], evidence: 'modeled' },
  ],
  relationships: [
    { id: 'rel-edgq-xdte', fromEtfId: 'etf-edgq', toEtfId: 'etf-xdte', type: 'income-peer', strength: 0.72, explanation: 'Both target recurring equity income but use different portfolio construction methods.', evidence: 'modeled' },
    { id: 'rel-xdte-kyld', fromEtfId: 'etf-xdte', toEtfId: 'etf-kyld', type: 'similar-strategy', strength: 0.84, explanation: 'Both use options overlays to pursue frequent distributions.', evidence: 'modeled' },
    { id: 'rel-edgq-bccc', fromEtfId: 'etf-edgq', toEtfId: 'etf-bccc', type: 'portfolio-complement', strength: 0.41, explanation: 'Different underlying exposures may diversify income sources while increasing complexity.', evidence: 'modeled' },
  ],
}

export function calculateCoverage(snapshot: UniverseSnapshot): UniverseCoverageMetrics {
  const idsWithDistributions = new Set(snapshot.distributions.map(item => item.etfId))
  const idsWithHoldings = new Set(snapshot.holdings.map(item => item.etfId))
  const idsWithRelationships = new Set(snapshot.relationships.flatMap(item => [item.fromEtfId, item.toEtfId]))
  const totalFunds = snapshot.records.length
  const verifiedFunds = snapshot.records.filter(item => item.evidence === 'verified').length
  const populatedFields = snapshot.records.reduce((sum, item) => {
    const fields = [item.ticker, item.name, item.issuer, item.exchange, item.assetClass, item.category, item.strategy, item.distributionFrequency]
    return sum + fields.filter(Boolean).length
  }, 0)
  const maximumFields = Math.max(1, totalFunds * 8)

  return {
    totalFunds,
    activeFunds: snapshot.records.filter(item => item.listingStatus === 'active').length,
    verifiedFunds,
    fundsWithDistributions: idsWithDistributions.size,
    fundsWithHoldings: idsWithHoldings.size,
    fundsWithRelationships: idsWithRelationships.size,
    criticalIssues: 0,
    completenessPct: Math.round((populatedFields / maximumFields) * 100),
    verificationPct: totalFunds ? Math.round((verifiedFunds / totalFunds) * 100) : 0,
    relationshipCoveragePct: totalFunds ? Math.round((idsWithRelationships.size / totalFunds) * 100) : 0,
  }
}

export function searchCatalog(records: EtfMasterRecord[], query: string, filters?: { assetClass?: string; frequency?: string; evidence?: string }) {
  const normalized = query.trim().toLowerCase()
  return records.filter(record => {
    const text = [record.ticker, record.name, record.issuer, record.exchange, record.assetClass, record.category, record.strategy, record.benchmark, ...record.tags].filter(Boolean).join(' ').toLowerCase()
    return (!normalized || text.includes(normalized))
      && (!filters?.assetClass || filters.assetClass === 'All' || record.assetClass === filters.assetClass)
      && (!filters?.frequency || filters.frequency === 'All' || record.distributionFrequency === filters.frequency)
      && (!filters?.evidence || filters.evidence === 'All' || record.evidence === filters.evidence)
  })
}
