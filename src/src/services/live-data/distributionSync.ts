import type { User } from '@supabase/supabase-js'
import type { DistributionRecord } from '../../types/distribution'
import { reconcileDistributionFeed, type DistributionSyncSummary } from '../../features/distributions/distributionSyncEngine'
import { applyDistributionSync, recordDistributionSyncRun } from '../../features/distributions/distributionRepository'
import type { LiveEtfDataProvider } from '../../providers/live-data/provider'
import { httpProvider } from '../../providers/live-data/httpProvider'
import { sandboxProvider } from '../../providers/live-data/sandboxProvider'

export type DistributionSyncResult = { records: DistributionRecord[]; summary: DistributionSyncSummary; providerId: string; fallbackUsed: boolean; syncedAt: string }

export async function syncPortfolioDistributions(symbols: string[], existing: DistributionRecord[], user: User | null, portfolioId: string | null, preferred?: LiveEtfDataProvider): Promise<DistributionSyncResult> {
  const unique = [...new Set(symbols.map(s=>s.trim().toUpperCase()).filter(Boolean))]
  const startedAt = new Date().toISOString()
  if (!unique.length) return { records:existing, summary:{decisions:[],inserted:0,updated:0,unchanged:0,skippedManual:0,rejected:0}, providerId:'none',fallbackUsed:false,syncedAt:startedAt }
  let provider = preferred ?? (httpProvider.descriptor.enabled ? httpProvider : sandboxProvider)
  let fallbackUsed = false
  try {
    let envelopes
    try { envelopes = await provider.fetchDistributions(unique) }
    catch (error) { if (provider.descriptor.id===sandboxProvider.descriptor.id) throw error; provider=sandboxProvider; fallbackUsed=true; envelopes=await provider.fetchDistributions(unique) }
    const summary = reconcileDistributionFeed(existing,envelopes)
    const records = await applyDistributionSync(user,portfolioId,existing,summary)
    await recordDistributionSyncRun(user,portfolioId,{providerId:provider.descriptor.id,status:summary.rejected?'partial':'succeeded',requestedSymbols:unique.length,receivedRecords:envelopes.length,insertedRecords:summary.inserted,updatedRecords:summary.updated,skippedRecords:summary.unchanged+summary.skippedManual,rejectedRecords:summary.rejected,fallbackUsed,startedAt,completedAt:new Date().toISOString(),errorMessage:null})
    return { records,summary,providerId:provider.descriptor.id,fallbackUsed,syncedAt:new Date().toISOString() }
  } catch (error) {
    await recordDistributionSyncRun(user,portfolioId,{providerId:provider.descriptor.id,status:'failed',requestedSymbols:unique.length,receivedRecords:0,insertedRecords:0,updatedRecords:0,skippedRecords:0,rejectedRecords:0,fallbackUsed,startedAt,completedAt:new Date().toISOString(),errorMessage:error instanceof Error?error.message:'Distribution sync failed.'})
    throw error
  }
}
