import { ArrowLeft, BadgeDollarSign, Database, Layers3, ShieldCheck, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { buildEtfResearchProfileV2 } from '../domain/etf-research/researchEngineV2'
import { usePortfolio } from '../features/portfolio/PortfolioContext'

const money = (value:number) => value.toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0})

export function EtfResearchProfilePage(){
  const { ticker = '' } = useParams()
  const { holdings } = usePortfolio()
  const holding = holdings.find(item => item.ticker.toLowerCase() === ticker.toLowerCase())
  if(!holding) return <div><Link className="back-link" to="/research"><ArrowLeft size={15}/> Research Terminal</Link><article className="panel empty-research">No local research record exists for {ticker.toUpperCase()}.</article></div>
  const profile = buildEtfResearchProfileV2(holding, holdings)
  return <div>
    <Link className="back-link" to="/research"><ArrowLeft size={15}/> Research Terminal</Link>
    <section className="page-heading research-profile-heading"><div><span className="eyebrow">ETF RESEARCH PROFILE · MODELED DATA</span><h1>{profile.ticker} <small>{profile.name}</small></h1><p>{profile.summary}</p></div><div className="profile-score-ring"><strong>{profile.portfolioFit.fitScore}</strong><span>PORTFOLIO FIT</span></div></section>

    <section className="research-profile-kpis">
      <article className="panel"><BadgeDollarSign size={19}/><small>Modeled annual income</small><strong>{money(profile.portfolioFit.projectedAnnualIncome)}</strong><span>{profile.portfolioFit.contributionToPortfolioIncomePct.toFixed(1)}% of portfolio income</span></article>
      <article className="panel"><ShieldCheck size={19}/><small>Risk profile</small><strong>{profile.riskLevel}</strong><span>{profile.distribution.sustainabilityFlag}</span></article>
      <article className="panel"><Layers3 size={19}/><small>Portfolio weight</small><strong>{profile.portfolioFit.currentWeightPct.toFixed(1)}%</strong><span>{profile.portfolioFit.role}</span></article>
      <article className="panel"><Database size={19}/><small>Data confidence</small><strong>{profile.dataQuality}/100</strong><span>Provider connection pending</span></article>
    </section>

    <section className="research-profile-layout">
      <div className="research-main-column">
        <article className="panel research-section"><div className="panel-title"><Sparkles size={17}/><h2>Strategy & portfolio role</h2></div><p>{profile.strategy}</p><div className="role-banner"><span>MODELED ROLE</span><strong>{profile.role}</strong></div></article>
        <article className="panel research-section"><div className="panel-title"><h2>Research scorecard</h2></div><div className="research-scorecard">{profile.dimensions.map(item => <div key={item.id}><div><strong>{item.label}</strong><span>{item.explanation}</span></div><div className="scorebar"><i style={{width:`${item.score}%`}}/></div><b>{item.score}</b></div>)}</div></article>
        <article className="panel research-section"><div className="panel-title"><h2>Distribution intelligence</h2></div><div className="distribution-grid"><div><small>Annual distribution/share</small><strong>${profile.distribution.annualDistributionPerShare.toFixed(2)}</strong></div><div><small>Estimated weekly/share</small><strong>${profile.distribution.estimatedWeeklyPerShare.toFixed(3)}</strong></div><div><small>Indicated yield</small><strong>{profile.distribution.indicatedYieldPct.toFixed(2)}%</strong></div><div><small>Cadence</small><strong>{profile.distribution.cadence}</strong></div></div><p>{profile.distribution.explanation}</p></article>
        <article className="panel research-section"><div className="panel-title"><h2>Evidence ledger</h2></div><div className="evidence-table">{profile.evidence.map(item => <div key={item.label}><span className={`evidence-status ${item.status}`}>{item.status}</span><strong>{item.label}</strong><b>{item.value}</b><small>{item.note}</small></div>)}</div></article>
      </div>
      <aside className="research-side-column">
        <article className="panel research-section"><div className="panel-title"><h2>Strengths</h2></div><ul className="research-list positive">{profile.strengths.map(item => <li key={item}>{item}</li>)}</ul></article>
        <article className="panel research-section"><div className="panel-title"><h2>Considerations</h2></div><ul className="research-list caution">{profile.considerations.map(item => <li key={item}>{item}</li>)}</ul></article>
        <article className="panel research-section"><div className="panel-title"><h2>Portfolio-fit observations</h2></div><ul className="research-list">{profile.portfolioFit.observations.map(item => <li key={item}>{item}</li>)}</ul></article>
        <article className="panel research-section"><div className="panel-title"><h2>Modeled peers</h2></div><div className="peer-grid">{profile.peers.map(peer => <span key={peer}>{peer}</span>)}</div><small className="provider-note">Peer relationships require ETF Universe provider verification before production use.</small></article>
      </aside>
    </section>
  </div>
}
