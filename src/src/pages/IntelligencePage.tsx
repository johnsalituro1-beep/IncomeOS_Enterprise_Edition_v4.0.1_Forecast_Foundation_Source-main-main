import { BrainCircuit, Camera, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { IncomeIntelligencePanel } from '../components/intelligence/IncomeIntelligencePanel'
import { PortfolioHealthCard } from '../components/command/PortfolioHealthCard'
import { usePortfolio } from '../features/portfolio/PortfolioContext'
import { createPortfolioSnapshot, loadPortfolioSnapshots, savePortfolioSnapshot } from '../services/history/portfolioFlightRecorder'

const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function IntelligencePage() {
  const { holdings, weeklyGoal } = usePortfolio()
  const [snapshots, setSnapshots] = useState(() => loadPortfolioSnapshots())
  const latest = useMemo(() => snapshots[snapshots.length - 1], [snapshots])
  const capture = () => setSnapshots(savePortfolioSnapshot(createPortfolioSnapshot(holdings, weeklyGoal)))
  return <div>
    <section className="page-heading"><div><span className="eyebrow">INCOME OS / INTELLIGENCE</span><h1>Income Intelligence Center</h1><p>Explainable analytics, portfolio-health diagnostics and historical portfolio snapshots.</p></div><button className="gold-button" type="button" onClick={capture}><Camera size={15}/> Capture snapshot</button></section>
    <section className="intelligence-page-grid"><PortfolioHealthCard/><IncomeIntelligencePanel/></section>
    <article className="panel flight-recorder-panel"><div className="panel-heading"><div><span className="eyebrow">PORTFOLIO FLIGHT RECORDER</span><h3>Historical state tracking</h3></div><ShieldCheck size={18}/></div>
      {latest ? <div className="flight-recorder-summary"><div><small>LAST CAPTURE</small><strong>{new Date(latest.capturedAt).toLocaleString()}</strong></div><div><small>PORTFOLIO VALUE</small><strong>{money(latest.portfolioValue)}</strong></div><div><small>ANNUAL INCOME</small><strong>{money(latest.annualIncome)}</strong></div><div><small>HEALTH</small><strong>{latest.healthScore}/100</strong></div><div><small>SNAPSHOTS</small><strong>{snapshots.length}</strong></div></div> : <div className="empty-state"><BrainCircuit size={28}/><strong>No snapshots yet</strong><p>Capture the portfolio to begin building a historical record of income, value and health.</p></div>}
    </article>
  </div>
}
