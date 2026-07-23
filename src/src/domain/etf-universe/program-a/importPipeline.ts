import type { EtfMasterRecord, EvidenceStatus } from './types'

export type ProviderFieldMap = {
  ticker: string
  name: string
  issuer: string
  exchange?: string
  assetClass?: string
  category?: string
  strategy?: string
  benchmark?: string
  inceptionDate?: string
  expenseRatioPct?: string
  aumUsd?: string
  averageDailyVolume?: string
  distributionFrequency?: string
}

export type ImportResult = {
  accepted: EtfMasterRecord[]
  rejected: Array<{ row: number; reason: string; raw: Record<string, string> }>
  warnings: string[]
}

export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean)
  if (!lines.length) return []
  const headers = splitCsvLine(lines[0])
  return lines.slice(1).map(line => {
    const values = splitCsvLine(line)
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header.trim()] = values[index]?.trim() ?? ''
      return row
    }, {})
  })
}

export function normalizeProviderRows(rows: Record<string, string>[], map: ProviderFieldMap, sourceId: string, evidence: EvidenceStatus = 'provider'): ImportResult {
  const accepted: EtfMasterRecord[] = []
  const rejected: ImportResult['rejected'] = []
  const warnings: string[] = []
  const seen = new Set<string>()

  rows.forEach((row, index) => {
    const ticker = value(row, map.ticker).toUpperCase()
    const name = value(row, map.name)
    const issuer = value(row, map.issuer)
    if (!ticker || !name || !issuer) {
      rejected.push({ row: index + 2, reason: 'Ticker, name, and issuer are required.', raw: row })
      return
    }
    if (seen.has(ticker)) warnings.push(`Duplicate ticker ${ticker} appeared in the import batch.`)
    seen.add(ticker)
    accepted.push({
      id: `etf-${ticker.toLowerCase()}`,
      ticker,
      name,
      issuer,
      exchange: value(row, map.exchange) || 'Unknown',
      listingStatus: 'active',
      assetClass: value(row, map.assetClass) || 'Unclassified',
      category: value(row, map.category) || 'Unclassified',
      strategy: value(row, map.strategy) || 'Unclassified',
      benchmark: value(row, map.benchmark) || undefined,
      inceptionDate: value(row, map.inceptionDate) || undefined,
      expenseRatioPct: numberValue(row, map.expenseRatioPct),
      aumUsd: numberValue(row, map.aumUsd),
      averageDailyVolume: numberValue(row, map.averageDailyVolume),
      distributionFrequency: normalizeFrequency(value(row, map.distributionFrequency)),
      tags: [],
      evidence,
      sourceId,
      sourceAsOf: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString(),
    })
  })

  return { accepted, rejected, warnings }
}

function value(row: Record<string, string>, key?: string) {
  return key ? row[key]?.trim() ?? '' : ''
}

function numberValue(row: Record<string, string>, key?: string) {
  const raw = value(row, key).replace(/[$,%]/g, '').replace(/,/g, '')
  if (!raw) return undefined
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeFrequency(valueToNormalize: string): EtfMasterRecord['distributionFrequency'] {
  const valueLower = valueToNormalize.toLowerCase()
  if (valueLower.includes('week')) return 'Weekly'
  if (valueLower.includes('month')) return 'Monthly'
  if (valueLower.includes('quarter')) return 'Quarterly'
  if (valueLower.includes('semi')) return 'Semiannual'
  if (valueLower.includes('annual')) return 'Annual'
  if (valueLower.includes('irregular')) return 'Irregular'
  if (valueLower.includes('none')) return 'None'
  return 'Unknown'
}

function splitCsvLine(line: string) {
  const values: string[] = []
  let current = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"' && line[index + 1] === '"') {
      current += '"'
      index += 1
    } else if (char === '"') quoted = !quoted
    else if (char === ',' && !quoted) {
      values.push(current)
      current = ''
    } else current += char
  }
  values.push(current)
  return values
}
