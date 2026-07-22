import type { Holding } from '../../types/portfolio'

export type HoldingDraft = Omit<Holding, 'id'>
export type ValidationResult = { valid: true; holding: HoldingDraft } | { valid: false; errors: string[] }

const frequencies: Holding['paymentFrequency'][] = ['Weekly', 'Monthly', 'Quarterly']

export function validateHolding(input: Partial<HoldingDraft>): ValidationResult {
  const errors: string[] = []
  const ticker = String(input.ticker ?? '').trim().toUpperCase()
  const fundName = String(input.fundName ?? '').trim()
  const shares = Number(input.shares)
  const averageCost = Number(input.averageCost)
  const currentPrice = Number(input.currentPrice)
  const annualDistributionPerShare = Number(input.annualDistributionPerShare)
  const paymentFrequency = input.paymentFrequency ?? 'Monthly'
  const category = String(input.category ?? 'Other').trim() || 'Other'

  if (!/^[A-Z][A-Z0-9.-]{0,9}$/.test(ticker)) errors.push('Enter a valid ticker symbol.')
  if (!fundName) errors.push('Fund name is required.')
  if (!Number.isFinite(shares) || shares <= 0) errors.push('Shares must be greater than zero.')
  if (!Number.isFinite(averageCost) || averageCost < 0) errors.push('Average cost cannot be negative.')
  if (!Number.isFinite(currentPrice) || currentPrice < 0) errors.push('Current price cannot be negative.')
  if (!Number.isFinite(annualDistributionPerShare) || annualDistributionPerShare < 0) errors.push('Annual distribution cannot be negative.')
  if (!frequencies.includes(paymentFrequency)) errors.push('Select a supported payment frequency.')

  if (errors.length) return { valid: false, errors }
  return { valid: true, holding: { ticker, fundName, shares, averageCost, currentPrice, annualDistributionPerShare, paymentFrequency, category } }
}

export function portfolioDataQuality(holdings: Holding[]) {
  if (!holdings.length) return { score: 0, issues: ['No holdings have been added.'], complete: 0, total: 0 }
  const issues: string[] = []
  let complete = 0
  for (const holding of holdings) {
    const missing: string[] = []
    if (holding.currentPrice <= 0) missing.push('price')
    if (holding.averageCost <= 0) missing.push('cost basis')
    if (holding.annualDistributionPerShare <= 0) missing.push('distribution')
    if (missing.length) issues.push(`${holding.ticker}: missing ${missing.join(', ')}`)
    else complete += 1
  }
  return { score: Math.round((complete / holdings.length) * 100), issues, complete, total: holdings.length }
}

function csvCell(value: string | number) {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function holdingsToCsv(holdings: Holding[]) {
  const header = ['ticker','fundName','shares','averageCost','currentPrice','annualDistributionPerShare','paymentFrequency','category']
  const rows = holdings.map((holding) => header.map((key) => csvCell(holding[key as keyof Holding] as string | number)).join(','))
  return [header.join(','), ...rows].join('\n')
}
