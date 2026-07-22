import type { Holding } from '../../types/portfolio'

export type RiskTolerance = 'Conservative' | 'Moderate' | 'Growth' | 'Aggressive'
export type OnboardingProfile = {
  displayName: string
  retirementAge: number
  weeklyIncomeTarget: number
  annualContribution: number
  reinvestmentPct: number
  cashReserveMonths: number
  riskTolerance: RiskTolerance
  taxRatePct: number
  completedAt?: string
}

export type CsvImportResult = {
  holdings: Array<Omit<Holding, 'id'>>
  warnings: string[]
  rejectedRows: number
}

const aliases: Record<string, string[]> = {
  ticker: ['ticker', 'symbol', 'security symbol'],
  fundName: ['fund name', 'name', 'description', 'security name'],
  shares: ['shares', 'quantity', 'qty'],
  averageCost: ['average cost', 'avg cost', 'cost basis per share', 'unit cost'],
  currentPrice: ['current price', 'price', 'market price', 'last price'],
  annualDistributionPerShare: ['annual distribution per share', 'annual dividend', 'annual income per share', 'distribution'],
  paymentFrequency: ['payment frequency', 'frequency', 'distribution frequency'],
  category: ['category', 'strategy', 'asset class'],
}

function splitCsvLine(line: string) {
  const cells: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"' && line[i + 1] === '"' && quoted) {
      current += '"'; i += 1
    } else if (char === '"') quoted = !quoted
    else if (char === ',' && !quoted) { cells.push(current.trim()); current = '' }
    else current += char
  }
  cells.push(current.trim())
  return cells
}

function normalizedHeader(value: string) { return value.trim().toLowerCase() }
function findColumn(headers: string[], key: keyof typeof aliases) {
  return headers.findIndex((header) => aliases[key].includes(normalizedHeader(header)))
}
function numberValue(value: string | undefined) {
  const parsed = Number((value ?? '').replace(/[$,%]/g, '').replace(/,/g, '').trim())
  return Number.isFinite(parsed) ? parsed : 0
}
function frequency(value: string | undefined): Holding['paymentFrequency'] {
  const normalized = (value ?? '').toLowerCase()
  if (normalized.startsWith('month')) return 'Monthly'
  if (normalized.startsWith('quarter')) return 'Quarterly'
  return 'Weekly'
}

export function parsePortfolioCsv(text: string): CsvImportResult {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) return { holdings: [], warnings: ['CSV must include a header and at least one holding.'], rejectedRows: 0 }
  const headers = splitCsvLine(lines[0])
  const columns = Object.fromEntries(Object.keys(aliases).map((key) => [key, findColumn(headers, key as keyof typeof aliases)])) as Record<keyof typeof aliases, number>
  const warnings: string[] = []
  if (columns.ticker < 0 || columns.shares < 0) {
    return { holdings: [], warnings: ['Required columns were not found. Include ticker/symbol and shares/quantity.'], rejectedRows: lines.length - 1 }
  }
  const holdings: Array<Omit<Holding, 'id'>> = []
  let rejectedRows = 0
  lines.slice(1).forEach((line, index) => {
    const cells = splitCsvLine(line)
    const ticker = (cells[columns.ticker] ?? '').trim().toUpperCase()
    const shares = numberValue(cells[columns.shares])
    if (!ticker || shares <= 0) { rejectedRows += 1; warnings.push(`Row ${index + 2} rejected: ticker and positive shares are required.`); return }
    const currentPrice = columns.currentPrice >= 0 ? numberValue(cells[columns.currentPrice]) : 0
    const averageCost = columns.averageCost >= 0 ? numberValue(cells[columns.averageCost]) : currentPrice
    holdings.push({
      ticker,
      fundName: columns.fundName >= 0 ? cells[columns.fundName] || `${ticker} ETF` : `${ticker} ETF`,
      shares,
      averageCost,
      currentPrice,
      annualDistributionPerShare: columns.annualDistributionPerShare >= 0 ? numberValue(cells[columns.annualDistributionPerShare]) : 0,
      paymentFrequency: columns.paymentFrequency >= 0 ? frequency(cells[columns.paymentFrequency]) : 'Weekly',
      category: columns.category >= 0 ? cells[columns.category] || 'Unclassified' : 'Unclassified',
    })
  })
  if (columns.currentPrice < 0) warnings.push('Current price was not mapped; imported holdings use $0 until enriched by the live data platform.')
  if (columns.annualDistributionPerShare < 0) warnings.push('Annual distribution was not mapped; income projections remain incomplete until enriched.')
  return { holdings, warnings, rejectedRows }
}

export const sampleCsv = `ticker,fund name,shares,average cost,current price,annual distribution per share,payment frequency,category
EDGQ,Income & Growth ETF,1150,28.15,29.04,3.72,Weekly,Equity Income
XDTE,S&P 500 0DTE Covered Call,800,49.45,51.88,10.92,Weekly,Covered Call`

export function onboardingReadiness(profile: OnboardingProfile, holdings: Holding[]) {
  const checks = [
    Boolean(profile.displayName.trim()),
    profile.weeklyIncomeTarget > 0,
    profile.retirementAge >= 50,
    profile.reinvestmentPct >= 0 && profile.reinvestmentPct <= 100,
    holdings.length > 0,
    holdings.every((holding) => holding.shares > 0),
    holdings.some((holding) => holding.currentPrice > 0),
    holdings.some((holding) => holding.annualDistributionPerShare > 0),
  ]
  return Math.round(checks.filter(Boolean).length / checks.length * 100)
}
