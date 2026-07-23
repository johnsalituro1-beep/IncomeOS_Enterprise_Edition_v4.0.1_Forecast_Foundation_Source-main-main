import { useMemo, useState } from 'react'
import { Activity, ArrowRight, BarChart3, CheckCircle2, CircleDollarSign, Gauge, GitCompareArrows, Layers3, RefreshCw, ShieldCheck, SlidersHorizontal, Sparkles, Target, TrendingUp, TriangleAlert } from 'lucide-react'
import { usePortfolio, usePortfolioMetrics } from '../features/portfolio/PortfolioContext'
import { buildInstitutionalStrategy, candidateUniverseSummary, type InstitutionalStrategyInput, type StrategyObjective } from '../domain/strategy-builder/institutionalStrategyEngine'
import type { RiskTolerance } from '../domain/strategy-builder/types'

const money = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
const pct = (value: number) => `${value.toFixed(1)}%`

const DEFAULT_INPUT: InstitutionalStrategyInput = {
  capital: 350000,
  targetWeeklyIncome: 2000,
  monthlyContribution: 0,
  reinvestmentPct: 25,
  horizonYears: 10,
  riskTolerance: 'Moderate',
  objective: 'Balanced',
  maximumSingleEtfPct: 25,
  maximumCoveredCallPct: 45,
  minimumGrowthPct: 25,
  minimumFixedIncomePct: 10,
  maximumIssuerPct: 40,
}

