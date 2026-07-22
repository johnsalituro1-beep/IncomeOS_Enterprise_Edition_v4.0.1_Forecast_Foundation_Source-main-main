import type { DataEnvelope, LiveDistributionRecord, HoldingRecord, NavRecord, LiveQuoteRecord, ValidationIssue } from './types'

const finitePositive = (value: number) => Number.isFinite(value) && value > 0

export function validateEnvelope(envelope: DataEnvelope<unknown>): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (!envelope.symbol.trim()) issues.push({ code: 'SYMBOL_REQUIRED', severity: 'critical', message: 'Record is missing a symbol.', kind: envelope.kind })
  if (envelope.confidence < 0 || envelope.confidence > 1) issues.push({ code: 'CONFIDENCE_RANGE', severity: 'critical', message: 'Confidence must be between 0 and 1.', symbol: envelope.symbol, kind: envelope.kind })
  if (Number.isNaN(Date.parse(envelope.effectiveAt))) issues.push({ code: 'EFFECTIVE_DATE_INVALID', severity: 'critical', message: 'Effective timestamp is invalid.', symbol: envelope.symbol, kind: envelope.kind })
  if (Date.parse(envelope.retrievedAt) - Date.parse(envelope.effectiveAt) > 1000 * 60 * 60 * 24 * 7) issues.push({ code: 'STALE_RECORD', severity: 'warning', message: 'Record is more than seven days old.', symbol: envelope.symbol, kind: envelope.kind })

  if (envelope.kind === 'quote') {
    const q = envelope.payload as LiveQuoteRecord
    if (!finitePositive(q.price)) issues.push({ code: 'PRICE_INVALID', severity: 'critical', message: 'Price must be positive.', symbol: envelope.symbol, kind: envelope.kind })
    if (q.previousClose && Math.abs(q.price / q.previousClose - 1) > 0.35) issues.push({ code: 'PRICE_MOVE_EXTREME', severity: 'warning', message: 'Price moved more than 35% from previous close.', symbol: envelope.symbol, kind: envelope.kind })
  }
  if (envelope.kind === 'nav') {
    const nav = envelope.payload as NavRecord
    if (!finitePositive(nav.nav)) issues.push({ code: 'NAV_INVALID', severity: 'critical', message: 'NAV must be positive.', symbol: envelope.symbol, kind: envelope.kind })
    if (nav.premiumDiscountPct !== null && Math.abs(nav.premiumDiscountPct) > 20) issues.push({ code: 'PREMIUM_DISCOUNT_EXTREME', severity: 'warning', message: 'Premium/discount exceeds 20%.', symbol: envelope.symbol, kind: envelope.kind })
  }
  if (envelope.kind === 'distribution') {
    const dist = envelope.payload as LiveDistributionRecord
    if (!finitePositive(dist.amount)) issues.push({ code: 'DISTRIBUTION_INVALID', severity: 'critical', message: 'Distribution amount must be positive.', symbol: envelope.symbol, kind: envelope.kind })
  }
  if (envelope.kind === 'holding') {
    const holding = envelope.payload as HoldingRecord
    if (holding.weightPct < 0 || holding.weightPct > 100) issues.push({ code: 'HOLDING_WEIGHT_RANGE', severity: 'critical', message: 'Holding weight must be between 0 and 100.', symbol: envelope.symbol, kind: envelope.kind })
  }
  return issues
}

export function deduplicate<T>(records: DataEnvelope<T>[]): { accepted: DataEnvelope<T>[]; issues: ValidationIssue[] } {
  const seen = new Set<string>()
  const accepted: DataEnvelope<T>[] = []
  const issues: ValidationIssue[] = []
  for (const record of records) {
    const key = `${record.providerId}:${record.kind}:${record.symbol}:${record.effectiveAt}:${record.sourceRecordId ?? ''}`
    if (seen.has(key)) {
      issues.push({ code: 'DUPLICATE_RECORD', severity: 'warning', message: 'Duplicate provider record rejected.', symbol: record.symbol, kind: record.kind, recordKey: key })
      continue
    }
    seen.add(key)
    accepted.push(record)
  }
  return { accepted, issues }
}
