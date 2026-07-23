import { useMemo, useState } from 'react'
import { Activity, AlertTriangle, Building2, Clock3, Database, GitBranch, History, Layers3, Search, ShieldCheck, UploadCloud } from 'lucide-react'
import { calculateCoverage, PROGRAM_A_SEED, searchCatalog } from '../domain/etf-universe/program-a/catalog'
import { evaluateDataQuality, qualityScore } from '../domain/etf-universe/program-a/qualityEngine'
import { generateRelationships } from '../domain/etf-universe/program-a/knowledgeGraph'
import { analyzeDistributions, buildBenchmarkProfiles, buildIssuerProfiles, buildResearchMetadata, compareEtfs, holdingsCoverage, scoreEtf } from '../domain/etf-universe/phase-one'
import { buildPhaseTwoSeed, detectHoldingsGaps, detectPremiumDiscountBreaches, detectPriceAnomalies, holdingsHistory, latestPrice, priceHistory, warehouseCoverage } from '../domain/etf-universe/phase-two'

export function ProgramAUniversePage() {
  const [query, setQuery] = useState('')
  const [assetClass, setAssetClass] = useState('All')
  const [frequency, setFrequency] = useState('All')
  const [evidence, setEvidence] = useState('All')
  const [leftTicker, setLeftTicker] = useState('EDGQ')
  const [rightTicker, setRightTicker] = useState('XDTE')
  const [historyTicker, setHistoryTicker] = useState('EDGQ')

  const generatedRelationships = useMemo(() => generateRelationships(PROGRAM_A_SEED.records, PROGRAM_A_SEED.holdings), [])
  const snapshot = useMemo(() => ({ ...PROGRAM_A_SEED, relationships: [...PROGRAM_A_SEED.relationships, ...generatedRelationships] }), [generatedRelationships])
  const coverage = useMemo(() => calculateCoverage(snapshot), [snapshot])
  const issues = useMemo(() => evaluateDataQuality(snapshot), [snapshot])
  const score = useMemo(() => qualityScore(issues), [issues])
  const funds = useMemo(() => searchCatalog(snapshot.records, query, { assetClass, frequency, evidence }), [snapshot.records, query, assetClass, frequency, evidence])
  const scorecards = useMemo(() => new Map(snapshot.records.map(record => [record.id, scoreEtf(record, snapshot)])), [snapshot])
  const issuers = useMemo(() => buildIssuerProfiles(snapshot.records), [snapshot.records])
  const benchmarks = useMemo(() => buildBenchmarkProfiles(snapshot.records), [snapshot.records])
  const holdingStats = useMemo(() => holdingsCoverage(snapshot.holdings, snapshot.records.map(record => record.id)), [snapshot])
  const left = snapshot.records.find(record => record.ticker === leftTicker) ?? snapshot.records[0]
  const right = snapshot.records.find(record => record.ticker === rightTicker) ?? snapshot.records[1]
  const overlap = useMemo(() => compareEtfs(left, right, snapshot.holdings, snapshot.exposures), [left, right, snapshot])
  const warehouse = useMemo(() => buildPhaseTwoSeed(snapshot.records.map(record => record.id)), [snapshot.records])
  const warehouseStats = useMemo(() => warehouseCoverage(warehouse, snapshot.records.map(record => record.id)), [warehouse, snapshot.records])
  const detectedChanges = useMemo(() => [...warehouse.changeEvents, ...detectPriceAnomalies(warehouse.prices), ...detectPremiumDiscountBreaches(warehouse.nav), ...detectHoldingsGaps(warehouse.holdingsSnapshots)], [warehouse])
  const historyFund = snapshot.records.find(record => record.ticker === historyTicker) ?? snapshot.records[0]
  const historyRows = useMemo(() => priceHistory(warehouse.prices, historyFund.id), [warehouse, historyFund])
  const latest = latestPrice(warehouse.prices, historyFund.id)
  const historyMin = Math.min(...historyRows.map(row => row.adjustedClose))
  const historyMax = Math.max(...historyRows.map(row => row.adjustedClose))
  const sparkline = historyRows.map((row, index) => `${(index / Math.max(historyRows.length - 1, 1)) * 100},${92 - ((row.adjustedClose - historyMin) / Math.max(historyMax - historyMin, 0.01)) * 78}`).join(' ')
  const snapshots = holdingsHistory(warehouse.holdingsSnapshots, historyFund.id)

  const assetClasses = ['All', ...Array.from(new Set(snapshot.records.map(item => item.assetClass)))]
  const frequencies = ['All', ...Array.from(new Set(snapshot.records.map(item => item.distributionFrequency)))]

  return <div className="program-a-page">
    <section className="page-heading">
      <div>
        <span className="eyebrow">PROGRAM A · PHASE 2 COMPLETE</span>
        <h1>Historical ETF Data Warehouse</h1>
        <p>A versioned historical layer for prices, NAV, distribution revisions, holdings snapshots, corporate actions, source lineage, scheduled ingestion, validation, and automated change detection.</p>
      </div>
      <div className="program-a-badge"><History size={18}/><span>Version 18</span><strong>Phase 2 Complete</strong></div>
    </section>

    <section className="program-a-metrics">
      <article className="panel"><Database/><div><small>Historical observations</small><strong>{warehouseStats.priceRecords + warehouseStats.navRecords}</strong><span>Price and NAV rows</span></div></article>
      <article className="panel"><ShieldCheck/><div><small>Fund history coverage</small><strong>{warehouseStats.fundCoveragePct}%</strong><span>{coverage.totalFunds} development funds</span></div></article>
      <article className="panel"><Layers3/><div><small>Holdings snapshots</small><strong>{warehouseStats.holdingsSnapshots}</strong><span>Versioned point-in-time records</span></div></article>
      <article className="panel"><GitBranch/><div><small>Detected changes</small><strong>{detectedChanges.length}</strong><span>{detectedChanges.filter(item => item.severity === 'critical').length} critical events</span></div></article>
    </section>

    <section className="program-a-grid">
      <article className="panel program-a-roadmap">
        <div className="panel-title"><div><span className="eyebrow">PHASE 1 DELIVERY</span><h2>Completed intelligence engines</h2></div></div>
        <div className="program-a-phases">
          {[
            ['1', 'Knowledge Graph 2.0', 'Complete', 'Issuer, benchmark, peer, strategy, overlap, income and portfolio-complement relationships.'],
            ['2', 'Universal Holdings Engine', 'Complete', 'Current and historical snapshots plus normalized sector, country and asset-class exposures.'],
            ['3', 'Distribution Intelligence', 'Complete', 'Payment statistics, consistency, growth and cadence-confidence calculations.'],
            ['4', 'ETF Scoring Engine', 'Complete', 'Eight transparent components with rationale and evidence state.'],
            ['5', 'Research Metadata', 'Complete', 'Portfolio role, income, growth, risks, provider confidence and validation status.'],
          ].map(([id, title, status, text]) => <div className="program-a-phase" key={id}><span>{id}</span><div><strong>{title}</strong><p>{text}</p></div><em className="phase-status phase-complete">{status}</em></div>)}
        </div>
      </article>

      <article className="panel program-a-coverage">
        <div className="panel-title"><div><span className="eyebrow">ENTITY INTELLIGENCE</span><h2>Issuer and benchmark registry</h2></div><Building2 size={20}/></div>
        <div className="entity-ledger"><div><small>Issuer profiles</small><strong>{issuers.length}</strong><span>{issuers.reduce((sum, item) => sum + item.activeFundCount, 0)} active funds mapped</span></div><div><small>Benchmark profiles</small><strong>{benchmarks.length}</strong><span>{benchmarks.reduce((sum, item) => sum + item.fundIds.length, 0)} benchmark links</span></div><div><small>Research-ready</small><strong>{snapshot.records.filter(record => buildResearchMetadata(record).researchStatus === 'ready').length}</strong><span>Provider completeness gate</span></div></div>
      </article>
    </section>


    <section className="program-a-grid phase-two-grid">
      <article className="panel history-terminal">
        <div className="panel-title"><div><span className="eyebrow">HISTORICAL WAREHOUSE</span><h2>Price and NAV time series</h2></div><History size={20}/></div>
        <div className="history-toolbar"><select value={historyTicker} onChange={event => setHistoryTicker(event.target.value)}>{snapshot.records.map(record => <option key={record.id}>{record.ticker}</option>)}</select><span>{historyRows.length} weekly observations</span><strong>${latest?.adjustedClose.toFixed(2)}</strong></div>
        <svg className="history-sparkline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={`${historyFund.ticker} modeled price history`}><polyline points={sparkline}/></svg>
        <div className="history-stats"><div><small>Start</small><strong>${historyRows[0]?.adjustedClose.toFixed(2)}</strong></div><div><small>High</small><strong>${historyMax.toFixed(2)}</strong></div><div><small>Low</small><strong>${historyMin.toFixed(2)}</strong></div><div><small>Latest premium/discount</small><strong>{warehouse.nav.filter(row => row.fundId === historyFund.id).at(-1)?.premiumDiscountPct.toFixed(3)}%</strong></div></div>
      </article>
      <article className="panel">
        <div className="panel-title"><div><span className="eyebrow">POINT-IN-TIME DATA</span><h2>Holdings snapshot ledger</h2></div><Clock3 size={20}/></div>
        <div className="snapshot-ledger">{snapshots.map(item => <div key={item.snapshotId}><span><strong>{item.asOfDate}</strong><small>{item.holdingCount} holdings · {item.reportedWeightPct}% mapped</small></span><em>{item.contentHash}</em></div>)}</div>
      </article>
    </section>

    <section className="program-a-grid">
      <article className="panel">
        <div className="panel-title"><div><span className="eyebrow">INGESTION OPERATIONS</span><h2>Scheduled run ledger</h2></div><UploadCloud size={20}/></div>
        <div className="ingestion-ledger">{warehouse.ingestionRuns.map(run => <div key={run.id}><span className={`run-status run-${run.status}`}>{run.status}</span><span><strong>{run.dataset}</strong><small>{run.accepted} accepted · {run.rejected} rejected · {run.warnings} warnings</small></span><time>{run.completedAt?.slice(0, 10)}</time></div>)}</div>
      </article>
      <article className="panel">
        <div className="panel-title"><div><span className="eyebrow">CHANGE DETECTION</span><h2>Material event queue</h2></div><AlertTriangle size={20}/></div>
        <div className="change-event-list">{detectedChanges.slice(0, 7).map(event => <div key={event.id}><em className={`change-${event.severity}`}>{event.severity}</em><span><strong>{snapshot.records.find(record => record.id === event.fundId)?.ticker ?? event.fundId} · {event.entity}</strong><small>{event.field}: {String(event.previousValue ?? '—')} → {String(event.currentValue ?? '—')}</small></span></div>)}</div>
      </article>
    </section>

    <article className="panel program-a-toolbar">
      <div className="research-search"><Search size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search ticker, fund, issuer, exchange, benchmark, strategy or tag…"/></div>
      <select value={assetClass} onChange={event => setAssetClass(event.target.value)}>{assetClasses.map(item => <option key={item}>{item}</option>)}</select>
      <select value={frequency} onChange={event => setFrequency(event.target.value)}>{frequencies.map(item => <option key={item}>{item}</option>)}</select>
      <select value={evidence} onChange={event => setEvidence(event.target.value)}><option>All</option><option value="verified">verified</option><option value="provider">provider</option><option value="modeled">modeled</option><option value="missing">missing</option></select>
    </article>

    <section className="panel program-a-table phase-one-table">
      <div className="program-a-row program-a-head"><span>Ticker</span><span>Fund / issuer</span><span>Classification</span><span>Distribution intelligence</span><span>ETF score</span><span>Evidence</span></div>
      {funds.map(record => { const stats = analyzeDistributions(snapshot.distributions, record.id); const scorecard = scorecards.get(record.id)!; return <div className="program-a-row" key={record.id}>
        <strong>{record.ticker}<small>{record.exchange}</small></strong>
        <span><b>{record.name}</b><small>{record.issuer}</small></span>
        <span><b>{record.category}</b><small>{record.strategy}</small></span>
        <span><b>{record.distributionFrequency}</b><small>{stats.paymentCount} payments · {stats.consistencyScore} consistency</small></span>
        <span><b className="score-number">{scorecard.overall}</b><small>{scorecard.components[0].label} {scorecard.components[0].score}</small></span>
        <span><em className={`evidence-pill evidence-${record.evidence}`}>{record.evidence}</em><small>{buildResearchMetadata(record).researchStatus}</small></span>
      </div>})}
    </section>

    <section className="program-a-grid">
      <article className="panel overlap-lab">
        <div className="panel-title"><div><span className="eyebrow">OVERLAP ANALYTICS</span><h2>ETF pair diagnostic</h2></div><Activity size={20}/></div>
        <div className="overlap-selectors"><select value={leftTicker} onChange={event => setLeftTicker(event.target.value)}>{snapshot.records.map(record => <option key={record.id}>{record.ticker}</option>)}</select><span>vs</span><select value={rightTicker} onChange={event => setRightTicker(event.target.value)}>{snapshot.records.map(record => <option key={record.id}>{record.ticker}</option>)}</select></div>
        <div className="overlap-score"><strong>{overlap.combinedSimilarityPct}%</strong><span>combined similarity</span></div>
        <div className="overlap-bars">{[['Holdings', overlap.holdingsOverlapPct], ['Sectors', overlap.sectorOverlapPct], ['Countries', overlap.countryOverlapPct], ['Strategy', overlap.strategySimilarityPct]].map(([label, value]) => <div key={String(label)}><span>{label}<b>{value}%</b></span><i><em style={{ width: `${value}%` }}/></i></div>)}</div>
        <p>{overlap.explanation}</p>
      </article>

      <article className="panel">
        <div className="panel-title"><div><span className="eyebrow">QUALITY CONTROL</span><h2>Evidence and validation ledger</h2></div><AlertTriangle size={20}/></div>
        <div className="quality-issue-list">{issues.slice(0, 8).map(issue => <div className={`quality-issue issue-${issue.severity}`} key={issue.id}><span>{issue.severity}</span><p>{issue.message}</p></div>)}</div>
      </article>
    </section>

    <section className="program-a-grid">
      <article className="panel"><div className="panel-title"><div><span className="eyebrow">SCORE TRANSPARENCY</span><h2>{left.ticker} component scorecard</h2></div></div><div className="component-score-list">{scorecards.get(left.id)?.components.map(component => <div key={component.key}><span>{component.label}<small>{component.rationale}</small></span><strong>{component.score}</strong></div>)}</div></article>
      <article className="panel"><div className="panel-title"><div><span className="eyebrow">INGESTION ARCHITECTURE</span><h2>Provider-ready pipeline</h2></div><UploadCloud size={20}/></div><ol className="pipeline-list"><li><strong>Acquire</strong><span>Exchange, issuer or licensed provider files.</span></li><li><strong>Map</strong><span>Translate provider fields into the canonical schema.</span></li><li><strong>Validate</strong><span>Reject duplicates, orphans and impossible values.</span></li><li><strong>Version</strong><span>Preserve source dates, evidence and historical snapshots.</span></li><li><strong>Publish</strong><span>Expose approved data to research, scoring and Copilot.</span></li></ol></article>
    </section>

    <p className="data-disclaimer">This offline release uses development-only modeled records to exercise the Phase 2 historical warehouse architecture. No modeled value is a verified ETF fact. Production coverage requires licensed or authoritative data feeds, historical backfills, source contracts and validation approval.</p>
  </div>
}
