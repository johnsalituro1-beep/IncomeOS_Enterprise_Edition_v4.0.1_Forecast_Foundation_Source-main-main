import type { DataEnvelope, DataKind, IngestionRun, LiveDataSnapshot, ValidationIssue } from '../../domain/live-data/types'
import { deduplicate, validateEnvelope } from '../../domain/live-data/validation'
import type { LiveEtfDataProvider } from '../../providers/live-data/provider'
import { sandboxProvider } from '../../providers/live-data/sandboxProvider'

const symbols = ['EDGQ', 'EDGX', 'XDTE', 'BCCC']

async function collect(provider: LiveEtfDataProvider, kind: DataKind): Promise<DataEnvelope<unknown>[]> {
  switch (kind) {
    case 'fund': return provider.fetchFunds(symbols)
    case 'quote': return provider.fetchQuotes(symbols)
    case 'nav': return provider.fetchNav(symbols)
    case 'distribution': return provider.fetchDistributions(symbols)
    case 'holding': return provider.fetchHoldings(symbols)
    default: return []
  }
}

export async function executeFullSync(provider: LiveEtfDataProvider = sandboxProvider): Promise<IngestionRun> {
  const startedAt = new Date().toISOString()
  const kinds: DataKind[] = ['fund', 'quote', 'nav', 'distribution', 'holding']
  const raw = (await Promise.all(kinds.map(kind => collect(provider, kind)))).flat()
  const deduped = deduplicate(raw)
  const issues: ValidationIssue[] = [...deduped.issues]
  let acceptedRecords = 0
  for (const record of deduped.accepted) {
    const recordIssues = validateEnvelope(record)
    issues.push(...recordIssues)
    if (!recordIssues.some(issue => issue.severity === 'critical')) acceptedRecords += 1
  }
  const rejectedRecords = deduped.accepted.length - acceptedRecords + deduped.issues.length
  return {
    id: `sync-${Date.now()}`,
    providerId: provider.descriptor.id,
    jobType: 'full-sync',
    startedAt,
    completedAt: new Date().toISOString(),
    status: rejectedRecords ? 'partial' : 'succeeded',
    requestedSymbols: symbols.length,
    acceptedRecords,
    rejectedRecords,
    warnings: issues.filter(issue => issue.severity === 'warning').length,
    issues,
  }
}

export async function getLiveDataSnapshot(): Promise<LiveDataSnapshot> {
  const latestRun = await executeFullSync()
  return {
    providers: [sandboxProvider.descriptor, { id: 'production-adapter', name: 'Production Provider Adapter', environment: 'production', capabilities: ['fund','quote','nav','distribution','holding','corporate-action'], rateLimitPerMinute: 0, enabled: false }],
    latestRun,
    coverage: [
      { kind: 'fund', covered: 4, total: 4, stale: 0, qualityScore: 96 },
      { kind: 'quote', covered: 4, total: 4, stale: 0, qualityScore: 94 },
      { kind: 'nav', covered: 4, total: 4, stale: 0, qualityScore: 92 },
      { kind: 'distribution', covered: 4, total: 4, stale: 0, qualityScore: 90 },
      { kind: 'holding', covered: 4, total: 4, stale: 1, qualityScore: 88 },
    ],
    queueDepth: 3,
    staleSymbols: ['BCCC'],
    unresolvedIssues: latestRun.issues,
  }
}
