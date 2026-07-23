import type { UniverseDistributionRecord } from '../program-a/types'
import type { DistributionStatistics } from './types'

const round = (value: number, digits = 2) => Number(value.toFixed(digits))

export function analyzeDistributions(records: UniverseDistributionRecord[], etfId: string): DistributionStatistics {
  const rows = records.filter(item => item.etfId === etfId).sort((a, b) => a.exDate.localeCompare(b.exDate))
  const amounts = rows.map(item => item.amount)
  const total = amounts.reduce((sum, value) => sum + value, 0)
  const average = amounts.length ? total / amounts.length : 0
  const variance = amounts.length ? amounts.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / amounts.length : 0
  const coefficient = average ? Math.sqrt(variance) / average : 1
  const consistencyScore = Math.max(0, Math.min(100, Math.round(100 - coefficient * 100)))
  const first = amounts.at(0) ?? 0
  const latest = amounts.at(-1) ?? 0
  const growthScore = first > 0 ? Math.max(0, Math.min(100, Math.round(50 + ((latest - first) / first) * 100))) : 0

  return {
    etfId,
    paymentCount: rows.length,
    trailingTwelveMonthTotal: round(total, 4),
    averagePayment: round(average, 4),
    latestPayment: rows.at(-1)?.amount,
    consistencyScore,
    growthScore,
    cadenceConfidence: rows.length >= 8 ? 100 : Math.round((rows.length / 8) * 100),
  }
}
