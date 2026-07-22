import { Activity, AlertTriangle, ArrowUpRight, BrainCircuit, CheckCircle2, Database, Gauge, ShieldCheck, Sparkles, Target } from 'lucide-react'
import { demoAssessment, demoRecommendations, demoTimeline } from '../domain/income-os-intelligence/seed'

const pct = (v:number) => `${Math.max(0,Math.min(100,v))}%`

export function IncomeOSIntelligencePage(){
  return <div className="income-os-page">
    <div className="page-heading"><div><span className="eyebrow">PROGRAM D · VERSION 24</span><h1>Income Operating System™ Intelligence</h1><p>One explainable intelligence layer for portfolio health, score attribution, and prioritized action.</p></div><div className="os-live"><span></span><div><small>INTELLIGENCE SERVICE</small><strong>ACTIVE · MODELED DATA</strong></div></div></div>

    <section className="os-hero panel">
      <div className={`os-score-ring health-${demoAssessment.health}`}><Gauge size={28}/><strong>{demoAssessment.score}</strong><span>Income OS Score™</span></div>
      <div className="os-hero-copy"><span className="eyebrow">PORTFOLIO HEALTH</span><h2>{demoAssessment.health === 'strong' ? 'Strong, with concentration pressure' : demoAssessment.health}</h2><p>Your portfolio is close to its weekly income objective. The greatest opportunities are concentration control, resilience, and verified data coverage.</p><div className="os-meta"><span><ShieldCheck size={15}/> {demoAssessment.confidence}% confidence</span><span><Target size={15}/> $155/week goal gap</span><span><Activity size={15}/> +7 points in 6 months</span></div></div>
      <div className="os-kpis"><div><small>Projected coverage</small><strong>18.6 yrs</strong></div><div><small>Weekly income</small><strong>$1,845</strong></div><div><small>Critical findings</small><strong>0</strong></div><div><small>Actionable findings</small><strong>{demoRecommendations.length}</strong></div></div>
    </section>

    <div className="os-grid">
      <section className="panel os-components"><div className="panel-title"><BrainCircuit/><div><strong>Component score system</strong><span>Weighted, confidence-aware, and fully attributable</span></div></div>{demoAssessment.components.map(c=><div className="os-component" key={c.key}><div><strong>{c.label}</strong><small>{c.direction} · {c.confidence}% confidence</small></div><div className="os-bar"><i style={{width:pct(c.score)}}></i></div><b>{c.score}</b><button title={c.factors.map(f=>`${f.label}: ${f.detail}`).join('\n')}>Why?</button></div>)}</section>
      <section className="panel"><div className="panel-title"><Sparkles/><div><strong>Prioritized recommendation queue</strong><span>Ranked by severity, estimated impact, and evidence</span></div></div><div className="os-recommendations">{demoRecommendations.map(r=><article key={r.id} className={`priority-${r.priority}`}><div className="rec-head"><span>{r.priority}</span><em>+{r.estimatedImpact} pts potential</em></div><h3>{r.title}</h3><p>{r.rationale}</p><small>Reason codes: {r.reasonCodes.join(' · ') || 'REVIEW_COMPONENT'}</small><button>Open in Decision Studio <ArrowUpRight size={14}/></button></article>)}</div></section>
    </div>

    <div className="os-grid lower">
      <section className="panel"><div className="panel-title"><Activity/><div><strong>Historical score timeline</strong><span>Portfolio events remain attached to score changes</span></div></div><div className="score-chart">{demoTimeline.map((p,i)=><div className="score-column" key={p.date}><div className="score-point" style={{height:`${p.overall}%`}} title={`${p.date}: ${p.overall}`}></div><strong>{p.overall}</strong><span>{p.date}</span>{p.event&&<small>{p.event}</small>}</div>)}</div></section>
      <section className="panel"><div className="panel-title"><Database/><div><strong>Explainability & evidence ledger</strong><span>Every output carries source classification and confidence</span></div></div><div className="evidence-ledger"><div><CheckCircle2/><span><strong>22 supporting signals</strong><small>User portfolio and modeled scenario evidence</small></span><em>CONNECTED</em></div><div><AlertTriangle/><span><strong>5 provider records need verification</strong><small>Distribution reliability and issuer metadata</small></span><em>REVIEW</em></div><div><ShieldCheck/><span><strong>No silent portfolio changes</strong><small>Recommendations require explicit user action</small></span><em>ENFORCED</em></div></div></section>
    </div>
  </div>
}
