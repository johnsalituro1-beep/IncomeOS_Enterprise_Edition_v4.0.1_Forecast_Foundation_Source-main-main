import type { EtfMasterRecord, UniverseSnapshot } from '../program-a/types'
import { analyzeDistributions } from './distributionIntelligence'
import type { EtfScorecard, EtfScoreComponent } from './types'

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

export function scoreEtf(record: EtfMasterRecord, snapshot: UniverseSnapshot): EtfScorecard {
  const distributions = analyzeDistributions(snapshot.distributions, record.id)
  const holdings = snapshot.holdings.filter(item => item.etfId === record.id)
  const relationshipCount = snapshot.relationships.filter(item => item.fromEtfId === record.id || item.toEtfId === record.id).length
  const expense = record.expenseRatioPct
  const components: EtfScoreComponent[] = [
    { key: 'income', label: 'Income', score: clamp((record.distributionFrequency === 'Weekly' ? 80 : record.distributionFrequency === 'Monthly' ? 65 : 45) + distributions.consistencyScore * 0.2), rationale: 'Combines distribution cadence and observed payment consistency.', evidence: distributions.paymentCount ? 'modeled' : 'missing' },
    { key: 'growth', label: 'Growth', score: clamp(record.strategy.toLowerCase().includes('growth') ? 76 : record.optionsStrategy ? 48 : 62), rationale: 'Strategy classification is used until verified return history is loaded.', evidence: record.evidence },
    { key: 'stability', label: 'Stability', score: clamp(distributions.paymentCount ? distributions.consistencyScore : 35), rationale: 'Payment variability is the current stability proxy.', evidence: distributions.paymentCount ? 'modeled' : 'missing' },
    { key: 'diversification', label: 'Diversification', score: clamp(35 + Math.min(45, holdings.length * 7) + Math.min(20, relationshipCount * 4)), rationale: 'Rewards holdings breadth and documented graph connectivity.', evidence: holdings.length ? 'modeled' : 'missing' },
    { key: 'liquidity', label: 'Liquidity', score: clamp(record.averageDailyVolume ? Math.log10(record.averageDailyVolume + 1) * 18 : 30), rationale: 'Uses average daily volume when available.', evidence: record.averageDailyVolume ? record.evidence : 'missing' },
    { key: 'expense-efficiency', label: 'Expense Efficiency', score: clamp(expense == null ? 35 : 100 - expense * 75), rationale: 'Lower expense ratios receive higher scores.', evidence: expense == null ? 'missing' : record.evidence },
    { key: 'risk', label: 'Risk Control', score: clamp(record.assetClass === 'Alternatives' ? 38 : record.optionsStrategy ? 56 : 68), rationale: 'Temporary strategy-based risk proxy pending verified volatility and drawdown history.', evidence: 'modeled' },
    { key: 'portfolio-fit', label: 'Portfolio Fit', score: clamp(45 + relationshipCount * 7), rationale: 'Measures the amount of explainable peer and complement context available.', evidence: relationshipCount ? 'modeled' : 'missing' },
  ]
  return {
    etfId: record.id,
    overall: Math.round(components.reduce((sum, component) => sum + component.score, 0) / components.length),
    components,
    generatedAt: new Date().toISOString(),
    methodologyVersion: 'program-a-phase-1.0',
  }
}
