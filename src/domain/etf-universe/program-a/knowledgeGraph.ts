import type { EtfMasterRecord, EtfRelationship, HoldingRecord } from './types'

function holdingSet(holdings: HoldingRecord[], etfId: string) {
  return new Set(holdings.filter(item => item.etfId === etfId).map(item => item.symbol || item.name.toLowerCase()))
}

function jaccard(a: Set<string>, b: Set<string>) {
  const union = new Set([...a, ...b])
  if (!union.size) return 0
  const intersection = [...a].filter(item => b.has(item)).length
  return intersection / union.size
}

export function generateRelationships(records: EtfMasterRecord[], holdings: HoldingRecord[]): EtfRelationship[] {
  const relationships: EtfRelationship[] = []
  for (let i = 0; i < records.length; i += 1) {
    for (let j = i + 1; j < records.length; j += 1) {
      const left = records[i]
      const right = records[j]
      if (left.issuer === right.issuer) relationships.push(makeRelationship(left, right, 'same-issuer', 0.65, 'Funds share the same issuer.'))
      if (left.benchmark && left.benchmark === right.benchmark) relationships.push(makeRelationship(left, right, 'same-benchmark', 0.95, 'Funds reference the same benchmark.'))
      if (left.strategy === right.strategy || left.category === right.category) relationships.push(makeRelationship(left, right, 'similar-strategy', left.strategy === right.strategy ? 0.9 : 0.7, 'Funds use a related strategy or category.'))
      if (left.distributionFrequency === right.distributionFrequency && left.distributionFrequency !== 'None') relationships.push(makeRelationship(left, right, 'income-peer', 0.55, 'Funds use the same distribution cadence.'))
      const overlap = jaccard(holdingSet(holdings, left.id), holdingSet(holdings, right.id))
      if (overlap > 0) relationships.push(makeRelationship(left, right, 'holdings-overlap', overlap, `Current loaded holdings have ${(overlap * 100).toFixed(0)}% symbol overlap.`))
    }
  }
  return relationships
}

function makeRelationship(left: EtfMasterRecord, right: EtfMasterRecord, type: EtfRelationship['type'], strength: number, explanation: string): EtfRelationship {
  return {
    id: `${type}-${left.id}-${right.id}`,
    fromEtfId: left.id,
    toEtfId: right.id,
    type,
    strength,
    explanation,
    evidence: left.evidence === 'verified' && right.evidence === 'verified' ? 'verified' : 'modeled',
    asOfDate: new Date().toISOString().slice(0, 10),
  }
}
