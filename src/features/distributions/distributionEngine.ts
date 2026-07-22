import type { CalculatedPosition } from '../portfolio/positionEngine'
import type { DistributionDraft, DistributionFrequency, DistributionRecord, IncomeEvent } from '../../types/distribution'

export type { DistributionDraft, DistributionFrequency, DistributionRecord, DistributionStatus, IncomeEvent } from '../../types/distribution'

export type HoldingIncomeProjection = {
  ticker: string
  shares: number
  annualIncome: number
  monthlyIncome: number
  weeklyIncome: number
  forwardYieldPct: number
  yieldOnCostPct: number
  nextPaymentDate: string | null
  dataStatus: 'declared' | 'history' | 'holding-assumption' | 'missing'
}

export type IncomeProjection = {
  events: IncomeEvent[]
  holdings: HoldingIncomeProjection[]
  annualIncome: number
  monthlyIncome: number
  weeklyIncome: number
  confirmedNext90Days: number
  projectedNext90Days: number
  warnings: string[]
}

const DAY = 86_400_000
const cadenceDays: Record<Exclude<DistributionFrequency, 'Irregular'>, number> = { Weekly: 7, Monthly: 30, Quarterly: 91 }
const annualPeriods: Record<DistributionFrequency, number> = { Weekly: 52, Monthly: 12, Quarterly: 4, Irregular: 1 }
const iso = (date: Date) => date.toISOString().slice(0, 10)
const parseDate = (value: string) => new Date(`${value}T12:00:00Z`)
const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export function validateDistribution(draft: DistributionDraft): string[] {
  const errors: string[] = []
  if (!/^[A-Z0-9.-]{1,10}$/.test(draft.ticker.trim().toUpperCase())) errors.push('Enter a valid ticker.')
  if (!Number.isFinite(draft.amountPerShare) || draft.amountPerShare <= 0) errors.push('Distribution amount must be greater than zero.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.paymentDate)) errors.push('Enter a valid payment date.')
  if (draft.exDate && draft.exDate > draft.paymentDate) errors.push('Ex-dividend date cannot be after the payment date.')
  return errors
}

function latestRecord(records: DistributionRecord[], ticker: string) {
  return records.filter(record => record.ticker === ticker).sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))[0]
}

function explicitEvents(records: DistributionRecord[], positions: CalculatedPosition[], start: Date, end: Date): IncomeEvent[] {
  const shares = new Map(positions.map(position => [position.ticker, position.shares]))
  return records
    .filter(record => {
      const date = parseDate(record.paymentDate)
      return date >= start && date <= end && (shares.get(record.ticker) ?? 0) > 0
    })
    .map(record => ({
      id: `distribution-${record.id}`,
      ticker: record.ticker,
      paymentDate: record.paymentDate,
      exDate: record.exDate,
      amountPerShare: record.amountPerShare,
      shares: shares.get(record.ticker) ?? 0,
      projectedIncome: round((shares.get(record.ticker) ?? 0) * record.amountPerShare),
      status: record.status,
      confidence: record.status === 'estimated' ? 'Projected' : 'Confirmed',
      sourceRecordId: record.id,
    }))
}

export function buildIncomeProjection(positions: CalculatedPosition[], records: DistributionRecord[], startDate = new Date(), horizonDays = 365): IncomeProjection {
  const start = new Date(startDate); start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start.getTime() + horizonDays * DAY)
  const warnings: string[] = []
  const events = explicitEvents(records, positions, start, end)
  const explicitKeys = new Set(events.map(event => `${event.ticker}:${event.paymentDate}`))
  const holdings: HoldingIncomeProjection[] = []

  for (const position of positions.filter(item => item.shares > 0)) {
    const tickerRecords = records.filter(record => record.ticker === position.ticker)
    const latest = latestRecord(records, position.ticker)
    const frequency: DistributionFrequency = latest?.frequency ?? position.paymentFrequency
    const amount = latest?.amountPerShare || (position.annualDistributionPerShare > 0 ? position.annualDistributionPerShare / annualPeriods[frequency] : 0)
    const dataStatus: HoldingIncomeProjection['dataStatus'] = latest
      ? (latest.status === 'declared' ? 'declared' : 'history')
      : position.annualDistributionPerShare > 0 ? 'holding-assumption' : 'missing'

    if (!amount) {
      warnings.push(`${position.ticker}: no usable distribution amount is available.`)
      holdings.push({ ticker: position.ticker, shares: position.shares, annualIncome: 0, monthlyIncome: 0, weeklyIncome: 0, forwardYieldPct: 0, yieldOnCostPct: 0, nextPaymentDate: null, dataStatus })
      continue
    }

    const annualPerShare = frequency === 'Irregular'
      ? Math.max(position.annualDistributionPerShare, tickerRecords.filter(record => parseDate(record.paymentDate) >= new Date(start.getTime() - 365 * DAY)).reduce((sum, record) => sum + record.amountPerShare, 0))
      : amount * annualPeriods[frequency]
    const annualIncome = position.shares * annualPerShare

    if (frequency !== 'Irregular') {
      const cadence = cadenceDays[frequency]
      let anchor = latest ? parseDate(latest.paymentDate) : new Date(start.getTime() + cadence * DAY)
      while (anchor < start) anchor = new Date(anchor.getTime() + cadence * DAY)
      while (anchor <= end) {
        const paymentDate = iso(anchor)
        const key = `${position.ticker}:${paymentDate}`
        if (!explicitKeys.has(key)) {
          events.push({ id: `projection-${position.ticker}-${paymentDate}`, ticker: position.ticker, paymentDate, exDate: null, amountPerShare: amount, shares: position.shares, projectedIncome: round(position.shares * amount), status: 'estimated', confidence: 'Projected', sourceRecordId: latest?.id ?? null })
          explicitKeys.add(key)
        }
        anchor = new Date(anchor.getTime() + cadence * DAY)
      }
    }

    const next = events.filter(event => event.ticker === position.ticker && event.paymentDate >= iso(start)).sort((a, b) => a.paymentDate.localeCompare(b.paymentDate))[0]
    holdings.push({
      ticker: position.ticker,
      shares: position.shares,
      annualIncome: round(annualIncome), monthlyIncome: round(annualIncome / 12), weeklyIncome: round(annualIncome / 52),
      forwardYieldPct: position.marketValue > 0 ? annualIncome / position.marketValue * 100 : 0,
      yieldOnCostPct: position.costBasis > 0 ? annualIncome / position.costBasis * 100 : 0,
      nextPaymentDate: next?.paymentDate ?? null,
      dataStatus,
    })
  }

  events.sort((a, b) => a.paymentDate.localeCompare(b.paymentDate) || a.ticker.localeCompare(b.ticker))
  const annualIncome = holdings.reduce((sum, holding) => sum + holding.annualIncome, 0)
  const next90 = new Date(start.getTime() + 90 * DAY)
  const nearTerm = events.filter(event => parseDate(event.paymentDate) <= next90)
  return {
    events,
    holdings: holdings.sort((a, b) => b.annualIncome - a.annualIncome),
    annualIncome: round(annualIncome), monthlyIncome: round(annualIncome / 12), weeklyIncome: round(annualIncome / 52),
    confirmedNext90Days: round(nearTerm.filter(event => event.confidence === 'Confirmed').reduce((sum, event) => sum + event.projectedIncome, 0)),
    projectedNext90Days: round(nearTerm.reduce((sum, event) => sum + event.projectedIncome, 0)),
    warnings,
  }
}