export function StageFiveBuildPage() {
  const { holdings } = usePortfolio()
  const metrics = usePortfolioMetrics()
  const [input, setInput] = useState<InstitutionalStrategyInput>({ ...DEFAULT_INPUT, capital: Math.round(metrics.portfolioValue || DEFAULT_INPUT.capital), targetWeeklyIncome: metrics.weeklyGoal })
  const [selectedId, setSelectedId] = useState('')
  const result = useMemo(() => buildInstitutionalStrategy(input, holdings), [input, holdings])
  const selected = result.ranked.find((strategy) => strategy.id === selectedId) ?? result.recommended
  const universe = candidateUniverseSummary()

  const update = <K extends keyof InstitutionalStrategyInput>(key: K, value: InstitutionalStrategyInput[K]) => setInput((current) => ({ ...current, [key]: value }))

  return <div className="stage5-page">
    <div className="page-heading stage5-heading">
      <div><span className="eyebrow">VERSION 11 · STAGE 5</span><h1>Institutional Strategy Builder</h1><p>Goal-driven portfolio construction, constraint testing, stress analysis, and explainable rebalance decisions.</p></div>
      <span className="heading-badge"><Sparkles size={15}/> MODELED OPTIMIZER ONLINE</span>
    </div>

    <section className="stage5-command-grid">
      <article><CircleDollarSign/><div><small>INVESTABLE CAPITAL</small><strong>{money(input.capital)}</strong><span>{universe.funds} modeled ETF candidates</span></div></article>
      <article><Target/><div><small>WEEKLY TARGET</small><strong>{money(input.targetWeeklyIncome)}</strong><span>{pct(selected.goalProgressPct)} modeled coverage</span></div></article>
      <article><TrendingUp/><div><small>RECOMMENDED INCOME</small><strong>{money(selected.projectedWeeklyIncome)}</strong><span>{pct(selected.modeledYieldPct)} portfolio yield</span></div></article>
      <article><Gauge/><div><small>STRATEGY SCORE</small><strong>{selected.scores.overall}</strong><span>{selected.name}</span></div></article>
    </section>

    <section className="stage5-builder-grid">
      <article className="panel stage5-controls">
        <div className="panel-title"><SlidersHorizontal size={16}/><h2>Investment Mandate</h2></div>
        <div className="control-form">
          <label><span>Capital</span><input type="number" value={input.capital} onChange={(event) => update('capital', Number(event.target.value))}/></label>
          <label><span>Weekly income target</span><input type="number" value={input.targetWeeklyIncome} onChange={(event) => update('targetWeeklyIncome', Number(event.target.value))}/></label>
          <label><span>Objective</span><select value={input.objective} onChange={(event) => update('objective', event.target.value as StrategyObjective)}><option>Balanced</option><option>Income First</option><option>Growth First</option><option>Capital Preservation</option></select></label>
          <label><span>Risk tolerance</span><select value={input.riskTolerance} onChange={(event) => update('riskTolerance', event.target.value as RiskTolerance)}><option>Conservative</option><option>Moderate</option><option>Growth</option><option>Aggressive</option></select></label>
          <label><span>Reinvestment — {input.reinvestmentPct}%</span><input type="range" min="0" max="100" value={input.reinvestmentPct} onChange={(event) => update('reinvestmentPct', Number(event.target.value))}/></label>
          <label><span>Horizon — {input.horizonYears} years</span><input type="range" min="1" max="30" value={input.horizonYears} onChange={(event) => update('horizonYears', Number(event.target.value))}/></label>
          <label><span>Max single ETF — {input.maximumSingleEtfPct}%</span><input type="range" min="10" max="50" value={input.maximumSingleEtfPct} onChange={(event) => update('maximumSingleEtfPct', Number(event.target.value))}/></label>
          <label><span>Max covered call — {input.maximumCoveredCallPct}%</span><input type="range" min="0" max="100" value={input.maximumCoveredCallPct} onChange={(event) => update('maximumCoveredCallPct', Number(event.target.value))}/></label>
          <label><span>Min growth allocation — {input.minimumGrowthPct}%</span><input type="range" min="0" max="80" value={input.minimumGrowthPct} onChange={(event) => update('minimumGrowthPct', Number(event.target.value))}/></label>
          <label><span>Min fixed income — {input.minimumFixedIncomePct}%</span><input type="range" min="0" max="50" value={input.minimumFixedIncomePct} onChange={(event) => update('minimumFixedIncomePct', Number(event.target.value))}/></label>
        </div>
        <button className="terminal-button full" onClick={() => setInput({ ...input })}><RefreshCw size={14}/>Recalculate strategy set</button>
      </article>

      <article className="panel stage5-ranking">
        <div className="panel-title split"><div><BarChart3 size={16}/><h2>Ranked Strategy Set</h2></div><span>{result.ranked.length} CANDIDATES</span></div>
        <div className="strategy-rank-list">{result.ranked.map((strategy, index) => <button key={strategy.id} className={selected.id === strategy.id ? 'active' : ''} onClick={() => setSelectedId(strategy.id)}><b>#{index + 1}</b><div><strong>{strategy.name}</strong><span>{pct(strategy.modeledYieldPct)} yield · {pct(strategy.modeledGrowthPct)} growth</span></div><em>{strategy.scores.overall}</em><ArrowRight size={14}/></button>)}</div>
      </article>
    </section>

    <section className="stage5-main-grid">
      <article className="panel strategy-allocation-panel">
        <div className="panel-title split"><div><Layers3 size={16}/><h2>{selected.name} Allocation</h2></div><span>{selected.allocations.length} SLEEVES</span></div>
        <div className="allocation-bars">{selected.allocations.map((allocation) => <div key={allocation.ticker}><header><b>{allocation.ticker}</b><span>{allocation.category}</span><strong>{pct(allocation.allocationPct)}</strong></header><div><i style={{ width: `${allocation.allocationPct}%` }}></i></div><footer><span>{money(allocation.dollars)}</span><span>{money(allocation.annualIncome)} annual income</span></footer></div>)}</div>
      </article>

      <article className="panel strategy-score-panel">
        <div className="panel-title"><Gauge size={16}/><h2>Explainable Scorecard</h2></div>
        {Object.entries(selected.scores).map(([label, value]) => <div className="score-row" key={label}><span>{label.replace(/([A-Z])/g, ' $1')}</span><div><i style={{ width: `${value}%` }}></i></div><b>{value}</b></div>)}
        <div className="decision-summary">{result.decisionSummary.map((line, index) => <p key={line}>{index === result.decisionSummary.length - 1 ? <TriangleAlert size={13}/> : <CheckCircle2 size={13}/>}<span>{line}</span></p>)}</div>
      </article>
    </section>

    <section className="stage5-analytics-grid">
      <article className="panel frontier-panel">
        <div className="panel-title"><Activity size={16}/><h2>Modeled Efficient Frontier</h2></div>
        <div className="frontier-chart">{result.frontier.map((point) => <button key={point.strategyId} className={point.recommended ? 'recommended' : ''} style={{ left: `${Math.min(88, Math.max(4, point.modeledRisk))}%`, bottom: `${Math.min(85, Math.max(8, point.modeledReturn * 4))}%` }} title={`${point.strategyName}: risk ${point.modeledRisk.toFixed(0)}, return ${point.modeledReturn.toFixed(1)}%`} onClick={() => setSelectedId(point.strategyId)}><i></i><span>{point.strategyName}</span></button>)}</div>
        <footer><span>Lower modeled risk</span><span>Higher modeled risk</span></footer>
      </article>

      <article className="panel stress-panel">
        <div className="panel-title"><ShieldCheck size={16}/><h2>Stress Test Matrix</h2></div>
        <div>{result.stress.map((stress) => <div key={stress.scenario}><b>{stress.scenario}</b><span>{money(stress.portfolioValue)} value</span><span>{money(stress.weeklyIncome)}/week</span><strong className={stress.goalCoveragePct >= 100 ? 'positive' : 'negative'}>{pct(stress.goalCoveragePct)} goal</strong><small>{stress.note}</small></div>)}</div>
      </article>
    </section>

    <section className="panel rebalance-panel">
      <div className="panel-title split"><div><GitCompareArrows size={16}/><h2>Current Portfolio → Recommended Strategy</h2></div><span>NOT TRADE INSTRUCTIONS</span></div>
      <div className="rebalance-table"><header><span>Ticker</span><span>Action</span><span>Current</span><span>Target</span><span>Change</span><span>Modeled amount</span></header>{result.trades.slice(0, 12).map((trade) => <div key={trade.ticker}><b>{trade.ticker}</b><strong className={trade.action.toLowerCase()}>{trade.action}</strong><span>{pct(trade.currentPct)}</span><span>{pct(trade.targetPct)}</span><span>{trade.changePct > 0 ? '+' : ''}{pct(trade.changePct)}</span><span>{money(trade.amount)}</span></div>)}</div>
    </section>

    <section className="stage5-delivery panel"><div className="panel-title"><CheckCircle2 size={16}/><h2>Stage 5 Delivery</h2></div><div><span>Institutional mandate controls</span><span>Ranked strategy generation</span><span>Transparent constraint engine</span><span>Efficient-frontier visualization</span><span>Stress-test matrix</span><span>Rebalance transition plan</span><span>Multi-year income projections</span><span>Modeled-data confidence controls</span></div></section>
  </div>
}
