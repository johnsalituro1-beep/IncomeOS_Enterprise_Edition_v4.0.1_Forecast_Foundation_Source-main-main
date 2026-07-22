import { useMemo, useState } from 'react'
import { Bot, GitCompareArrows, Lightbulb, Play, ShieldAlert, Sparkles } from 'lucide-react'
import { answerPortfolioQuestion } from '../domain/copilot-v3/copilotCore'
import { comparePortfolios, evaluatePortfolio } from '../domain/copilot-v3/portfolioAdvisor'
import { runDecisionSimulation } from '../domain/copilot-v3/decisionStudio'
import type { CopilotPortfolioSnapshot } from '../domain/copilot-v3/types'

const current: CopilotPortfolioSnapshot = { id:'current',name:'Current Income Portfolio',marketValue:350000,weeklyIncome:1465,osScore:74,riskScore:63,holdings:[{ticker:'EDGQ',weight:29,yield:13,risk:52},{ticker:'EDGX',weight:22,yield:12,risk:55},{ticker:'KYLD',weight:20,yield:25,risk:72},{ticker:'XDTE',weight:14,yield:22,risk:69},{ticker:'BCCC',weight:15,yield:31,risk:81}] }
const safer: CopilotPortfolioSnapshot = { id:'safer',name:'Balanced Income Branch',marketValue:350000,weeklyIncome:1280,osScore:82,riskScore:51,holdings:[{ticker:'EDGQ',weight:30,yield:13,risk:52},{ticker:'EDGX',weight:25,yield:12,risk:55},{ticker:'XDTE',weight:15,yield:22,risk:69},{ticker:'SCHD',weight:20,yield:4,risk:34},{ticker:'SGOV',weight:10,yield:5,risk:10}] }
const prompts=['How is my portfolio doing?','Increase my income to $2,000 per week','Why is my risk score elevated?','What if I reinvest 50%?','Replace my highest-risk ETF']

export function IncomeCopilotPage(){
  const [question,setQuestion]=useState(prompts[1])
  const [answer,setAnswer]=useState(()=>answerPortfolioQuestion(prompts[1],current))
  const findings=useMemo(()=>evaluatePortfolio(current),[])
  const comparison=useMemo(()=>comparePortfolios(current,safer),[])
  const simulation=useMemo(()=>runDecisionSimulation(current,{label:'50% reinvestment for 10 years',incomeChangePct:0,returnChangePct:-.5,reinvestPct:50,horizonYears:10}),[])
  const ask=()=>setAnswer(answerPortfolioQuestion(question,current))
  return <section className="copilot-page">
    <div className="page-heading"><div><span className="eyebrow">PROGRAM C · VERSIONS 21–23</span><h1>Income Copilot™ Decision Studio</h1><p>Portfolio-grounded answers, explainable advisor findings, and reproducible Digital Twin simulations.</p></div><div className="copilot-status"><Sparkles size={18}/><div><small>ENGINE STATUS</small><strong>Offline intelligence ready</strong></div></div></div>

    <div className="copilot-grid">
      <article className="panel copilot-console"><div className="panel-title"><Bot size={18}/><div><strong>Version 21 · Copilot Core</strong><span>Ask questions using portfolio and ETF intelligence context</span></div></div>
        <div className="prompt-chips">{prompts.map(p=><button key={p} onClick={()=>{setQuestion(p);setAnswer(answerPortfolioQuestion(p,current))}}>{p}</button>)}</div>
        <div className="copilot-input"><textarea value={question} onChange={e=>setQuestion(e.target.value)} aria-label="Ask Income Copilot"/><button onClick={ask}><Play size={16}/>Analyze</button></div>
        <div className="copilot-answer"><div className="answer-header"><span>{answer.intent.replaceAll('-',' ')}</span><strong>{answer.confidence}% confidence</strong></div><h2>{answer.headline}</h2><p>{answer.narrative}</p><ul>{answer.bullets.map(x=><li key={x}>{x}</li>)}</ul><div className="answer-actions">{answer.actions.map(a=><button key={a.id}>{a.label}</button>)}</div><div className="evidence-row">{answer.citations.map(c=><span key={c.sourceId}><b>{c.evidence}</b>{c.label}</span>)}</div><small className="disclaimer">{answer.disclaimer}</small></div>
      </article>

      <article className="panel"><div className="panel-title"><Lightbulb size={18}/><div><strong>Version 22 · Portfolio Advisor</strong><span>Prioritized opportunities and risks</span></div></div><div className="advisor-findings">{findings.map(f=><div className={`advisor-${f.severity}`} key={f.title}><span>{f.severity}</span><div><strong>{f.title}</strong><p>{f.explanation}</p><small>{f.impact}</small></div><button>{f.action}</button></div>)}</div></article>
    </div>

    <div className="copilot-grid lower">
      <article className="panel"><div className="panel-title"><GitCompareArrows size={18}/><div><strong>Portfolio comparison</strong><span>Current portfolio vs balanced branch</span></div></div><div className="comparison-cards"><div><small>Weekly income change</small><strong>{comparison.weeklyIncomeDelta>=0?'+':''}${comparison.weeklyIncomeDelta}</strong></div><div><small>OS Score change</small><strong>+{comparison.osScoreDelta}</strong></div><div><small>Risk change</small><strong>{comparison.riskDelta}</strong></div><div><small>Preferred health profile</small><strong>{comparison.winner}</strong></div></div></article>
      <article className="panel"><div className="panel-title"><ShieldAlert size={18}/><div><strong>Version 23 · Decision Studio</strong><span>{simulation.scenario}</span></div></div><div className="decision-metrics"><div><small>Weekly income</small><strong>${simulation.projectedWeeklyIncome.toFixed(0)}</strong><span>Baseline ${simulation.baselineWeeklyIncome}</span></div><div><small>10-year value</small><strong>${Math.round(simulation.projectedValueAtHorizon).toLocaleString()}</strong><span>Baseline ${Math.round(simulation.baselineValueAtHorizon).toLocaleString()}</span></div><div><small>Modeled success</small><strong>{simulation.successProbability.toFixed(0)}%</strong><span>Development assumptions</span></div></div><div className="tradeoff-list">{simulation.tradeoffs.map(t=><span key={t}>{t}</span>)}</div><button className="decision-button">Open reproducible Digital Twin branch</button></article>
    </div>
  </section>
}
