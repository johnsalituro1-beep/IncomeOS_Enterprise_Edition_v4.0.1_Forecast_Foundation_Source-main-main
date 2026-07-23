import { AlertTriangle, BrainCircuit, Gauge, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { usePortfolio, usePortfolioMetrics } from '../features/portfolio/PortfolioContext'
import { analyzePortfolioIntelligence } from '../domain/portfolio-intelligence/intelligenceEngineV2'
import { calculateIncomeOSScoreV2 } from '../domain/operating-score/incomeOperatingSystemScoreV2'

const pct=(n:number)=>`${n.toFixed(1)}%`
const money=(n:number)=>n.toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0})

export function StageTwoBuildPage(){
 const {holdings,weeklyGoal}=usePortfolio()
 const metrics=usePortfolioMetrics()
 const intel=analyzePortfolioIntelligence(holdings)
 const score=calculateIncomeOSScoreV2(holdings,weeklyGoal)
 return <section className="stage-two-page">
  <div className="page-heading">
   <div><div className="eyebrow">VERSION 8 · STAGE 2</div><h1>Portfolio Intelligence Layer</h1><p>Explainable portfolio diagnostics, transparent scoring, concentration monitoring, and prioritized improvement actions. Current results use modeled portfolio inputs until verified ETF history is connected.</p></div>
   <div className="stage-badge"><BrainCircuit size={16}/> INTELLIGENCE CORE ACTIVE</div>
  </div>

  <div className="stage-summary-grid">
   <article className="stage-summary-card"><Gauge/><span>INTELLIGENCE COMPOSITE</span><strong>{intel.composite}/100 · {intel.grade}</strong><small>Eight explainable dimensions</small></article>
   <article className="stage-summary-card"><Sparkles/><span>INCOME OS SCORE</span><strong>{score.total}/100 · {score.grade}</strong><small>{score.confidence} confidence</small></article>
   <article className="stage-summary-card"><TrendingUp/><span>MODELED WEEKLY INCOME</span><strong>{money(metrics.weeklyIncome)}</strong><small>{pct(metrics.goalProgress)} of {money(weeklyGoal)} goal</small></article>
   <article className="stage-summary-card"><ShieldCheck/><span>TOP-THREE CONCENTRATION</span><strong>{pct(intel.concentration.topThreeWeight)}</strong><small>{intel.concentration.categoryCount} strategy categories</small></article>
  </div>

  <div className="stage-two-main-grid">
   <article className="stage-panel score-hero">
    <div className="panel-title"><div><small>INCOME OPERATING SYSTEM SCORE™</small><h2>{score.headline}</h2></div><span className={`score-grade grade-${score.grade.toLowerCase()}`}>{score.grade}</span></div>
    <div className="score-meter"><i style={{width:`${score.total}%`}}/></div>
    <p className="model-note">{score.priority}</p>
    <div className="os-component-grid">{score.components.map(c=><div key={c.key}><header><strong>{c.label}</strong><b>{c.score}</b></header><i><em style={{width:`${c.score}%`}}/></i><p>{c.explanation}</p><small>Weight {(c.weight*100).toFixed(0)}%</small></div>)}</div>
   </article>

   <article className="stage-panel">
    <div className="panel-title"><div><small>PORTFOLIO RISK MONITOR</small><h2>Active Intelligence Alerts</h2></div><AlertTriangle size={19}/></div>
    <div className="intelligence-alerts">{intel.alerts.map((a,i)=><div className={`alert-${a.severity}`} key={`${a.title}-${i}`}><span>{a.severity}</span><strong>{a.title}</strong><p>{a.detail}</p><small>{a.action}</small></div>)}</div>
   </article>
  </div>

  <article className="stage-panel">
   <div className="panel-title"><div><small>EXPLAINABLE ANALYTICS</small><h2>Portfolio Intelligence Dimensions</h2></div><span className="data-label">MODELED DATA</span></div>
   <div className="intelligence-metric-grid">{intel.metrics.map(m=><article key={m.key} className={`metric-${m.band}`}><header><div><small>{m.band}</small><h3>{m.label}</h3></div><strong>{m.score}</strong></header><i><em style={{width:`${m.score}%`}}/></i><p>{m.summary}</p><ul>{m.drivers.map(d=><li key={d}>{d}</li>)}</ul><footer><b>Next action</b><span>{m.action}</span></footer></article>)}</div>
  </article>

  <div className="stage-two-bottom-grid">
   <article className="stage-panel"><div className="panel-title"><div><small>CONSTRUCTION SNAPSHOT</small><h2>Portfolio Structure</h2></div></div><div className="structure-list"><div><span>Largest holding</span><strong>{intel.concentration.largestTicker} · {pct(intel.concentration.largestWeight)}</strong></div><div><span>Top three holdings</span><strong>{pct(intel.concentration.topThreeWeight)}</strong></div><div><span>Portfolio yield</span><strong>{pct(intel.income.portfolioYield)}</strong></div><div><span>Highest modeled yield</span><strong>{intel.income.highestYieldTicker} · {pct(intel.income.highestYield)}</strong></div><div><span>Annual income</span><strong>{money(intel.income.annual)}</strong></div></div></article>
   <article className="stage-panel"><div className="panel-title"><div><small>STAGE 2 DELIVERY</small><h2>What This Increment Adds</h2></div></div><div className="delivery-list"><span>✓ Eight-dimension intelligence engine</span><span>✓ Income OS Score v2 with weighted contributions</span><span>✓ Concentration and strategy-risk alerts</span><span>✓ Explainable drivers and improvement actions</span><span>✓ Model-confidence labeling</span><span>✓ Shared analytics foundation for Copilot and Digital Twin</span></div></article>
  </div>
 </section>
}
