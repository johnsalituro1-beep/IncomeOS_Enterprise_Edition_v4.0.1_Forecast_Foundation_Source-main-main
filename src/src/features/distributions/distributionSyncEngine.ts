import type { DataEnvelope, LiveDistributionRecord as ProviderDistribution } from '../../domain/live-data/types'
import type { DistributionFrequency, DistributionRecord } from '../../types/distribution'

export type DistributionSyncAction = 'inserted' | 'updated' | 'unchanged' | 'skipped-manual' | 'rejected'
export type DistributionSyncDecision = { action: DistributionSyncAction; record?: DistributionRecord; existingId?: string; message: string }
export type DistributionSyncSummary = { decisions: DistributionSyncDecision[]; inserted: number; updated: number; unchanged: number; skippedManual: number; rejected: number }

const DAY = 86_400_000
const iso = (value: string | null | undefined) => value && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null
const round8 = (value: number) => Math.round((value + Number.EPSILON) * 1e8) / 1e8
const keyFor = (ticker: string, exDate: string | null, paymentDate: string) => `${ticker}:${exDate ?? 'none'}:${paymentDate}`
const isManual = (record: DistributionRecord) => !record.providerId && (!record.source || record.source.toLowerCase() === 'manual')

function inferFrequency(existing: DistributionRecord[], ticker: string, paymentDate: string): DistributionFrequency {
  const prior = existing.filter(item => item.ticker === ticker && item.paymentDate !== paymentDate).sort((a,b)=>b.paymentDate.localeCompare(a.paymentDate))[0]
  if (!prior) return 'Irregular'
  const gap = Math.abs(new Date(`${paymentDate}T12:00:00Z`).getTime() - new Date(`${prior.paymentDate}T12:00:00Z`).getTime()) / DAY
  if (gap <= 10) return 'Weekly'
  if (gap <= 45) return 'Monthly'
  if (gap <= 120) return 'Quarterly'
  return 'Irregular'
}

export function normalizeProviderDistribution(envelope: DataEnvelope<ProviderDistribution>, existing: DistributionRecord[]): DistributionRecord | null {
  const payload = envelope.payload
  const ticker = payload.symbol.trim().toUpperCase()
  const paymentDate = iso(payload.payDate) ?? iso(payload.exDate)
  const exDate = iso(payload.exDate)
  if (!ticker || !paymentDate || !Number.isFinite(payload.amount) || payload.amount <= 0) return null
  return {
    id: '', ticker, amountPerShare: round8(payload.amount), declarationDate: null, exDate,
    recordDate: iso(payload.recordDate), paymentDate,
    frequency: inferFrequency(existing, ticker, paymentDate), status: paymentDate < new Date().toISOString().slice(0,10) ? 'paid' : 'declared',
    source: envelope.providerId, notes: payload.distributionType === 'income' ? '' : `Provider classification: ${payload.distributionType}`,
    providerId: envelope.providerId, providerRecordId: envelope.sourceRecordId ?? null, revision: Math.max(1, payload.revision || 1),
    classification: envelope.classification, confidence: envelope.confidence, retrievedAt: envelope.retrievedAt, providerUpdatedAt: envelope.effectiveAt,
    isManualOverride: false,
  }
}

export function reconcileDistributionFeed(existing: DistributionRecord[], envelopes: DataEnvelope<ProviderDistribution>[]): DistributionSyncSummary {
  const decisions: DistributionSyncDecision[] = []
  const byProviderId = new Map(existing.filter(x=>x.providerId && x.providerRecordId).map(x=>[`${x.providerId}:${x.providerRecordId}`,x]))
  const byNaturalKey = new Map(existing.map(x=>[keyFor(x.ticker,x.exDate,x.paymentDate),x]))
  for (const envelope of envelopes) {
    const normalized = normalizeProviderDistribution(envelope, existing)
    if (!normalized) { decisions.push({ action:'rejected', message:`${envelope.symbol}: invalid provider distribution.` }); continue }
    const matched = (normalized.providerRecordId ? byProviderId.get(`${normalized.providerId}:${normalized.providerRecordId}`) : undefined) ?? byNaturalKey.get(keyFor(normalized.ticker,normalized.exDate,normalized.paymentDate))
    if (matched && (matched.isManualOverride || isManual(matched))) { decisions.push({ action:'skipped-manual', existingId: matched.id, message:`${normalized.ticker} ${normalized.paymentDate}: preserved manual record.` }); continue }
    if (!matched) { decisions.push({ action:'inserted', record: normalized, message:`${normalized.ticker} ${normalized.paymentDate}: added provider declaration.` }); continue }
    const changed = (normalized.revision ?? 1) > (matched.revision ?? 1) || normalized.amountPerShare !== matched.amountPerShare || normalized.paymentDate !== matched.paymentDate || normalized.recordDate !== matched.recordDate
    if (!changed) { decisions.push({ action:'unchanged', existingId:matched.id, message:`${normalized.ticker} ${normalized.paymentDate}: already current.` }); continue }
    decisions.push({ action:'updated', existingId:matched.id, record:{...normalized,id:matched.id,frequency:matched.frequency==='Irregular'?normalized.frequency:matched.frequency}, message:`${normalized.ticker} ${normalized.paymentDate}: updated to provider revision ${normalized.revision}.` })
  }
  return {
    decisions,
    inserted: decisions.filter(x=>x.action==='inserted').length,
    updated: decisions.filter(x=>x.action==='updated').length,
    unchanged: decisions.filter(x=>x.action==='unchanged').length,
    skippedManual: decisions.filter(x=>x.action==='skipped-manual').length,
    rejected: decisions.filter(x=>x.action==='rejected').length,
  }
}
