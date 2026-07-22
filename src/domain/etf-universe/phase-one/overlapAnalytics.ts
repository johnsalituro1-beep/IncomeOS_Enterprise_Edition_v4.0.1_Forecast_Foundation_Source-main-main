import type { EtfMasterRecord, ExposureSnapshot, HoldingRecord } from '../program-a/types'
import type { OverlapResult } from './types'

function weightedOverlap(left: Array<{ name: string; weightPct: number }>, right: Array<{ name: string; weightPct: number }>) {
  const rightMap = new Map(right.map(item => [item.name.toLowerCase(), item.weightPct]))
  return left.reduce((sum, item) => sum + Math.min(item.weightPct, rightMap.get(item.name.toLowerCase()) ?? 0), 0)
}

function holdingOverlap(left: HoldingRecord[], right: HoldingRecord[]) {
  const rightMap = new Map(right.map(item => [(item.symbol || item.name).toLowerCase(), item.weightPct]))
  const shared = left.filter(item => rightMap.has((item.symbol || item.name).toLowerCase()))
  return {
    pct: shared.reduce((sum, item) => sum + Math.min(item.weightPct, rightMap.get((item.symbol || item.name).toLowerCase()) ?? 0), 0),
    names: shared.map(item => item.symbol || item.name),
  }
}

export function compareEtfs(left: EtfMasterRecord, right: EtfMasterRecord, holdings: HoldingRecord[], exposures: ExposureSnapshot[]): OverlapResult {
  const leftHoldings = holdings.filter(item => item.etfId === left.id)
  const rightHoldings = holdings.filter(item => item.etfId === right.id)
  const overlap = holdingOverlap(leftHoldings, rightHoldings)
  const leftExposure = exposures.find(item => item.etfId === left.id)
  const rightExposure = exposures.find(item => item.etfId === right.id)
  const sectorOverlapPct = weightedOverlap(leftExposure?.sectors ?? [], rightExposure?.sectors ?? [])
  const countryOverlapPct = weightedOverlap(leftExposure?.countries ?? [], rightExposure?.countries ?? [])
  const matching = [left.assetClass === right.assetClass, left.category === right.category, left.strategy === right.strategy, left.distributionFrequency === right.distributionFrequency].filter(Boolean).length
  const strategySimilarityPct = matching * 25
  const combinedSimilarityPct = Math.round(overlap.pct * 0.45 + sectorOverlapPct * 0.25 + countryOverlapPct * 0.1 + strategySimilarityPct * 0.2)
  return {
    leftEtfId: left.id,
    rightEtfId: right.id,
    holdingsOverlapPct: Math.round(overlap.pct),
    sectorOverlapPct: Math.round(sectorOverlapPct),
    countryOverlapPct: Math.round(countryOverlapPct),
    strategySimilarityPct,
    combinedSimilarityPct,
    sharedHoldings: overlap.names,
    explanation: combinedSimilarityPct >= 70 ? 'High similarity; verify that both funds add a distinct portfolio role.' : combinedSimilarityPct >= 40 ? 'Moderate similarity with meaningful structural differences.' : 'Low similarity; the pair may provide complementary exposures.',
  }
}
