import type { ChangeEvent, HistoricalWarehouse, HoldingsSnapshot, IngestionRun, NavObservation, PriceBar } from './types'

const round = (value: number, decimals = 2) => Number(value.toFixed(decimals))

export function buildPhaseTwoSeed(fundIds: string[]): HistoricalWarehouse {
  const prices: PriceBar[] = []
  const nav: NavObservation[] = []
  const holdingsSnapshots: HoldingsSnapshot[] = []
  const changeEvents: ChangeEvent[] = []
  const start = new Date('2026-01-05T00:00:00Z')

  fundIds.forEach((fundId, fundIndex) => {
    let price = 24 + fundIndex * 3.75
    for (let day = 0; day < 26; day += 1) {
      const date = new Date(start)
      date.setUTCDate(start.getUTCDate() + day * 7)
      const drift = 0.0018 + fundIndex * 0.0003
      const wave = Math.sin((day + fundIndex) / 2.8) * 0.012
      const open = price
      const close = open * (1 + drift + wave)
      prices.push({ fundId, date: date.toISOString().slice(0, 10), open: round(open), high: round(Math.max(open, close) * 1.008), low: round(Math.min(open, close) * 0.992), close: round(close), adjustedClose: round(close), volume: 160000 + fundIndex * 72000 + day * 3500, sourceId: 'source-development-history', evidence: 'modeled' })
      const fundNav = close * (1 + Math.sin(day / 3.5) * 0.0025)
      nav.push({ fundId, date: date.toISOString().slice(0, 10), nav: round(fundNav, 4), marketPrice: round(close, 4), premiumDiscountPct: round(((close - fundNav) / fundNav) * 100, 3), sourceId: 'source-development-history', evidence: 'modeled' })
      price = close
    }

    for (let month = 0; month < 6; month += 1) {
      const asOf = new Date(Date.UTC(2026, month, 28)).toISOString().slice(0, 10)
      holdingsSnapshots.push({ fundId, asOfDate: asOf, snapshotId: `${fundId}-${asOf}`, holdingCount: 22 + fundIndex * 7 + month, reportedWeightPct: round(98.2 + Math.sin(month) * 0.8), sourceId: 'source-development-holdings', contentHash: `dev-${fundId}-${month}-8f3a`, evidence: 'modeled' })
    }
  })

  const selected = fundIds[0]
  if (selected) {
    changeEvents.push(
      { id: 'chg-001', fundId: selected, detectedAt: '2026-07-18T04:05:00Z', entity: 'holdings', field: 'topHoldingWeight', previousValue: 8.7, currentValue: 10.4, severity: 'warning', rule: 'absolute-weight-change>1.5pct' },
      { id: 'chg-002', fundId: selected, detectedAt: '2026-07-18T04:05:00Z', entity: 'distribution', field: 'amount', previousValue: 0.214, currentValue: 0.181, severity: 'warning', rule: 'distribution-change>12pct' },
    )
  }

  const ingestionRuns: IngestionRun[] = [
    { id: 'run-price-20260720', dataset: 'daily-prices', startedAt: '2026-07-20T02:00:00Z', completedAt: '2026-07-20T02:01:18Z', status: 'succeeded', received: prices.length, accepted: prices.length, rejected: 0, warnings: 0, sourceId: 'source-development-history' },
    { id: 'run-nav-20260720', dataset: 'daily-nav', startedAt: '2026-07-20T02:05:00Z', completedAt: '2026-07-20T02:06:04Z', status: 'succeeded', received: nav.length, accepted: nav.length, rejected: 0, warnings: 2, sourceId: 'source-development-history' },
    { id: 'run-holdings-20260718', dataset: 'holdings-snapshots', startedAt: '2026-07-18T04:00:00Z', completedAt: '2026-07-18T04:05:32Z', status: 'succeeded', received: holdingsSnapshots.length, accepted: holdingsSnapshots.length, rejected: 0, warnings: changeEvents.length, sourceId: 'source-development-holdings' },
  ]

  return {
    prices,
    nav,
    holdingsSnapshots,
    changeEvents,
    ingestionRuns,
    distributionRevisions: fundIds.slice(0, 4).flatMap((fundId, index) => [
      { fundId, exDate: '2026-06-12', revision: 1, amount: round(0.16 + index * 0.018, 4), distributionType: 'income', announcedAt: '2026-06-10T20:00:00Z', sourceId: 'source-development-distributions', evidence: 'modeled' as const },
      { fundId, exDate: '2026-06-12', revision: 2, amount: round(0.158 + index * 0.018, 4), distributionType: 'mixed', announcedAt: '2026-06-11T22:00:00Z', supersedesRevision: 1, sourceId: 'source-development-distributions', evidence: 'modeled' as const },
    ]),
    corporateActions: fundIds.slice(0, 2).map((fundId, index) => ({ fundId, effectiveDate: `2026-0${index + 3}-01`, type: index === 0 ? 'fee-change' as const : 'name-change' as const, oldValue: index === 0 ? '0.95%' : 'Development Fund Series A', newValue: index === 0 ? '0.89%' : 'Development Income Series', sourceId: 'source-development-actions', evidence: 'modeled' as const })),
    lineage: [
      { sourceId: 'source-development-history', provider: 'Offline Development Generator', dataset: 'Price and NAV history', acquiredAt: '2026-07-20T02:00:00Z', licenseClass: 'development', checksum: 'sha256-dev-history-41ac', recordCount: prices.length + nav.length },
      { sourceId: 'source-development-holdings', provider: 'Offline Development Generator', dataset: 'Holdings snapshots', acquiredAt: '2026-07-18T04:00:00Z', licenseClass: 'development', checksum: 'sha256-dev-holdings-9d21', recordCount: holdingsSnapshots.length },
      { sourceId: 'source-development-distributions', provider: 'Offline Development Generator', dataset: 'Distribution revisions', acquiredAt: '2026-06-11T22:00:00Z', licenseClass: 'development', checksum: 'sha256-dev-dist-3be8', recordCount: 8 },
      { sourceId: 'source-development-actions', provider: 'Offline Development Generator', dataset: 'Corporate actions', acquiredAt: '2026-06-01T00:00:00Z', licenseClass: 'development', checksum: 'sha256-dev-actions-4412', recordCount: 2 },
    ],
  }
}

