import type { DataQualityIssue, EtfMasterRecord, UniverseSnapshot } from './types'

const REQUIRED_FIELDS: Array<keyof EtfMasterRecord> = ['ticker', 'name', 'issuer', 'exchange', 'assetClass', 'category', 'strategy', 'distributionFrequency']

export function evaluateDataQuality(snapshot: UniverseSnapshot): DataQualityIssue[] {
  const issues: DataQualityIssue[] = []
  const tickerCounts = new Map<string, number>()

  snapshot.records.forEach(record => {
    tickerCounts.set(record.ticker, (tickerCounts.get(record.ticker) ?? 0) + 1)
    REQUIRED_FIELDS.forEach(field => {
      if (!record[field]) {
        issues.push({ id: `missing-${record.id}-${String(field)}`, severity: 'critical', entityType: 'etf', entityId: record.id, field: String(field), message: `${record.ticker} is missing required field ${String(field)}.` })
      }
    })
    if (record.expenseRatioPct !== undefined && (record.expenseRatioPct < 0 || record.expenseRatioPct > 10)) {
      issues.push({ id: `expense-${record.id}`, severity: 'warning', entityType: 'etf', entityId: record.id, field: 'expenseRatioPct', message: `${record.ticker} has an expense ratio outside the expected validation range.` })
    }
    if (record.evidence === 'modeled') {
      issues.push({ id: `modeled-${record.id}`, severity: 'info', entityType: 'etf', entityId: record.id, message: `${record.ticker} remains modeled and must not be presented as verified market data.` })
    }
  })

  tickerCounts.forEach((count, ticker) => {
    if (count > 1) issues.push({ id: `duplicate-${ticker}`, severity: 'critical', entityType: 'etf', entityId: ticker, field: 'ticker', message: `${ticker} appears ${count} times in the master catalog.` })
  })

  snapshot.distributions.forEach(record => {
    if (record.amount < 0) issues.push({ id: `distribution-${record.id}`, severity: 'critical', entityType: 'distribution', entityId: record.id, field: 'amount', message: 'Distribution amount cannot be negative.' })
    if (!snapshot.records.some(etf => etf.id === record.etfId)) issues.push({ id: `orphan-distribution-${record.id}`, severity: 'critical', entityType: 'distribution', entityId: record.id, message: 'Distribution points to an ETF that does not exist.' })
  })

  snapshot.holdings.forEach(record => {
    if (record.weightPct < 0 || record.weightPct > 100) issues.push({ id: `holding-weight-${record.id}`, severity: 'critical', entityType: 'holding', entityId: record.id, field: 'weightPct', message: 'Holding weight must be between 0 and 100.' })
    if (!snapshot.records.some(etf => etf.id === record.etfId)) issues.push({ id: `orphan-holding-${record.id}`, severity: 'critical', entityType: 'holding', entityId: record.id, message: 'Holding points to an ETF that does not exist.' })
  })

  snapshot.relationships.forEach(record => {
    if (record.strength < 0 || record.strength > 1) issues.push({ id: `relationship-strength-${record.id}`, severity: 'critical', entityType: 'relationship', entityId: record.id, field: 'strength', message: 'Relationship strength must be between 0 and 1.' })
  })

  return issues
}

export function qualityScore(issues: DataQualityIssue[]) {
  const penalty = issues.reduce((sum, issue) => sum + (issue.severity === 'critical' ? 15 : issue.severity === 'warning' ? 5 : 1), 0)
  return Math.max(0, 100 - penalty)
}
