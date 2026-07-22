import type { ChangeEvent, HoldingsSnapshot, NavObservation, PriceBar } from './types'

export function detectPriceAnomalies(prices: PriceBar[], thresholdPct = 8): ChangeEvent[] {
  const groups = new Map<string, PriceBar[]>()
  prices.forEach(row => groups.set(row.fundId, [...(groups.get(row.fundId) ?? []), row]))
  const events: ChangeEvent[] = []
  groups.forEach((rows, fundId) => {
    const ordered = [...rows].sort((a, b) => a.date.localeCompare(b.date))
    ordered.slice(1).forEach((row, index) => {
      const previous = ordered[index]
      const change = ((row.adjustedClose - previous.adjustedClose) / previous.adjustedClose) * 100
      if (Math.abs(change) >= thresholdPct) events.push({ id: `price-${fundId}-${row.date}`, fundId, detectedAt: `${row.date}T23:59:59Z`, entity: 'price', field: 'adjustedClose', previousValue: previous.adjustedClose, currentValue: row.adjustedClose, severity: Math.abs(change) >= thresholdPct * 1.5 ? 'critical' : 'warning', rule: `absolute-return>=${thresholdPct}%` })
    })
  })
  return events
}

export function detectPremiumDiscountBreaches(rows: NavObservation[], thresholdPct = 1): ChangeEvent[] {
  return rows.filter(row => Math.abs(row.premiumDiscountPct) >= thresholdPct).map(row => ({ id: `nav-${row.fundId}-${row.date}`, fundId: row.fundId, detectedAt: `${row.date}T23:59:59Z`, entity: 'nav' as const, field: 'premiumDiscountPct', currentValue: row.premiumDiscountPct, severity: Math.abs(row.premiumDiscountPct) >= thresholdPct * 2 ? 'critical' as const : 'warning' as const, rule: `absolute-premium-discount>=${thresholdPct}%` }))
}

export function detectHoldingsGaps(rows: HoldingsSnapshot[], maxGapDays = 45): ChangeEvent[] {
  const events: ChangeEvent[] = []
  const groups = new Map<string, HoldingsSnapshot[]>()
  rows.forEach(row => groups.set(row.fundId, [...(groups.get(row.fundId) ?? []), row]))
  groups.forEach((items, fundId) => {
    const ordered = [...items].sort((a, b) => a.asOfDate.localeCompare(b.asOfDate))
    ordered.slice(1).forEach((row, index) => {
      const gap = (new Date(row.asOfDate).getTime() - new Date(ordered[index].asOfDate).getTime()) / 86400000
      if (gap > maxGapDays) events.push({ id: `gap-${fundId}-${row.asOfDate}`, fundId, detectedAt: `${row.asOfDate}T00:00:00Z`, entity: 'holdings', field: 'snapshotGapDays', previousValue: ordered[index].asOfDate, currentValue: gap, severity: gap > maxGapDays * 2 ? 'critical' : 'warning', rule: `snapshot-gap>${maxGapDays}days` })
    })
  })
  return events
}
