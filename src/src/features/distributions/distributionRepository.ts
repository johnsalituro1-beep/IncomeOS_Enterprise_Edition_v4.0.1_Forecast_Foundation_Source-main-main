import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { DistributionDraft, DistributionRecord } from '../../types/distribution'
import type { DistributionSyncSummary } from './distributionSyncEngine'

const KEY = 'incomeos-v1.7-distributions'
function readLocal(): DistributionRecord[] { try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as DistributionRecord[] } catch { return [] } }
function writeLocal(records: DistributionRecord[]) { localStorage.setItem(KEY, JSON.stringify(records)) }
const mapRow = (row: any): DistributionRecord => ({ id: row.id, ticker: row.ticker, amountPerShare: Number(row.amount_per_share), declarationDate: row.declaration_date, exDate: row.ex_date, recordDate: row.record_date, paymentDate: row.payment_date, frequency: row.frequency, status: row.status, source: row.source ?? '', notes: row.notes ?? '', providerId: row.provider_id ?? null, providerRecordId: row.provider_record_id ?? null, revision: Number(row.revision ?? 1), classification: row.classification ?? null, confidence: row.confidence == null ? null : Number(row.confidence), retrievedAt: row.retrieved_at ?? null, providerUpdatedAt: row.provider_updated_at ?? null, isManualOverride: Boolean(row.is_manual_override) })

export async function loadDistributions(user: User | null, portfolioId: string | null): Promise<DistributionRecord[]> {
  if (!user || !supabase || !portfolioId) return readLocal()
  const result = await supabase.from('distribution_events').select('*').eq('portfolio_id', portfolioId).order('payment_date', { ascending: false })
  if (result.error) throw result.error
  return (result.data ?? []).map(mapRow)
}
export async function saveDistribution(user: User | null, portfolioId: string | null, draft: DistributionDraft): Promise<DistributionRecord> {
  if (!user || !supabase || !portfolioId) { const record = { ...draft, ticker: draft.ticker.toUpperCase(), id: crypto.randomUUID() }; writeLocal([record, ...readLocal()]); return record }
  const result = await supabase.from('distribution_events').insert({ portfolio_id: portfolioId, ticker: draft.ticker.toUpperCase(), amount_per_share: draft.amountPerShare, declaration_date: draft.declarationDate, ex_date: draft.exDate, record_date: draft.recordDate, payment_date: draft.paymentDate, frequency: draft.frequency, status: draft.status, source: draft.source, notes: draft.notes }).select('*').single()
  if (result.error) throw result.error
  return mapRow(result.data)
}
export async function deleteDistribution(user: User | null, id: string) {
  if (!user || !supabase) { writeLocal(readLocal().filter(record => record.id !== id)); return }
  const result = await supabase.from('distribution_events').delete().eq('id', id)
  if (result.error) throw result.error
}


const syncKey = 'incomeos-v2.1-distribution-sync-runs'
export type DistributionSyncRunDraft = { providerId:string; status:'succeeded'|'partial'|'failed'; requestedSymbols:number; receivedRecords:number; insertedRecords:number; updatedRecords:number; skippedRecords:number; rejectedRecords:number; fallbackUsed:boolean; startedAt:string; completedAt:string; errorMessage:string|null }

function toRow(portfolioId: string, record: DistributionRecord) {
  return { portfolio_id:portfolioId,ticker:record.ticker,amount_per_share:record.amountPerShare,declaration_date:record.declarationDate,ex_date:record.exDate,record_date:record.recordDate,payment_date:record.paymentDate,frequency:record.frequency,status:record.status,source:record.source,notes:record.notes,provider_id:record.providerId??null,provider_record_id:record.providerRecordId??null,revision:record.revision??1,classification:record.classification??null,confidence:record.confidence??null,retrieved_at:record.retrievedAt??null,provider_updated_at:record.providerUpdatedAt??null,is_manual_override:record.isManualOverride??false }
}

export async function applyDistributionSync(user: User | null, portfolioId: string | null, existing: DistributionRecord[], summary: DistributionSyncSummary): Promise<DistributionRecord[]> {
  let next = [...existing]
  for (const decision of summary.decisions) {
    if (decision.action==='inserted' && decision.record) next=[{...decision.record,id:crypto.randomUUID()},...next]
    if (decision.action==='updated' && decision.record && decision.existingId) next=next.map(x=>x.id===decision.existingId?decision.record!:x)
  }
  if (!user || !supabase || !portfolioId) { writeLocal(next); return next }
  for (const decision of summary.decisions) {
    if (!decision.record || !['inserted','updated'].includes(decision.action)) continue
    if (decision.action==='updated' && decision.existingId) {
      const result=await supabase.from('distribution_events').update(toRow(portfolioId,decision.record)).eq('id',decision.existingId).select('*').single()
      if(result.error) throw result.error
      next=next.map(x=>x.id===decision.existingId?mapRow(result.data):x)
    } else {
      const result=await supabase.from('distribution_events').insert(toRow(portfolioId,decision.record)).select('*').single()
      if(result.error) throw result.error
      next=[mapRow(result.data),...next.filter(x=>x.id!==decision.record!.id)]
    }
  }
  return next.sort((a,b)=>b.paymentDate.localeCompare(a.paymentDate))
}

export async function recordDistributionSyncRun(user: User | null, portfolioId: string | null, run: DistributionSyncRunDraft) {
  if (!user || !supabase) { const current=JSON.parse(localStorage.getItem(syncKey)??'[]'); localStorage.setItem(syncKey,JSON.stringify([{id:crypto.randomUUID(),...run},...current].slice(0,25))); return }
  const result=await supabase.from('distribution_sync_runs').insert({user_id:user.id,portfolio_id:portfolioId,provider_id:run.providerId,status:run.status,requested_symbols:run.requestedSymbols,received_records:run.receivedRecords,inserted_records:run.insertedRecords,updated_records:run.updatedRecords,skipped_records:run.skippedRecords,rejected_records:run.rejectedRecords,fallback_used:run.fallbackUsed,started_at:run.startedAt,completed_at:run.completedAt,error_message:run.errorMessage})
  if(result.error) throw result.error
}