export function warehouseCoverage(warehouse: HistoricalWarehouse, fundIds: string[]) {
  const covered = (rows: Array<{ fundId: string }>) => new Set(rows.map(row => row.fundId)).size
  return {
    priceRecords: warehouse.prices.length,
    navRecords: warehouse.nav.length,
    holdingsSnapshots: warehouse.holdingsSnapshots.length,
    fundCoveragePct: fundIds.length ? Math.round((covered(warehouse.prices) / fundIds.length) * 100) : 0,
    lineageCoveragePct: warehouse.lineage.length ? 100 : 0,
    successfulRuns: warehouse.ingestionRuns.filter(run => run.status === 'succeeded').length,
  }
}

export function latestPrice(prices: PriceBar[], fundId: string) {
  return prices.filter(row => row.fundId === fundId).sort((a, b) => b.date.localeCompare(a.date))[0]
}

export function priceHistory(prices: PriceBar[], fundId: string) {
  return prices.filter(row => row.fundId === fundId).sort((a, b) => a.date.localeCompare(b.date))
}

export function navHistory(rows: NavObservation[], fundId: string) {
  return rows.filter(row => row.fundId === fundId).sort((a, b) => a.date.localeCompare(b.date))
}

export function holdingsHistory(rows: HoldingsSnapshot[], fundId: string) {
  return rows.filter(row => row.fundId === fundId).sort((a, b) => b.asOfDate.localeCompare(a.asOfDate))
}
