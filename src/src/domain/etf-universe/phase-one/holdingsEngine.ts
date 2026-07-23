import type { ExposureSnapshot, HoldingRecord } from '../program-a/types'
import type { NormalizedExposure } from './types'

export function latestHoldingsByFund(holdings: HoldingRecord[], etfId: string): HoldingRecord[] {
  const rows = holdings.filter(item => item.etfId === etfId)
  const latest = rows.reduce((max, item) => item.asOfDate > max ? item.asOfDate : max, '')
  return rows.filter(item => item.asOfDate === latest).sort((a, b) => b.weightPct - a.weightPct)
}

export function normalizeExposures(snapshots: ExposureSnapshot[]): NormalizedExposure[] {
  return snapshots.flatMap(snapshot => [
    ...snapshot.sectors.map(item => ({ etfId: snapshot.etfId, asOfDate: snapshot.asOfDate, dimension: 'sector' as const, name: item.name, weightPct: item.weightPct, evidence: snapshot.evidence })),
    ...snapshot.countries.map(item => ({ etfId: snapshot.etfId, asOfDate: snapshot.asOfDate, dimension: 'country' as const, name: item.name, weightPct: item.weightPct, evidence: snapshot.evidence })),
    ...snapshot.assetTypes.map(item => ({ etfId: snapshot.etfId, asOfDate: snapshot.asOfDate, dimension: 'asset-class' as const, name: item.name, weightPct: item.weightPct, evidence: snapshot.evidence })),
  ])
}

export function holdingsCoverage(holdings: HoldingRecord[], etfIds: string[]) {
  const covered = new Set(holdings.map(item => item.etfId))
  return {
    coveredFunds: etfIds.filter(id => covered.has(id)).length,
    totalFunds: etfIds.length,
    coveragePct: etfIds.length ? Math.round((etfIds.filter(id => covered.has(id)).length / etfIds.length) * 100) : 0,
  }
}
