import { ArrowRight, BookOpenCheck, Search, ShieldAlert, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePortfolio } from '../features/portfolio/PortfolioContext'
import { buildEtfResearchProfileV2, compareResearchProfiles, searchResearchUniverse } from '../domain/etf-research/researchEngineV2'

export function ResearchPage() {
  const { holdings } = usePortfolio()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const categories = ['All', ...Array.from(new Set(holdings.map(item => item.category)))]
  const filtered = useMemo(() => searchResearchUniverse(query, holdings).filter(item => category === 'All' || item.category === category), [query, category, holdings])
  const profiles = useMemo(() => filtered.map(item => buildEtfResearchProfileV2(item, holdings)), [filtered, holdings])
  const leaders = compareResearchProfiles(profiles)

  return <div>
    <section className="page-heading"><div><span className="eyebrow">STAGE 3 · ETF RESEARCH ENGINE</span><h1>ETF Research Terminal</h1><p>Explainable ETF research connected to portfolio fit, income characteristics, strategy risk, and data-confidence controls.</p></div><div className="heading-badge"><BookOpenCheck size={18}/> RESEARCH ENGINE V2</div></section>

    <section className="stage3-summary-grid">
      <article className="panel stage3-stat"><small>Research profiles</small><strong>{profiles.length}</strong><span>Portfolio-connected records</span></article>
      <article className="panel stage3-stat"><small>Best modeled fit</small><strong>{leaders?.bestPortfolioFit.ticker ?? '—'}</strong><span>{leaders?.bestPortfolioFit.portfolioFit.fitScore ?? 0}/100 fit score</span></article>
      <article className="panel stage3-stat"><small>Best risk balance</small><strong>{leaders?.bestRiskBalance.ticker ?? '—'}</strong><span>{leaders?.bestRiskBalance.dimensions[2].score ?? 0}/100</span></article>
      <article className="panel stage3-stat warning"><small>Provider status</small><strong>OFFLINE</strong><span>Issuer facts remain unverified</span></article>
    </section>

    <section className="panel research-toolbar">
      <label className="research-search"><Search size={18}/><input aria-label="Search ETF intelligence" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search ticker, strategy, category, or frequency…"/></label>
      <label className="research-filter"><SlidersHorizontal size={16}/><select aria-label="Filter research category" value={category} onChange={event => setCategory(event.target.value)}>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
    </section>

    <section className="research-grid research-grid-v2">{profiles.map(profile => <article className="panel fund-card research-card-v2" key={profile.ticker}>
      <div className="fund-card-top"><div><span className="ticker">{profile.ticker}</span><h3>{profile.name}</h3><p>{profile.category}</p></div><span className={`risk-pill ${profile.riskLevel.toLowerCase()}`}>{profile.riskLevel}</span></div>
      <p className="research-card-summary">{profile.summary}</p>
      <div className="fund-stat-grid"><div><small>Indicated yield</small><strong>{profile.distribution.indicatedYieldPct.toFixed(1)}%</strong></div><div><small>Portfolio fit</small><strong>{profile.portfolioFit.fitScore}/100</strong></div><div><small>Income share</small><strong>{profile.portfolioFit.contributionToPortfolioIncomePct.toFixed(1)}%</strong></div><div><small>Research confidence</small><strong>{profile.dataQuality}/100</strong></div></div>
      <div className="mini-score-row">{profile.dimensions.slice(0,4).map(metric => <div key={metric.id}><span>{metric.label}</span><div className="mini-score-track"><i style={{width:`${metric.score}%`}}/></div><b>{metric.score}</b></div>)}</div>
      <div className="research-warning"><ShieldAlert size={15}/>{profile.considerations[0]}</div>
      <Link className="primary-button research-open" to={`/research/${profile.ticker}`}>Open full research <ArrowRight size={15}/></Link>
    </article>)}</section>
    {!profiles.length && <article className="panel empty-research">No ETF research profiles match the current filters.</article>}
  </div>
}
