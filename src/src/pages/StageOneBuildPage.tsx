import { useMemo, useState } from 'react'
import { Bot, Database, FlaskConical, Play, ShieldCheck } from 'lucide-react'
import { usePortfolio, usePortfolioMetrics } from '../features/portfolio/PortfolioContext'
import { answerCopilotQuestion } from '../domain/copilot-v2/copilotRuntime'
import { createTwinPlan, runDigitalTwinV2, type MarketRegime } from '../domain/digital-twin/digitalTwinV2'
import { evaluateUniverseQuality, searchUniverse, stageOneUniverseSeed } from '../domain/etf-universe/universeCore'
import { calculateIncomeOSScore } from '../domain/operating-score/incomeOperatingSystemScore'

const money=(n:number)=>n.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0})

export function StageOneBuildPage(){
 const {holdings,weeklyGoal}=usePortfolio()
 const metrics=usePortfolioMetrics()
 const [question,setQuestion]=useState('What is the biggest risk in my portfolio?')
 const [copilot,setCopilot]=useState(()=>answerCopilotQuestion(question,holdings,weeklyGoal))
 const [years,setYears]=useState(10)
 const [reinvestment,setReinvestment]=useState(30)
 const [monthlyContribution,setMonthlyContribution]=useState(0)
 const [regime,setRegime]=useState<MarketRegime>('base')
 const [query,setQuery]=useState('')
 const twin=useMemo(()=>{
  const plan=createTwinPlan('Stage 1 Base Twin',holdings)
  plan.assumptions={...plan.assumptions,years,reinvestmentPct:reinvestment,monthlyContribution,marketRegime:regime}
  return runDigitalTwinV2(plan,holdings)
 },[holdings,years,reinvestment,monthlyContribution,regime])
 const score=useMemo(()=>calculateIncomeOSScore(holdings,metrics.weeklyIncome,weeklyGoal),[holdings,metrics.weeklyIncome,weeklyGoal])
 const quality=evaluateUniverseQuality(stageOneUniverseSeed)
 const universe=searchUniverse(stageOneUniverseSeed,query)
 return <div className="stage-one-page">
  <div className="page-heading"><div><span className="eyebrow">VERSION 7 · STAGE 1</span><h1>Intelligence Core Build</h1><p>ETF Universe foundation, persistent Digital Twin modeling, explainable Copilot runtime, and the Income OS Score working from one portfolio model.</p></div><div className="stage-badge"><ShieldCheck size={18}/> OFFLINE FOUNDATION ACTIVE</div></div>

  <section className="stage-summary-grid">
   <article className="stage-summary-card"><Database/><span>ETF Universe</span><strong>{stageOneUniverseSeed.length} seed records</strong><small>Provider-ready schema and quality controls</small></article>
   <article className="stage-summary-card"><FlaskConical/><span>Digital Twin</span><strong>{money(twin.endingPortfolioValue)}</strong><small>Projected nominal value in year {years}</small></article>
   <article className="stage-summary-card"><Bot/><span>Income Copilot</span><strong>{copilot.confidence.toUpperCase()}</strong><small>Explainable response confidence</small></article>
   <article className="stage-summary-card"><ShieldCheck/><span>Income OS Score</span><strong>{score.total}/100 · {score.grade}</strong><small>Weakest: {score.weakest.label}</small></article>
  </section>

  <section className="stage-panel">
   <div className="panel-title"><div><span className="eyebrow">INCOME DIGITAL TWIN™ V2</span><h2>Scenario Control Room</h2></div><span className={`twin-status ${twin.sustainabilityFlag}`}>{twin.sustainabilityFlag}</span></div>
   <div className="twin-controls">
    <label>Years<input type="range" min="1" max="30" value={years} onChange={e=>setYears(Number(e.target.value))}/><b>{years}</b></label>
    <label>Reinvestment<input type="range" min="0" max="100" value={reinvestment} onChange={e=>setReinvestment(Number(e.target.value))}/><b>{reinvestment}%</b></label>
    <label>Monthly contribution<input type="number" min="0" step="100" value={monthlyContribution} onChange={e=>setMonthlyContribution(Number(e.target.value))}/></label>
    <label>Market regime<select value={regime} onChange={e=>setRegime(e.target.value as MarketRegime)}><option value="base">Base</option><option value="recession">Recession</option><option value="high-inflation">High inflation</option><option value="bull">Bull</option></select></label>
   </div>
   <div className="twin-result-grid"><div><span>Ending nominal value</span><strong>{money(twin.endingPortfolioValue)}</strong></div><div><span>Inflation-adjusted value</span><strong>{money(twin.endingRealValue)}</strong></div><div><span>Ending weekly income</span><strong>{money(twin.endingWeeklyIncome)}</strong></div><div><span>Total withdrawn</span><strong>{money(twin.totalWithdrawn)}</strong></div></div>
   <div className="twin-table"><table><thead><tr><th>Year</th><th>Portfolio</th><th>Real Value</th><th>Weekly Income</th><th>Reinvested</th><th>Withdrawn</th></tr></thead><tbody>{twin.timeline.slice(0,10).map(row=><tr key={row.year}><td>{row.year}</td><td>{money(row.nominalPortfolioValue)}</td><td>{money(row.realPortfolioValue)}</td><td>{money(row.weeklyIncome)}</td><td>{money(row.reinvestedIncome)}</td><td>{money(row.withdrawnIncome)}</td></tr>)}</tbody></table></div>
  </section>

  <div className="stage-two-column">
   <section className="stage-panel"><div className="panel-title"><div><span className="eyebrow">INCOME COPILOT™ RUNTIME</span><h2>Explainable Portfolio Q&A</h2></div><Bot size={22}/></div><div className="copilot-entry"><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')setCopilot(answerCopilotQuestion(question,holdings,weeklyGoal))}}/><button onClick={()=>setCopilot(answerCopilotQuestion(question,holdings,weeklyGoal))}><Play size={15}/> Analyze</button></div><div className="copilot-answer"><span>{copilot.intent.toUpperCase()} · {copilot.confidence} confidence</span><h3>{copilot.headline}</h3><p>{copilot.answer}</p>{copilot.verifiedDataRequired&&<div className="data-warning">Verified provider data required before treating research facts as current.</div>}<div className="evidence-grid">{copilot.evidence.map(e=><div key={e.label}><small>{e.label}</small><strong>{e.value}</strong><em>{e.source}</em></div>)}</div><h4>Next actions</h4>{copilot.nextActions.map(a=><p className="next-action" key={a}>→ {a}</p>)}</div></section>

   <section className="stage-panel"><div className="panel-title"><div><span className="eyebrow">ETF UNIVERSE FOUNDATION</span><h2>Research Data Quality</h2></div><Database size={22}/></div><div className="quality-strip"><div><span>Quality score</span><strong>{quality.score}</strong></div><div><span>Completeness</span><strong>{quality.completenessPct.toFixed(0)}%</strong></div><div><span>Verified data</span><strong>{quality.verifiedPct.toFixed(0)}%</strong></div></div><input className="universe-search" placeholder="Search seed universe…" value={query} onChange={e=>setQuery(e.target.value)}/><div className="universe-list">{universe.map(etf=><article key={etf.ticker}><div><strong>{etf.ticker}</strong><span>{etf.name}</span></div><div><span>{etf.category}</span><span>{etf.distributionFrequency}</span><em>{etf.confidence}</em></div></article>)}</div><p className="model-note">The current seed records are modeled placeholders. The provider interface and data-quality engine are ready for verified U.S.-listed ETF master data.</p></section>
  </div>
 </div>
}
