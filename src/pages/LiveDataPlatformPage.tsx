import { Activity, AlertTriangle, CheckCircle2, Clock3, DatabaseZap, RefreshCw, ServerCog, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { LiveDataSnapshot } from '../domain/live-data/types'
import { getLiveDataSnapshot } from '../services/live-data/ingestion'
import { usePortfolio } from '../features/portfolio/PortfolioContext'
import { appendOperationRun, loadOperationRuns } from '../features/operations/dataOperationsRepository'
import { classifyProviderHealth, createRun, failRun, finishRun, isOperationStale, type OperationKind, type OperationRun } from '../features/operations/dataOperationsEngine'

export function LiveDataPlatformPage() {
  const { holdings, refreshMarketData, marketDataState, marketDataError, marketDataRefreshedAt, priceFreshness, syncDistributions, distributionSyncState, distributionSyncError, distributionSyncedAt } = usePortfolio()
  const [snapshot, setSnapshot] = useState<LiveDataSnapshot | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [runs, setRuns] = useState<OperationRun[]>(() => loadOperationRuns())
  const [autoRefresh, setAutoRefresh] = useState(() => localStorage.getItem('incomeos:auto-refresh') === 'true')
  const refresh = async () => { setSyncing(true); setSnapshot(await getLiveDataSnapshot()); setSyncing(false) }
  useEffect(() => { void refresh() }, [])
  const recordRun = (run: OperationRun) => setRuns(appendOperationRun(run))
  const runOperation = async (kind: OperationKind) => {
    const started = createRun(kind, 'configured-provider-or-sandbox', holdings.length); recordRun(started)
    try {
      if (kind === 'market-data') await refreshMarketData(); else await syncDistributions()
      recordRun(finishRun(started, { accepted: holdings.length, fallbackUsed: kind === 'market-data' ? marketDataState === 'fallback' : distributionSyncState === 'fallback' }))
    } catch (error) { recordRun(failRun(started,error)) }
  }
  useEffect(() => { localStorage.setItem('incomeos:auto-refresh', String(autoRefresh)); if (!autoRefresh) return; const id = window.setInterval(() => { void runOperation('market-data'); void runOperation('distributions') }, 15 * 60 * 1000); return () => window.clearInterval(id) }, [autoRefresh, holdings.length])
  const providerHealth = useMemo(() => classifyProviderHealth(runs), [runs])
  const marketStale = isOperationStale('market-data', marketDataRefreshedAt)
  const distributionStale = isOperationStale('distributions', distributionSyncedAt)
  if (!snapshot) return <section className="panel live-loading"><RefreshCw className="spin"/> Initializing provider-neutral data services…</section>
  const quality = Math.round(snapshot.coverage.reduce((sum, item) => sum + item.qualityScore, 0) / snapshot.coverage.length)
  return <div className="live-data-page">
    <div className="page-heading"><div><p className="eyebrow">ENTERPRISE EDITION v2.2</p><h1>Data Operations and Reliability</h1><p>Scheduled refresh, retry policy, stale-data monitoring, provider health, audit history, and manual recovery controls.</p></div><div className="live-actions"><button className="secondary-button live-sync" onClick={() => void runOperation('market-data')} disabled={marketDataState === 'refreshing'}><RefreshCw size={16} className={marketDataState === 'refreshing' ? 'spin' : ''}/>{marketDataState === 'refreshing' ? 'Refreshing prices…' : `Refresh ${holdings.length} portfolio prices`}</button><button className="primary-button live-sync" onClick={() => void runOperation('distributions')} disabled={syncing}><RefreshCw size={16} className={syncing ? 'spin' : ''}/>{distributionSyncState === 'syncing' ? 'Syncing distributions…' : 'Sync distributions'}</button><label className="auto-refresh-toggle"><input type="checkbox" checked={autoRefresh} onChange={e=>setAutoRefresh(e.target.checked)}/> Auto refresh every 15 minutes</label></div></div>
    <div className="live-kpis">
      <article className="panel"><DatabaseZap/><small>Accepted records</small><strong>{snapshot.latestRun.acceptedRecords}</strong><span>Latest full sync</span></article>
      <article className="panel"><ShieldCheck/><small>Data quality</small><strong>{quality}%</strong><span>Across enabled feeds</span></article>
      <article className="panel"><Clock3/><small>Run history</small><strong>{runs.length}</strong><span>Last 100 operations</span></article>
      <article className="panel"><AlertTriangle/><small>Provider health</small><strong>{providerHealth}</strong><span>{marketStale || distributionStale ? 'Freshness target missed' : 'Freshness targets met'}</span></article>
    </div>
    <section className="panel market-refresh-banner"><div><strong>Portfolio market data: {marketDataState}</strong><span>Freshness: {priceFreshness}{marketDataRefreshedAt ? ` · refreshed ${new Date(marketDataRefreshedAt).toLocaleString()}` : " · not refreshed"}</span>{marketDataError && <p>{marketDataError}</p>}</div><small>Production adapters are selected when configured; sandbox fallback remains clearly labeled.</small></section><div className="live-grid">
      <section className="panel live-coverage"><div className="panel-title"><Activity/><h2>Coverage and freshness</h2></div>{snapshot.coverage.map(item => <div className="coverage-row" key={item.kind}><div><strong>{item.kind}</strong><small>{item.covered}/{item.total} symbols · {item.stale} stale</small></div><div className="coverage-bar"><i style={{width:`${item.qualityScore}%`}}/></div><b>{item.qualityScore}</b></div>)}</section>
      <section className="panel provider-panel"><div className="panel-title"><ServerCog/><h2>Provider registry</h2></div>{snapshot.providers.map(provider => <article key={provider.id}><div><strong>{provider.name}</strong><small>{provider.id} · {provider.environment}</small></div><span className={provider.enabled ? 'provider-on' : 'provider-off'}>{provider.enabled ? 'ENABLED' : 'CONFIG REQUIRED'}</span><p>{provider.capabilities.join(' · ')}</p></article>)}</section>
    </div>
    <section className="panel operations-ledger"><div className="panel-title"><ServerCog/><h2>Operations run history</h2></div>{runs.length===0?<p>No scheduled or manual operations recorded yet.</p>:runs.slice(0,8).map(run=><article key={run.id} className="operation-row"><span className={`run-status ${run.status}`}>{run.status}</span><strong>{run.kind}</strong><small>Attempt {run.attempt} · {new Date(run.startedAt).toLocaleString()}</small><span>{run.accepted}/{run.requested} accepted</span><p>{run.message}{run.nextRetryAt?` Retry ${new Date(run.nextRetryAt).toLocaleTimeString()}.`:''}</p></article>)}</section><div className="live-grid lower">
      <section className="panel run-ledger"><div className="panel-title"><CheckCircle2/><h2>Latest ingestion run</h2></div><div className="run-summary"><span className={`run-status ${snapshot.latestRun.status}`}>{snapshot.latestRun.status}</span><strong>{snapshot.latestRun.providerId}</strong><small>{new Date(snapshot.latestRun.completedAt ?? snapshot.latestRun.startedAt).toLocaleString()}</small></div><div className="run-stats"><div><small>Requested</small><strong>{snapshot.latestRun.requestedSymbols}</strong></div><div><small>Accepted</small><strong>{snapshot.latestRun.acceptedRecords}</strong></div><div><small>Rejected</small><strong>{snapshot.latestRun.rejectedRecords}</strong></div><div><small>Warnings</small><strong>{snapshot.latestRun.warnings}</strong></div></div><p className="data-disclaimer">Sandbox values are modeled development data. Connect a licensed production provider before using the platform for investment decisions.</p></section>
      <section className="panel issue-queue"><div className="panel-title"><AlertTriangle/><h2>Validation queue</h2></div>{snapshot.unresolvedIssues.length === 0 ? <div className="empty-issues"><CheckCircle2/> No unresolved validation issues.</div> : snapshot.unresolvedIssues.slice(0,5).map((issue, index) => <article key={`${issue.code}-${index}`}><span className={issue.severity}>{issue.severity}</span><div><strong>{issue.code}</strong><p>{issue.message}</p></div><small>{issue.symbol ?? 'universe'}</small></article>)}</section>
    </div>
  </div>
}
